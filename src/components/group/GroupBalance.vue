<template>
  <div class="p-5 rounded-xl bg-white">
    <div v-if="Object.keys(balances).length === 0">
      <img src="@/assets/illustrations/undraw_pie_chart.svg" alt="No balance" class="w-1/2 mx-auto"/>
      <p class="text-gray-500 text-center mt-5">No Expenses yet so...no chart!</p>
    </div>
    <div v-else-if="balanceResolved">
      <img src="@/assets/illustrations/undraw_winners.svg" alt="No expenses" class="w-1/2 mx-auto"/>
      <p class="text-center text-gray-500 mt-5">All balances are settled!</p>
    </div>
    <div  v-else>
      <ul class="flex flex-col">
        <li v-for="(balance, userId) in balances" :key="userId" class="mb-2">
          <div class="flex items-center">
            <div class="relative w-1/2 h-8">
              <div
                  v-if="balance < 0"
                  class="absolute right-0 h-8 bg-red-300 flex items-center justify-end pr-2 font-bold text-red-900 rounded"
                  :style="{ width: balanceBarWidth(balance) }"
              >
                {{ (-balance).toFixed(2) }}
              </div>
            </div>
            <div class="w-32 text-center">
              {{ getUsernameFromParticipants(userId, participants) }}
            </div>
            <div class="relative w-1/2 h-8">
              <div
                  v-if="balance > 0"
                  class="absolute left-0 h-8 bg-green-300 flex items-center pl-2 font-bold text-green-900 rounded"
                  :style="{ width: balanceBarWidth(balance) }"
              >
                {{ balance.toFixed(2) }}
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>

  </div>

  <hr class="h-1 my-8 mx-auto w-52 bg-gray-100 rounded border-transparent"/>
  <h2 class="font-semibold text-2xl">Debts</h2>
  <div v-if="Object.keys(debts).length === 0">
    <img src="@/assets/illustrations/undraw_winners.svg" alt="No expenses" class="w-1/2 mx-auto"/>
    <p class="text-center text-gray-500 mt-5">All balances are settled!</p>
  </div>
  <ul v-else>
    <li v-for="(creditors, debtorId) in debts" :key="debtorId">
      <p><strong>{{ getUsernameFromParticipants(debtorId, participants) }} owes:</strong></p>
      <ul>
        <li v-for="(amount, creditorId) in creditors" :key="creditorId">
          {{ formatCurrency(amount, 'EUR') }} to {{ getUsernameFromParticipants(creditorId, participants) }}
        </li>
      </ul>
    </li>
  </ul>
</template>
<script setup lang="ts">
import {formatCurrency, getUsernameFromParticipants} from '@/utils/common.utils.ts';
import {computed, inject, onMounted, ref} from 'vue';
import {calculateBalances, ExpenseService} from '@/services/ExpenseService.ts';
import {Expense} from '@/domain/Expense.ts';
import {Settlement} from '@/domain/Settlement.ts';
import {Balances, DetailedDebts} from '@/domain/expenses/types.ts';

const expenseService = inject('expenseService') as ExpenseService;
const props = defineProps<{ expenses: Expense[], settlements: Settlement[], participants: any, currency: string }>();
const balances = ref<Balances>({});
const debts = ref<DetailedDebts>({});

const balanceBarWidth = (balance: number) => {
  const percentage = (Math.abs(balance) / maxAbsBalance.value) * 100;
  return `${percentage}%`;
}
const maxAbsBalance = computed(() => {
  const balancesArray = Object.values(balances.value);
  return Math.max(...balancesArray.map((b) => Math.abs(b))) || 1; // Avoid division by zero
});

const balanceResolved = computed(() => {
  return Object.values(balances.value).every((b) => b === 0);
});

onMounted(() => {
  balances.value = calculateBalances(props.expenses, props.settlements);
  debts.value = expenseService.calculateIndividualDebts(props.expenses, props.settlements);
})

</script>