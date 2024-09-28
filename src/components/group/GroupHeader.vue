<template>
  <div class="mt-5 px-5 py-10 rounded-3xl relative">
    <h1 class="text-center font-display text-4xl font-bold mb-4">{{ group.name }}</h1>
    <div class="p-4 bg-white rounded-xl absolute left-1/2 -translate-x-1/2 w-10/12 -bottom-4">
        <p v-if="userBalance > 0" class="text-center">
          You are owed <strong>{{ formatCurrency(userBalance, group.currency || 'EUR') }}</strong> by the group.
        </p>
        <p v-else-if="userBalance < 0" class="text-center">
          You owe <strong>{{ formatCurrency(-userBalance, group.currency || 'EUR') }}</strong> to the group.
        </p>
        <p v-else class="text-center">
          You are all settled up!
        </p>
    </div>
  </div>
</template>
<script setup lang="ts">
import {formatCurrency} from '@/utils/common.utils.ts';
import {inject, onMounted, ref} from 'vue';
import {ExpenseService} from '@/services/ExpenseService.ts';
import {useUserStore} from '@/stores/userStore.ts';
import {Expense} from '@/domain/Expense.ts';
import {Settlement} from '@/domain/Settlement.ts';
const props = defineProps<{group: any; expenses: Expense[], settlements: Settlement[]}>()
const userBalance = ref(0);
const expenseService = inject('expenseService') as ExpenseService;
const userStore = useUserStore();
onMounted(() =>{
  const userId = userStore.user?.auth_id;
  userBalance.value = expenseService.calculateBalances(props.expenses, props.settlements)[userId] || 0;
})
</script>