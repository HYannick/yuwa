import {SupabaseClient} from '@supabase/supabase-js';

interface SettlementData {
  groupId: string;
  payerId: string;
  payeeId: string;
  amount: number;
  currency: string;
  date: string;
  note?: string;
}
export class SettlementService {
  private supabaseInstance: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabaseInstance = supabase;
  }

  async fetchGroupSettlements(groupId: string) {
    const { data, error } = await this.supabaseInstance
      .from('settlements')
      .select(`
      id,
      amount,
      currency,
      date,
      note,
      payer_id,
      payee_id,
      users!settlements_payer_id_fkey ( id, name ),
      payee:users!settlements_payee_id_fkey ( id, name )
    `)
      .eq('group_id', groupId)
      .order('date', { ascending: false });

    return data;
  };


  async addSettlement(settlementData: SettlementData): Promise<{data: any, error: any}> {
    const {data, error} = await this.supabaseInstance
      .from('settlements')
      .insert([
        {
          group_id: settlementData.groupId,
          payer_id: settlementData.payerId,
          payee_id: settlementData.payeeId,
          amount: settlementData.amount,
          currency: settlementData.currency,
          date: settlementData.date,
          note: settlementData.note || '',
        },
      ]);

    return {data, error};
  }

}