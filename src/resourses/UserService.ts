import {AuthResource} from '@/resourses/AuthResource.ts';
import {UserResource} from '@/resourses/UserResource.ts';

export class UserService {
  authResource: AuthResource;
  userResource: UserResource;

  constructor(authResource: AuthResource, userResource: UserResource) {
    this.authResource = authResource;
    this.userResource = userResource;
  }

  async getUser() {
    const {data: {user}} = await this.authResource.getAuthenticatedUser();
    return this.userResource.getUser(user.id);
  }

  async getUserDebtsRecap(userId: string) {
    // Fetch expenses involving the user
    const { data, errors } = await this.userResource.getUserDebts(userId);

    if (errors.expensesError || errors.settlementsError) {
      // Handle errors
      throw new Error('Failed to fetch data');
    }

    // Process data to calculate debts
    const debts = this.calculateIndividualDebts(data.expenses, data.settlements, userId);

    // Calculate total amount owed
    const totalOwed = debts.reduce((sum, debt) => sum + debt.amount, 0);

    return { debts, totalOwed };
  }

  private calculateIndividualDebts(expensesData, settlementsData, userId) {
    const debts: Array<{ groupId: string; groupName: string; creditorId: string; creditorName: string; amount: number }> = [];

    const userDebts: { [creditorId: string]: { amount: number; creditorName: string; groupName: string, groupId: string } } = {};

    // Process expenses
    expensesData.forEach((ep) => {
      const expense = ep.expenses;
      const amountOwed = ep.amount_owed;
      const creditorId = expense.paid_by;

      // Skip if the user is the payer
      if (creditorId === userId) return;

      if (!userDebts[creditorId]) {
        userDebts[creditorId] = { amount: 0, creditorName: '', groupName: '', groupId: '' };
      }
      userDebts[creditorId].amount += amountOwed;
      userDebts[creditorId].groupId = expense.group_id;
      userDebts[creditorId].groupName = expense.groups.name;
      userDebts[creditorId].creditorName = expense.users.name;

      debts.push({
        groupId: expense.group_id,
        groupName: expense.groups.name,
        creditorId,
        creditorName: expense.users.name,
        amount: amountOwed,
      });
    });

    // Process settlements
    settlementsData.forEach((settlement) => {
      const { payer_id, payee_id, amount } = settlement;

      if (payer_id === userId) {
        // User has paid someone
        if (userDebts[payee_id]) {
          userDebts[payee_id].amount -= amount;
          if (userDebts[payee_id].amount <= 0) {
            delete userDebts[payee_id];
          }
        }
      } else if (payee_id === userId) {
        // Someone has paid the user
        if (userDebts[payer_id]) {
          userDebts[payer_id].amount -= amount;
          if (userDebts[payer_id].amount <= 0) {
            delete userDebts[payer_id];
          }
        }
      }
    });

    // Reconstruct debts array after settlements
    const adjustedDebts = [];
    for (const creditorId in userDebts) {
      adjustedDebts.push({
        creditorId,
        amount: userDebts[creditorId].amount,
        groupName: userDebts[creditorId].groupName,
        groupId: userDebts[creditorId].groupId,
        creditorName: userDebts[creditorId].creditorName,
      });
    }

    return adjustedDebts;
  }


}