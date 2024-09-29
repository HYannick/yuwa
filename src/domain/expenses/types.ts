
export interface AddExpenseParams {
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