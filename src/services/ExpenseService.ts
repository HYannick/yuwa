import {SupabaseClient} from '@supabase/supabase-js';
import {Expense} from '@/domain/Expense.ts';
import {GroupParticipant, sanitizeParticipants} from '@/domain/GroupParticipant.ts';
import {Settlement} from '@/domain/Settlement.ts';

interface AddExpenseParams {
  groupId: string;
  description: string;
  amount: number;
  currency: string;
  paidBy: string; // user_id
  shareType: string;
  date: string; // ISO date string
  note: string;
  participants: {
    user_id: string;
    share_value: number | null;
    amount_owed: number;
    note: string;
  }[];
}
export interface DetailedDebts {
  [debtorId: string]: {
    [creditorId: string]: number;
  };
}
export type Balances = { [userId: string]: number }

export interface SimplifiedDebt {
  from: string; // Debtor
  to: string;   // Creditor
  amount: number;
}

export class ExpenseService {
  supabaseInstance: SupabaseClient

  constructor(supaBaseInstance: SupabaseClient) {
    this.supabaseInstance = supaBaseInstance;
  }

  fetchExpenses = async (groupId: string) => {
    const {data} = await this.supabaseInstance
      .from('expenses')
      .select(`
      id,
      description,
      amount,
      currency,
      date,
      note,
      created_at,
      updated_at,
      paid_by,
      users!expenses_paid_by_fkey (auth_id, name),
      participants:expense_participants (
        user_id,
        amount_owed,
        users (id, name)
      )
    `)
      .eq('group_id', groupId)
      .order('date', {ascending: false});

    return data || [];
  };
  calculateBalances(expenses: Expense[], settlements: Settlement[]) {
    // Initialize balances object
    const balances: Balances = {};

    // Calculate balances
    expenses.forEach((expense) => {
      const paidBy = expense.paid_by;
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


  async addExpense(params: AddExpenseParams) {
    const {data: expenseData, error: expenseError} = await this.supabaseInstance
      .from('expenses')
      .insert([
        {
          group_id: params.groupId,
          description: params.description,
          amount: params.amount,
          currency: params.currency,
          paid_by: params.paidBy,
          share_type: params.shareType,
          date: params.date,
          note: params.note,
        },
      ])
      .select();

    if (expenseError || !expenseData) {
      return {error: expenseError || 'Failed to add expense.'};
    }

    const expenseId = expenseData[0].id;

    // Insert into expense_participants table
    const expenseParticipants = params.participants.map((p) => ({
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

  simplifyDebts(balances: { [userId: string]: number }): SimplifiedDebt[] {
    const debts: SimplifiedDebt[] = [];

    // Create arrays of creditors and debtors
    const creditors = [];
    const debtors = [];

    for (const userId in balances) {
      const balance = balances[userId];
      if (balance > 0.01) {
        creditors.push({ userId, balance });
      } else if (balance < -0.01) {
        debtors.push({ userId, balance: -balance }); // Use positive value for owed amount
      }
    }

    // Sort creditors and debtors
    creditors.sort((a, b) => b.balance - a.balance); // Highest balance first
    debtors.sort((a, b) => b.balance - a.balance);   // Highest debt first

    let i = 0; // Debtor index
    let j = 0; // Creditor index

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      // Determine the amount to be transferred
      const amount = Math.min(debtor.balance, creditor.balance);

      // Record the debt
      debts.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: parseFloat(amount.toFixed(2)),
      });

      // Adjust the balances
      debtor.balance -= amount;
      creditor.balance -= amount;

      // Move to the next debtor or creditor if their balance is settled
      if (Math.abs(debtor.balance) < 0.01) {
        i += 1;
      }

      if (Math.abs(creditor.balance) < 0.01) {
        j += 1;
      }
    }

    return debts;
  };

  calculateIndividualDebts(expenses: Expense[], settlements: Settlement[]): DetailedDebts {
    const debts: DetailedDebts = {};

    // Process each expense
    expenses.forEach((expense) => {
      const paidBy = expense.paid_by;

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

}