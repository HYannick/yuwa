<template>
  <div class="fixed bottom-0 top-0 overflow-y-scroll z-50 left-0 right-0 bg-zinc-100 dark:bg-zinc-900 p-4 shadow-lg rounded-t-xl">
    <div class="relative">
      <div class="flex justify-between">
        <BackButton @click="$emit('closeDetails')"/>
        <router-link :to="`/groups/${groupId}/expenses/${expense.id}/edit`" class="flex items-center gap-2" v-if="canEdit">
          <PencilSquareIcon class="w-7 stroke-2" />
        </router-link>
      </div>
      <div class="text-center mt-10">
        <span class="text-gray-500">{{ new Date(expense.date).toDateString() }}</span>
        <h2 class="text-4xl text-center font-bold font-display">{{ expense.description }}</h2>
      </div>
      <hr class="h-1 my-4 mx-auto w-24 bg-gray-100 rounded border-transparent"/>
      <div class="mb-2 text-center">
        <p class="text-4xl font-semibold">{{ expense.amount.toFixed(2) }} {{ expense.currency }}</p>
        <p>Paid by <span class="font-bold">{{ expense.paid_by.name }}</span></p>
      </div>
      <div class="w-80 my-10 mx-auto">
        <p class="text-xl font-bold ml-2">{{shareTypeLabel}}</p>
        <ul class="flex flex-col gap-5 bg-orange-50 p-5 rounded-xl">
          <li v-for="participant in expense.participants" :key="participant.id" class="flex justify-between relative z-10">
            <span class="text-lg bg-orange-50 pr-2">{{ participant.details.name }}</span>
            <span class="absolute top-1/2 left-0 -translate-y-1/2 bg-gray-400 h-[0.05rem] w-full -z-10"></span>
            <span class="text-lg bg-orange-50 font-bold pl-2">{{ participant.amount_owed.toFixed(2) }} {{ expense.currency }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {PencilSquareIcon} from '@heroicons/vue/24/outline';
import BackButton from '@/components/BackButton.vue';
import {Expense} from '@/domain/Expense.ts';
import {computed} from 'vue';
import {useUserStore} from '@/stores/userStore.ts';
const props = defineProps<{expense: Expense, groupId: string}>();
defineEmits(['closeDetails'])
const userStore = useUserStore();
const shareTypeLabel = computed(() => {
  if(props.expense){
    return props.expense.share_type === 'equal' ? 'Equally shared' : 'Custom shares';
  }
  return '';
})

const canEdit = computed(() => {
  return props.expense.paid_by.id === userStore.user?.auth_id;
})
</script>