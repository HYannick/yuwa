import {calculateBalances} from '@/services/ExpenseService.ts';
import {Expense} from '@/domain/Expense.ts';
import {Settlement} from '@/domain/Settlement.ts';
import {ExpenseParticipant} from '@/domain/ExpenseParticipant.ts';
import {mockExpense, mockExpenseParticipant, mockSettlement} from '@/tests/fixtures/expenses.fixtures.ts';

describe('ExpensesService', () => {
  it('should calculate balance without settlements', () => {
    const expenseSimpleEqual = [
      mockExpense({
        id: '1',
        amount: 30,
        paid_by: {id: '1', name: 'Alice'},
        participants: [
          mockExpenseParticipant({user_id: '1', amount_owed: 10}),
          mockExpenseParticipant({user_id: '2', amount_owed: 10}),
          mockExpenseParticipant({user_id: '3', amount_owed: 10}),
        ]
      }),
    ];
    const settlements: Settlement[] = [];
    const balancesEqual = calculateBalances(expenseSimpleEqual, settlements);
    expect(balancesEqual).toEqual({
      '1': 20,
      '2': -10,
      '3': -10,
    });

    const expenseSimpleUnequal = [
      mockExpense({
        id: '1',
        amount: 30,
        paid_by: {id: '1', name: 'Alice'},
        participants: [
          mockExpenseParticipant({user_id: '1', amount_owed: 5}),
          mockExpenseParticipant({user_id: '2', amount_owed: 15}),
          mockExpenseParticipant({user_id: '3', amount_owed: 10}),
        ]
      }),
    ];
    const balanceAfterPartialSettlement = calculateBalances(expenseSimpleUnequal, settlements);
    expect(balanceAfterPartialSettlement).toEqual({
      '1': 25,
      '2': -15,
      '3': -10,
    });
  });

  it('should calculate balance with settlements', () => {
    const expense = [
      mockExpense({
        id: '1',
        amount: 30,
        paid_by: {id: 'alice', name: 'Alice'},
        participants: [
          mockExpenseParticipant({user_id: 'alice', amount_owed: 10}),
          mockExpenseParticipant({user_id: 'bob', amount_owed: 10}),
          mockExpenseParticipant({user_id: 'charlie', amount_owed: 10}),
        ]
      }),
    ];
    const settlement = [
      mockSettlement({
        id: '1',
        payer_id: 'bob',
        payee_id: 'alice',
        amount: 10,
      }),
    ];
    const balanceAfterPartialSettlement = calculateBalances(expense, settlement);
    expect(balanceAfterPartialSettlement).toEqual({
      'alice': 10,
      'bob': 0,
      'charlie': -10,
    });


    const expenseBig = [
      mockExpense({
        id: '1',
        amount: 30,
        paid_by: {id: 'alice', name: 'Alice'},
        participants: [
          mockExpenseParticipant({user_id: 'alice', amount_owed: 10}),
          mockExpenseParticipant({user_id: 'bob', amount_owed: 10}),
          mockExpenseParticipant({user_id: 'charlie', amount_owed: 10}),
        ]
      }),
    ];
    const settlementBig = [
      mockSettlement({
        id: '1',
        payer_id: 'bob',
        payee_id: 'alice',
        amount: 30,
      }),
    ];
    const balanceAfterOverpayment = calculateBalances(expenseBig, settlementBig);
    expect(balanceAfterOverpayment).toEqual({
      'alice': -10,
      'bob': 20,
      'charlie': -10,
    });
  });

  it('should calculate balance with multiple expenses and valid settlements', () => {
    // Case 1: Valid payments with multiple expenses and settlements

    const expensesValid = [
      mockExpense({
        id: '1',
        amount: 40,
        paid_by: { id: 'alice', name: 'Alice' },
        participants: [
          mockExpenseParticipant({ user_id: 'alice', amount_owed: 10 }),
          mockExpenseParticipant({ user_id: 'bob', amount_owed: 10 }),
          mockExpenseParticipant({ user_id: 'charlie', amount_owed: 20 }),
        ],
      }),
      mockExpense({
        id: '2',
        amount: 60,
        paid_by: { id: 'bob', name: 'Bob' },
        participants: [
          mockExpenseParticipant({ user_id: 'alice', amount_owed: 20 }),
          mockExpenseParticipant({ user_id: 'bob', amount_owed: 20 }),
          mockExpenseParticipant({ user_id: 'charlie', amount_owed: 20 }),
        ],
      }),
    ];

    const settlementsValid = [
      mockSettlement({
        id: '1',
        payer_id: 'charlie',
        payee_id: 'alice',
        amount: 20, // Charlie settles his $20 debt with Alice from Expense 1.
      }),
      mockSettlement({
        id: '2',
        payer_id: 'bob',
        payee_id: 'alice',
        amount: 10, // Bob settles his $10 debt with Alice from Expense 1.
      }),
    ];

    const balanceValid = calculateBalances(expensesValid, settlementsValid);

    expect(balanceValid).toEqual({
      alice: -20,  // Alice ends up owing $20 (from Expense 2 after settlements).
      bob: 40,     // Bob is owed $40 (Alice and Charlie still owe him for Expense 2).
      charlie: -20 // Charlie owes Bob $20 (from Expense 2).
    });
  });

});