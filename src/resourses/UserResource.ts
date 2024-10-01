import {SupabaseClient} from '@supabase/supabase-js';

export class UserResource {
  db: SupabaseClient;

  constructor(db: SupabaseClient) {
    this.db = db;
  }

  async createUser(userId: string, username: string) {
    await this.db.from('users')
      .insert([{auth_id: userId, name: username}])
  }

  async getUser(authId: string) {
    return this.db.from('users')
      .select('*')
      .eq('auth_id', authId).single()
  }

  async getUserDebts(userId: string) {
    const { data: expenses, error: expensesError } = await this.db.from('expense_participants')
      .select(`
      expense_id,
      amount_owed,
      expenses (
        id,
        group_id,
        paid_by,
        amount,
        groups ( id, name ),
        users!expenses_paid_by_fkey ( auth_id, name )
      )
    `)
      .eq('user_id', userId);
    // Fetch settlements involving the user
    const { data: settlements, error: settlementsError } = await this.db
      .from('settlements')
      .select(`
      id,
      group_id,
      payer_id,
      payee_id,
      amount,
      groups ( id, name )
    `)
      .or(`payer_id.eq.${userId},payee_id.eq.${userId}`);

    return { data: {expenses, settlements}, errors : {expensesError, settlementsError} };
  }
}