export interface Settlement {
  id: string;
  group_id: string;
  payer_id: string;
  payee_id: string;
  amount: number;
  currency: string;
  date: string;
  note?: string;
  created_at?: Date;
  updated_at?: Date;
}