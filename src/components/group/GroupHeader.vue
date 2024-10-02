<template>
  <div class="mt-5 rounded-3xl">
    <h1 class="text-center font-display text-4xl font-bold text-zinc-800 dark:text-zinc-400">{{ group.name }}</h1>
    <hr class="h-1 mt-4 mx-auto w-52 bg-gray-200 dark:bg-gray-600 rounded border-transparent"/>
    <div class="p-4 text-zinc-800 dark:text-zinc-400 rounded-xl w-10/12 mx-auto">
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
import {onMounted, ref} from 'vue';
import {calculateBalances} from '@/services/ExpenseService.ts';
import {useUserStore} from '@/stores/userStore.ts';
import {Expense} from '@/domain/Expense.ts';
import {Settlement} from '@/domain/Settlement.ts';
const props = defineProps<{group: any; expenses: Expense[], settlements: Settlement[]}>()
const userBalance = ref(0);
const userStore = useUserStore();
onMounted(() =>{
  const userId = userStore.user?.auth_id;
  userBalance.value = calculateBalances(props.expenses, props.settlements)[userId] || 0;
})
</script>