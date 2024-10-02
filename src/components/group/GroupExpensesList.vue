<template>
  <div class="mb-10">
    <GroupSectionHeader label="Expenses" :to="`/groups/${groupId}/add-expense`" :header-icon="BanknotesIcon"/>
    <div v-if="expenses.length === 0">
      <img src="@/assets/illustrations/undraw_add_document.svg" alt="No expenses" class="w-1/2 mx-auto"/>
      <p class="text-center text-gray-500 mt-5">No expenses have been added yet.<br>Create a new one!</p>
      <BaseRouterLinkButton :to="`/groups/${groupId}/add-expense`" size="small"
                            class="w-1/2  mx-auto mt-5 flex items-center justify-center px-4 h-12 text-white rounded-xl">
        Add Expense
      </BaseRouterLinkButton>
    </div>
    <ul v-else class="flex flex-col gap-3">
      <li v-for="expense in expenses" :key="expense.id" class="flex justify-between bg-zinc-200 dark:bg-zinc-800 p-4 items-center rounded-xl" @click="openDetails(expense)">
        <div>
          <h3 class="font-bold text-gray-800 dark:text-zinc-400">{{ expense.description }}</h3>
          <p class="text-sm text-gray-800 dark:text-zinc-400">Paid by: <span class="text-orange-800 dark:text-orange-600">{{ expense.paid_by.name }}</span>
          </p>
        </div>
        <p class="font-black text-gray-800 dark:text-zinc-400">{{ expense.amount.toFixed(2) }} {{ expense.currency }}</p>
      </li>
    </ul>
    <Teleport to="body">
      <Transition name="slide-up">
        <GroupExpenseCard :expense="selectedExpense" :group-id="groupId" v-if="selectedExpense" @closeDetails="closeDetails"/>
      </Transition>
    </Teleport>
  </div>
</template>
<script setup lang="ts">
import {defineProps, onMounted, onUnmounted, ref} from 'vue';
import {Expense} from '@/domain/Expense.ts';
import {BanknotesIcon, PlusIcon} from "@heroicons/vue/24/outline";
import BaseRouterLinkButton from '@/components/BaseRouterLinkButton.vue';
import GroupSectionHeader from '@/components/group/GroupSectionHeader.vue';
import GroupExpenseCard from '@/components/group/GroupExpenseCard.vue';
import {useSidebarHistoryState} from '@/composables/useSidebarHistoryState.ts';

defineProps<{ groupId: any, expenses: Expense[] }>();
const { pushTo, resetRoute, onBackButtonPressed} = useSidebarHistoryState();
const selectedExpense = ref<Expense | null >(null)

const openDetails = (expense: Expense) => {
  selectedExpense.value = expense;
  pushTo('expenseCard');
}

const closeDetails = () => {
  selectedExpense.value = null;
  resetRoute('expenseCard');
}

const handleBackRouterButton = () => {
  if (selectedExpense.value) {
    closeDetails();
  }
}

onMounted(() => {
  window.addEventListener('popstate', () => onBackButtonPressed(selectedExpense.value, closeDetails));
});

onUnmounted(() => {
  window.removeEventListener('popstate', handleBackRouterButton);
});

</script>