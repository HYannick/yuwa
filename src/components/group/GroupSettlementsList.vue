<template>
  <div class="pb-10">
    <div class="flex justify-between items-center mb-5">
      <h2 class="font-bold text-2xl">Settlements</h2>
      <router-link v-if="settlements.length > 0" :to="`/groups/${groupId}/add-settlement`" class="flex items-center justify-center px-4 h-12 bg-indigo-500 text-white rounded-xl">
        Add Settlement
      </router-link>
    </div>
    <div v-if="settlements.length === 0">
      <img src="@/assets/illustrations/undraw_checklist.svg" alt="No expenses" class="w-1/2 mx-auto"/>
      <p class="text-center text-gray-500 mt-5">No settlements have been recorded yet.</p>
      <router-link :to="`/groups/${groupId}/add-settlement`" class="w-1/2  mx-auto mt-5 flex items-center justify-center px-4 h-12 bg-indigo-500 text-white rounded-xl">
        Add Settlement
      </router-link>
    </div>
    <ul v-else class="flex flex-col gap-3">
      <li v-for="settlement in settlements" :key="settlement.id" class="px-4 py-2 rounded-xl bg-white flex justify-between flex flex-col">
        <p class="text-indigo-600">{{ new Date(settlement.date).toLocaleDateString() }}</p>
        <div class="flex justify-between">
          <p>
            <span class="font-bold">{{ getUsernameFromParticipants(settlement.payer_id, participants) }}</span>
            paid
            <span class="font-bold">{{ getUsernameFromParticipants(settlement.payee_id, participants) }}</span>
          </p>
          <p class="font-bold">{{ formatCurrency(settlement.amount, settlement.currency) }}</p>
        </div>

      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import {defineProps} from 'vue';
import {Settlement} from '@/domain/Settlement.ts';
import {formatCurrency, getUsernameFromParticipants} from '@/utils/common.utils.ts';
defineProps<{ groupId: string, settlements: Settlement[], participants: any }>();
</script>