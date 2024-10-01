import {SupabaseClient} from '@supabase/supabase-js';
import {DBResponse} from '@/domain/DBResponse.ts';
import {Expense} from '@/domain/Expense.ts';

export class ExpenseResource {
  db: SupabaseClient;

  constructor(db: SupabaseClient) {
    this.db = db;
  }

  async fetchExpenses(groupId: string): Promise<DBResponse<Expense>> {
    const {data, error} = await this.db
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
      .eq('group_id', groupId)
      .order('date', {ascending: false}) as DBResponse<Expense>;
    return {data, error};
  }
}