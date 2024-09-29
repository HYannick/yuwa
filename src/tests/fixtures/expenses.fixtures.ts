import {Expense} from '@/domain/Expense.ts';
import {Settlement} from '@/domain/Settlement.ts';
import {ExpenseParticipant} from '@/domain/ExpenseParticipant.ts';

export const mockExpense = (opts?: Partial<Expense>): Expense => ({
  id: '1',
  group_id: '1',
  description: 'Pizza',
  amount: 100,
  currency: 'USD',
  paid_by: {
    id: '1',
    name: 'Alice',
  },
  share_type: 'equal',
  date: '2021-01-01',
  note: 'Lunch',
  created_at: new Date(),
  updated_at: new Date(),
  participants: [],
  ...opts,
});

export const mockSettlement = (opts?: Partial<Settlement>): Settlement => ({
  id: '1',
  group_id: '1',
  payer_id: '1',
  payee_id: '2',
  amount: 200,
  currency: 'USD',
  date: '2021-01-01',
  note: 'Dinner',
  created_at: new Date(),
  updated_at: new Date(),
  ...opts,
});

export const mockExpenseParticipant = (opts?: Partial<ExpenseParticipant>): ExpenseParticipant => ({
  id: '1',
  expense_id: '1',
  user_id: '1',
  share_value: 10,
  amount_owed: 10,
  note: 'Dessert',
  ...opts,
});
