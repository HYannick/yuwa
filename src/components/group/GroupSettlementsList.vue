<template>
  <div class="pb-10">
    <GroupSectionHeader label="Settlements" :to="`/groups/${groupId}/add-settlement`" :header-icon="ScaleIcon" />

    <div v-if="settlements.length === 0">
      <img src="@/assets/illustrations/undraw_checklist.svg" alt="No settlement" class="w-1/2 mx-auto"/>
      <p class="text-center text-gray-500 mt-5">No settlements have been recorded yet.</p>
      <BaseRouterLinkButton :to="`/groups/${groupId}/add-settlement`" size="small" class="w-1/2  mx-auto mt-5 flex items-center justify-center px-4 h-12 text-white rounded-xl">
        Add Settlement
      </BaseRouterLinkButton>
    </div>
    <ul v-else class="flex flex-col gap-3">
      <li v-for="settlement in settlements" :key="settlement.id" class="px-4 py-2 rounded-xl bg-gray-200 dark:bg-zinc-700 justify-between flex flex-col">
        <p class="text-gray-800 dark:text-zinc-400">{{ new Date(settlement.date).toLocaleDateString() }}</p>
        <div class="flex justify-between">
          <p class="text-gray-800 dark:text-zinc-400">
            <span class="font-bold text-gray-800 dark:text-zinc-400">{{ getUsernameFromParticipants(settlement.payer_id, participants) }}</span>
            paid
            <span class="font-bold text-gray-800 dark:text-zinc-400">{{ getUsernameFromParticipants(settlement.payee_id, participants) }}</span>
          </p>
          <p class="font-bold text-gray-800 dark:text-zinc-400">{{ formatCurrency(settlement.amount, settlement.currency) }}</p>
        </div>

      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import {defineProps} from 'vue';
import {Settlement} from '@/domain/Settlement.ts';
import {formatCurrency, getUsernameFromParticipants} from '@/utils/common.utils.ts';
import BaseRouterLinkButton from '@/components/BaseRouterLinkButton.vue';
import {PlusIcon, ScaleIcon} from '@heroicons/vue/24/outline';
import GroupSectionHeader from '@/components/group/GroupSectionHeader.vue';
defineProps<{ groupId: string, settlements: Settlement[], participants: any }>();
</script>