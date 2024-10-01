
export interface AddExpenseParams {
  groupId: string;
  description: string;
  amount: number;
  currency: string;
  paidBy: string;
  shareType: string;
  date: string;
  note: string;
  participantsData: {
    selectedParticipantIds: string[],
    participantShares: { [userId: string]: number },
  }
}
export interface DetailedDebts {
  [debtorId: string]: {
    [creditorId: string]: number;
  };
}
export type Balances = { [userId: string]: number }