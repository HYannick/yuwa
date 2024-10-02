<script lang="ts" setup>
import {ref, onMounted, inject, onUnmounted} from 'vue';
import {GroupService} from '@/services/GroupService.ts';
import {ExpenseService} from '@/services/ExpenseService.ts';
import GroupHeader from '@/components/group/GroupHeader.vue';
import GroupExpensesList from '@/components/group/GroupExpensesList.vue';
import GroupBalance from '@/components/group/GroupBalance.vue';
import {Expense} from '@/domain/Expense.ts';
import {Settlement} from '@/domain/Settlement.ts';
import {SettlementService} from '@/services/SettlementService.ts';
import GroupSettlementsList from '@/components/group/GroupSettlementsList.vue';
import {GroupParticipant} from '@/domain/GroupParticipant.ts';

import BackRouterButton from '@/components/BackRouterButton.vue';
import {EllipsisVerticalIcon, ChartPieIcon, BanknotesIcon, PlusIcon, ScaleIcon, CreditCardIcon,} from '@heroicons/vue/24/outline';
import SettingsSidebar from '@/components/group/SettingsSidebar.vue';
import {useRoute, useRouter} from 'vue-router';
import {useGroupStore} from '@/stores/groupStore.ts';
import {storeToRefs} from 'pinia';
import {useSidebarHistoryState} from '@/composables/useSidebarHistoryState.ts';

const props = defineProps<{
  id: string;
}>()

const groupService = inject('groupService') as GroupService;
const expenseService = inject('expenseService') as ExpenseService;
const settlementService = inject('settlementService') as SettlementService;
const loading = ref(true);
const expenses = ref<Expense[]>([]);
const settlements = ref<Settlement[]>([]);
const participants = ref<GroupParticipant[]>([]);
const groupSettingsVisible = ref(false);
const router = useRouter();
const route = useRoute();
const tabs = [
  {
    icon: BanknotesIcon,
    name: 'Expenses',
  }, {
    icon: ChartPieIcon,
    name: 'Balances',
  },
];
const currentTab = ref('Expenses');
const switchTab = (tab: string) => {
  currentTab.value = tab;
}
const {currentGroup} = storeToRefs(useGroupStore());
const {resetCurrentGroup} = useGroupStore();
const {onBackButtonPressed, pushTo, resetRoute} = useSidebarHistoryState();
const setBalanceData = async () => {
  expenses.value = await expenseService.fetchExpenses(props.id);
  settlements.value = await settlementService.fetchGroupSettlements(props.id);
}
const loadGroupData = async () => {
  loading.value = true;
  if(currentGroup.value) {
    participants.value = currentGroup.value.participants;
    await setBalanceData();
    loading.value = false;
    return;
  }

  await groupService.fetchGroupDetails(props.id);

  participants.value = currentGroup.value.participants;
  await setBalanceData();
  loading.value = false;
};
const openGroupSettings = () => {
  pushTo('groupSettings');
  groupSettingsVisible.value = true;
}

const closeGroupSettings = () => {
  resetRoute('groupSettings');
  groupSettingsVisible.value = false;
}

const handleBackRouterButton = () => {
  if (groupSettingsVisible.value) {
    closeGroupSettings();
  }
}

onMounted(() => {
  loadGroupData();
  window.addEventListener('popstate', () => {
    if(groupSettingsVisible.value) {
      onBackButtonPressed(groupSettingsVisible.value, closeGroupSettings)
    } else if (controlsOpen.value) {
      onBackButtonPressed(controlsOpen.value, closeControls);
    }
  });
});

onUnmounted(() => {
  window.removeEventListener('popstate', handleBackRouterButton);
  resetCurrentGroup();
});

const controlsOpen = ref(false);
const toggleControls = () => {
  pushTo('controls');
  controlsOpen.value = !controlsOpen.value;
}
const closeControls = () => {
  resetRoute('controls');
  controlsOpen.value = false;
}

</script>

<template>
  <section class="w-screen md:max-w-screen-xl md:m-auto p-5 h-screen">
    <div class="flex justify-between">
      <BackRouterButton/>
      <button @click="openGroupSettings" class="flex items-center p-2">
        <EllipsisVerticalIcon class="w-8 stroke-2"/>
      </button>
    </div>
    <div v-if="loading">
      <p>Loading...</p>
    </div>
    <template v-else-if="currentGroup">
      <GroupHeader :group="currentGroup" :expenses="expenses" :settlements="settlements"/>
      <div class="flex justify-center gap-4 mb-5 lg:hidden">
        <div class="relative" v-for="tab in tabs" :key="tab.name">
          <button
              @click="switchTab(tab.name)"
              :class="`flex gap-2 px-4 py-2 font-bold rounded-xl transition-all duration-300 ${currentTab !== tab.name ? 'bg-gray-100 text-gray-800' : 'bg-gray-800 text-white'}`"
          >
            <component :is="tab.icon" class="w-6 stroke-2"/>
            {{ tab.name }}
          </button>
        </div>
      </div>
      <div class="-mx-5 p-5 rounded-3xl">
        <div class="lg:hidden">
          <div v-if="currentTab === 'Expenses'">
            <GroupExpensesList :groupId="id" :expenses="expenses" :participants="participants"/>
          </div>
          <div v-else-if="currentTab === 'Balances'" class="my-10">
            <GroupBalance :expenses="expenses" :settlements="settlements" :participants="participants" :currency="currentGroup.currency"/>
            <GroupSettlementsList :settlements="settlements" :group-id="currentGroup.id" :participants="participants"/>
          </div>
        </div>
        <div class="hidden lg:flex gap-10">
          <div class="w-2/3">
            <GroupExpensesList :groupId="id" :expenses="expenses"/>
          </div>
          <div class="w-1/3">
            <GroupBalance :expenses="expenses" :settlements="settlements" :participants="participants" :currency="currentGroup.currency"/>
          </div>
          <GroupSettlementsList :settlements="settlements" :group-id="currentGroup.id" :participants="participants"/>
        </div>
      </div>
    </template>
    <Transition name="slide">
      <SettingsSidebar v-if="groupSettingsVisible && currentGroup" :group="currentGroup" :participants="participants" @close="closeGroupSettings"/>
    </Transition>
    <div class="fixed right-5 bottom-5 z-50 flex flex-col items-end">
      <Transition name="slide">
        <div class="flex flex-col gap-5 mb-5 items-end" v-if="controlsOpen">
          <router-link :to="`/groups/${currentGroup!.id}/add-expense`" class="flex gap-5 items-center">
            <span class="font-bold">Add Expense</span>
            <div class="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center">
              <CreditCardIcon class="w-6 stroke-2 stroke-white"/>
            </div>
          </router-link>
          <router-link :to="`/groups/${currentGroup!.id}/add-settlement`" class="flex gap-5 items-center">
            <span class="font-bold">Add Settlement</span>
            <div class="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center">
              <ScaleIcon class="w-6 stroke-2 stroke-white"/>
            </div>
          </router-link>
        </div>
      </Transition>
      <button class="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center" @click="toggleControls">
        <PlusIcon class="w-6 stroke-2 stroke-white"/>
      </button>
    </div>
    <Transition name="fade">
      <div v-if="controlsOpen" class="fixed inset-0 bg-white bg-opacity-90" @click="closeControls"></div>
    </Transition>
  </section>
</template>