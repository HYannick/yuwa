<template>
  <div class="mb-10">
    <GroupSectionHeader label="Expenses" :to="`/groups/${groupId}/add-expense`" :action-icon="PlusIcon"/>
    <div v-if="expenses.length === 0">
      <img src="@/assets/illustrations/undraw_add_document.svg" alt="No expenses" class="w-1/2 mx-auto"/>
      <p class="text-center text-gray-500 mt-5">No expenses have been added yet.<br>Create a new one!</p>
      <BaseRouterLinkButton :to="`/groups/${groupId}/add-expense`" size="small"
                            class="w-1/2  mx-auto mt-5 flex items-center justify-center px-4 h-12 bg-indigo-500 text-white rounded-xl">
        Add Expense
      </BaseRouterLinkButton>
    </div>
    <ul v-else class="flex flex-col gap-3">
      <li v-for="expense in expenses" :key="expense.id" class="flex justify-between bg-gray-200 p-4 items-center rounded-xl">
        <div>
          <h3 class="font-bold">{{ expense.description }}</h3>
          <p class="text-sm">Paid by: <span class="text-indigo-600">{{ expense.paid_by.name }}</span>
          </p>
        </div>
        <p class="font-black">{{ expense.amount.toFixed(2) }} {{ expense.currency }}</p>
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import {defineProps} from 'vue';
import {Expense} from '@/domain/Expense.ts';
import {PlusIcon} from "@heroicons/vue/24/outline";
import BaseRouterLinkButton from '@/components/BaseRouterLinkButton.vue';
import GroupSectionHeader from '@/components/group/GroupSectionHeader.vue';

defineProps<{ groupId: any, expenses: Expense[] }>();
</script>