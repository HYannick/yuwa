import {ExpenseParticipant} from './ExpenseParticipant.ts';

export interface Expense {
  id: string;
  group_id: string;
  description: string;
  amount: number;
  currency: string;
  paid_by: {
    id: string;
    name: string;
  };
  share_type: string;
  date: string;
  note?: string;
  created_at?: Date;
  updated_at?: Date;
  participants: ExpenseParticipant[];
}

export type ParticipantsShare = {
  user_id: string;
  share_value: number | null;
  amount_owed: number;
  note: string;
}[]

export type ParticipantsData = {
  participantShares: ParticipantsShare;
  error: string
}
