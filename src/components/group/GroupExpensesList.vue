<template>
  <div class="mb-10">
    <GroupSectionHeader label="Expenses" :to="`/groups/${groupId}/add-expense`" :action-icon="PlusIcon"/>
    <div v-if="expenses.length === 0">
      <img src="@/assets/illustrations/undraw_add_document.svg" alt="No expenses" class="w-1/2 mx-auto"/>
      <p class="text-center text-gray-500 mt-5">No expenses have been added yet.<br>Create a new one!</p>
      <BaseRouterLinkButton :to="`/groups/${groupId}/add-expense`" size="small"
                            class="w-1/2  mx-auto mt-5 flex items-center justify-center px-4 h-12 bg-gray-800 text-white rounded-xl">
        Add Expense
      </BaseRouterLinkButton>
    </div>
    <ul v-else class="flex flex-col gap-3">
      <li v-for="expense in expenses" :key="expense.id" class="flex justify-between bg-gray-100 p-4 items-center rounded-xl" @click="openDetails(expense)">
        <div>
          <h3 class="font-bold">{{ expense.description }}</h3>
          <p class="text-sm">Paid by: <span class="text-orange-800">{{ expense.paid_by.name }}</span>
          </p>
        </div>
        <p class="font-black">{{ expense.amount.toFixed(2) }} {{ expense.currency }}</p>
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
import {PlusIcon} from "@heroicons/vue/24/outline";
import BaseRouterLinkButton from '@/components/BaseRouterLinkButton.vue';
import GroupSectionHeader from '@/components/group/GroupSectionHeader.vue';
import GroupExpenseCard from '@/components/group/GroupExpenseCard.vue';
import {useRoute, useRouter} from 'vue-router';

defineProps<{ groupId: any, expenses: Expense[] }>();
const router = useRouter();
const route = useRoute()
const selectedExpense = ref<Expense | null >(null)
const closeDetails = () => {
  let newQuery = {...route.query};
  delete newQuery.expenseCard;
  router.replace({path: route.path, query: newQuery});
  selectedExpense.value = null;
}

const openDetails = (expense: Expense) => {
  router.push({path: route.path, query: {expenseCard: 'open'}});
  selectedExpense.value = expense;
}

const handleBackRouterButton = () => {
  if (selectedExpense.value) {
    closeDetails();
  }
}

onMounted(() => {
  window.addEventListener('popstate', () => {
    if (selectedExpense.value) {
      closeDetails();
    } else {
      if (window.history.length <= 1) {
        router.push('/');
      }
    }
  });
});

onUnmounted(() => {
  window.removeEventListener('popstate', handleBackRouterButton);
});

</script>
<style>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100px);
}
</style>