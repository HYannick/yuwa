export interface ExpenseParticipant {
  id: string;
  expense_id: string;
  user_id: string;
  share_value?: number;
  amount_owed: number;
  note?: string;
}