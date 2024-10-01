import {SupabaseClient} from '@supabase/supabase-js';
import {Expense, ParticipantsData} from '@/domain/Expense.ts';
import {sanitizeParticipants} from '@/domain/GroupParticipant.ts';
import {Settlement} from '@/domain/Settlement.ts';
import {AddExpenseParams, Balances, DetailedDebts} from '@/domain/expenses/types.ts';
import {ExpenseResource} from '@/resourses/ExpenseResource.ts';

export const calculateBalances = (expenses: Expense[], settlements: Settlement[]) => {
  // Initialize balances object
  const balances: Balances = {};

  // Calculate balances
  expenses.forEach((expense) => {
    const paidBy = expense.paid_by.id;
    const totalAmount = expense.amount;

    // Initialize balance for payer if not present
    if (!balances[paidBy]) {
      balances[paidBy] = 0;
    }

    // Add the total amount to the payer's balance
    balances[paidBy] += totalAmount;

    // Process each participant
    expense.participants.forEach((participant) => {
      const userId = participant.user_id;
      const amountOwed = participant.amount_owed;

      // Initialize balance for participant if not present
      if (!balances[userId]) {
        balances[userId] = 0;
      }

      // Subtract the amount owed from the participant's balance
      balances[userId] -= amountOwed;
    });
  });

  // Adjust balances based on settlements
  settlements.forEach((settlement) => {
    const payerId = settlement.payer_id;
    const payeeId = settlement.payee_id;
    const amount = settlement.amount;

    // Decrease payer's balance (they owe less)
    if (!balances[payerId]) {
      balances[payerId] = 0;
    }
    balances[payerId] += amount;

    // Decrease payee's balance (they are owed less)
    if (!balances[payeeId]) {
      balances[payeeId] = 0;
    }
    balances[payeeId] -= amount;
  });

  return balances;
};

export class ExpenseService {
  supabaseInstance: SupabaseClient
  expenseResource: ExpenseResource

  constructor(supaBaseInstance: SupabaseClient, expenseResource: ExpenseResource) {
    this.supabaseInstance = supaBaseInstance;
    this.expenseResource = expenseResource;
  }

  fetchExpenses = async (groupId: string) => {
    const {data} = await this.expenseResource.fetchExpenses(groupId);
    return data || [];
  };


  async fetchGroupParticipants(groupId: string) {
    const {data, error} = await this.supabaseInstance
      .from('group_participants')
      .select('user_id, details:users(name, auth_id)')
      .eq('group_id', groupId)
      .eq('status', 'accepted') as any;

    if (error) {
      return {data: null, error};
    }

    const participants = sanitizeParticipants(data)

    return {data: participants, error: null};
  };


  async addExpense(groupId: string, expense: AddExpenseParams) {
    const {selectedParticipantIds, participantShares} = expense.participantsData;
    const expenseToAdd = {
      group_id: groupId,
      description: expense.description,
      amount: expense.amount,
      currency: expense.currency,
      paid_by: expense.paidBy,
      share_type: expense.shareType,
      date: expense.date,
      note: expense.note,
    };

    const {participantShares: participantsData, error} = this.calculateParticipantShares(expense, selectedParticipantIds, participantShares);

    if (error) {
      return {error};
    }
    const {data: expenseData, error: expenseError} = await this.supabaseInstance
      .from('expenses')
      .insert([expenseToAdd])
      .select();

    if (expenseError || !expenseData) {
      return {error: expenseError || 'Failed to add expense.'};
    }

    const expenseId = expenseData[0].id;

    // Insert into expense_participants table
    const expenseParticipants = participantsData.map((p) => ({
      expense_id: expenseId,
      user_id: p.user_id,
      share_value: p.share_value,
      amount_owed: p.amount_owed,
      note: p.note,
    }));

    const {error: participantsError} = await this.supabaseInstance
      .from('expense_participants')
      .insert(expenseParticipants);

    if (participantsError) {
      return {error: participantsError};
    }

    return {error: null};
  };

  calculateParticipantShares(expense: AddExpenseParams, selectedParticipantIds: string[], participantShares: { [userId: string]: number }): ParticipantsData {
    let error = '';
    let participantData: any[] = [];

    if (expense.shareType === 'equal') {
      const splitAmount = expense.amount / selectedParticipantIds.length;
      participantData = selectedParticipantIds.map((userId) => ({
        user_id: userId,
        share_value: null,
        amount_owed: parseFloat(splitAmount.toFixed(2)),
        note: '',
      }));
    } else {
      let totalAdjusted = 0;
      selectedParticipantIds.forEach((userId) => {
        const share = participantShares[userId];
        if (share === undefined || share === null || isNaN(share)) {
          error = 'Please enter share values for all selected participants.';
          return;
        }
        totalAdjusted += share;
      });

      if (expense.shareType === 'unequal' && Math.abs(totalAdjusted - expense.amount) > 0.01) {
        error = 'Total amount must equal the expense amount.';
        return {participantShares: [], error};
      }

      if (expense.shareType === 'percentage' && Math.abs(totalAdjusted - 100) > 0.01) {
        error = 'Total percentage must equal 100%.';
        return {participantShares: [], error};
      }

      participantData = selectedParticipantIds.map((userId) => {
        const share = participantShares[userId];
        let amountOwed = 0;
        if (expense.shareType === 'unequal') {
          amountOwed = share;
        } else if (expense.shareType === 'percentage') {
          amountOwed = (expense.amount * share) / 100;
        }
        return {
          user_id: userId,
          share_value: share,
          amount_owed: parseFloat(amountOwed.toFixed(2)),
          note: '',
        };
      });
    }

    return {participantShares: participantData, error};
  }

  calculateIndividualDebts(expenses: Expense[], settlements: Settlement[]): DetailedDebts {
    const debts: DetailedDebts = {};

    // Process each expense
    expenses.forEach((expense) => {
      const paidBy = expense.paid_by.id;

      expense.participants.forEach((participant) => {
        const userId = participant.user_id;
        const amountOwed = participant.amount_owed;

        // Skip the payer's own share
        if (userId === paidBy) return;

        // Initialize debtor's record
        if (!debts[userId]) {
          debts[userId] = {};
        }

        // Initialize creditor's amount
        if (!debts[userId][paidBy]) {
          debts[userId][paidBy] = 0;
        }

        // Add the amount owed
        debts[userId][paidBy] += amountOwed;
      });
    });

    // Process settlements
    settlements.forEach((settlement) => {
      const payerId = settlement.payer_id;
      const payeeId = settlement.payee_id;
      const amount = settlement.amount;

      if (debts[payerId] && debts[payerId][payeeId]) {
        // Subtract the settled amount
        debts[payerId][payeeId] -= amount;

        // Remove zero or negative debts
        if (debts[payerId][payeeId] <= 0) {
          delete debts[payerId][payeeId];
        }

        // Clean up debtor's record if empty
        if (Object.keys(debts[payerId]).length === 0) {
          delete debts[payerId];
        }
      }
    });

    return debts;
  }

  async fetchExpenseById(id: string) {
    const {data, error} = await this.supabaseInstance
      .from('expenses')
      .select(`
        id,
        description,
        amount,
        currency,
        date,
        note,
        share_type,
        created_at,
        updated_at,
        paid_by:users!expenses_paid_by_fkey (id:auth_id, name),
        participants:expense_participants (
          user_id,
          amount_owed,
          details:users (auth_id, name)
        )
      `)
      .eq('id', id) as any;

    if (error || !data || data.length === 0) {
      return {data: null, error: error || 'Expense not found.'};
    }

    const expense = data[0] as Expense;

    return {data: expense, error: null};
  }

  async updateExpense(id: string, expense: AddExpenseParams) {
    const {selectedParticipantIds, participantShares} = expense.participantsData;
    const expenseToUpdate = {
      description: expense.description,
      amount: expense.amount,
      currency: expense.currency,
      paid_by: expense.paidBy,
      share_type: expense.shareType,
      date: expense.date,
      note: expense.note,
    };

    const {participantShares: participantsData, error} = this.calculateParticipantShares(expense, selectedParticipantIds, participantShares);

    if (error) {
      return {error};
    }

    const {error: updateError} = await this.supabaseInstance
      .from('expenses')
      .update(expenseToUpdate)
      .eq('id', id);

    if (updateError) {
      return {error: updateError};
    }

    // Update expense_participants table
    const expenseParticipants = participantsData.map((p) => ({
      expense_id: id,
      user_id: p.user_id,
      share_value: p.share_value,
      amount_owed: p.amount_owed,
      note: p.note,
    }));


    const {error: participantsError} = await this.supabaseInstance
      .from('expense_participants')
      .delete()
      .eq('expense_id', id);

    if (participantsError) {
      return {error: participantsError};
    }

    const {error: insertError} = await this.supabaseInstance
      .from('expense_participants')
      .insert(expenseParticipants);

    if (insertError) {
      return {error: insertError};
    }

    return {error: null};
  }
}