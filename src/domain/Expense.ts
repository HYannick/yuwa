import {ExpenseParticipant} from './ExpenseParticipant.ts';

export interface Expense {
  id: string;
  group_id: string;
  description: string;
  amount: number;
  currency: string;
  paid_by: string;
  share_type: string;
  date: string;
  note?: string;
  created_at?: Date;
  updated_at?: Date;
  participants: ExpenseParticipant[];
}