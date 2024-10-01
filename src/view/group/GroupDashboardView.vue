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
import {Group} from '@/domain/Group.ts';

import BackRouterButton from '@/components/BackRouterButton.vue';
import {EllipsisVerticalIcon, ChartPieIcon, BanknotesIcon} from '@heroicons/vue/24/outline';
import SettingsSidebar from '@/components/group/SettingsSidebar.vue';
import {useRoute, useRouter} from 'vue-router';

const props = defineProps<{
  id: string;
}>()

const groupService = inject('groupService') as GroupService;
const expenseService = inject('expenseService') as ExpenseService;
const settlementService = inject('settlementService') as SettlementService;
const group = ref<Group | null>(null);
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

const loadGroupData = async () => {
  loading.value = true;

  const {data: groupData} = await groupService.fetchGroupDetails(props.id);

  group.value = groupData.group;
  participants.value = groupData.participants;
  expenses.value = await expenseService.fetchExpenses(props.id);
  settlements.value = await settlementService.fetchGroupSettlements(props.id);
  loading.value = false;
};
const openGroupSettings = () => {
  router.push({path: route.path, query: {sidebar: 'open'}});
  groupSettingsVisible.value = true;
}

const closeGroupSettings = () => {
  let newQuery = {...route.query};
  delete newQuery.sidebar;
  router.replace({path: route.path, query: newQuery});
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
    if (groupSettingsVisible.value) {
      closeGroupSettings();
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
    <template v-else-if="group">
      <GroupHeader :group="group" :expenses="expenses" :settlements="settlements"/>
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
            <GroupBalance :expenses="expenses" :settlements="settlements" :participants="participants" :currency="group.currency"/>
            <GroupSettlementsList :settlements="settlements" :group-id="group.id" :participants="participants"/>
          </div>
        </div>
        <div class="hidden lg:flex gap-10">
          <div class="w-2/3">
            <GroupExpensesList :groupId="id" :expenses="expenses"/>
          </div>
          <div class="w-1/3">
            <GroupBalance :expenses="expenses" :settlements="settlements" :participants="participants" :currency="group.currency"/>
          </div>
          <GroupSettlementsList :settlements="settlements" :group-id="group.id" :participants="participants"/>
        </div>
      </div>
      <router-view/>
    </template>


    <Transition name="slide">
      <SettingsSidebar v-if="groupSettingsVisible && group" :group="group" :participants="participants" @close="closeGroupSettings"/>
    </Transition>

  </section>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0.5;
  transform: translateX(100%);
}
</style>