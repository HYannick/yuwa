<template>
  <div class="mb-10">
    <div class="flex justify-between items-center mb-5">
      <h2 class="font-bold text-2xl">Expenses</h2>
      <router-link v-if="expenses.length > 0" :to="`/groups/${groupId}/add-expense`" class="flex items-center justify-center px-4 h-12 bg-indigo-500 text-white rounded-xl">
        Add Expense
      </router-link>
    </div>
    <div v-if="expenses.length === 0">
      <img src="@/assets/illustrations/undraw_add_document.svg" alt="No expenses" class="w-1/2 mx-auto"/>
      <p class="text-center text-gray-500 mt-5">No expenses have been added yet.<br>Create a new one!</p>
      <router-link :to="`/groups/${groupId}/add-expense`" class="w-1/2  mx-auto mt-5 flex items-center justify-center px-4 h-12 bg-indigo-500 text-white rounded-xl">
        Add Expense
      </router-link>
    </div>
    <ul v-else class="flex flex-col gap-3">
      <li v-for="expense in expenses" :key="expense.id" class="flex justify-between bg-white p-4 items-center rounded-xl">
        <div>
          <h3 class="font-bold">{{ expense.description }}</h3>
          <p class="text-sm">Paid by: <span class="text-indigo-600">{{ expense.users.name }}</span>
          </p>
        </div>
        <p class="font-black">{{ expense.amount.toFixed(2) }} {{ expense.currency }}</p>
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import {defineProps} from 'vue';

defineProps<{ groupId: any, expenses: any[] }>();
</script>