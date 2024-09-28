<script lang="ts" setup>
import {ref, onMounted, inject, computed, watch} from 'vue';
import {GroupService} from '@/services/GroupService.ts';
import {useRoute} from 'vue-router';
import BaseButton from '@/components/BaseButton.vue';
import {generateGroupInvitationLink} from '@/utils/common.utils';
import {copyLink} from '@/utils/dom.utils.ts';
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
// noinspection TypeScriptCheckImport
import QRious from 'qrious';
import BaseInput from '@/components/BaseInput.vue';

const groupService = inject('groupService') as GroupService;
const expenseService = inject('expenseService') as ExpenseService;
const settlementService = inject('settlementService') as SettlementService;
const route = useRoute();
const groupId = route.params.id as string;
const group = ref<Group | null>(null);
const loading = ref(true);
const expenses = ref<Expense[]>([]);
const settlements = ref<Settlement[]>([]);
const participants = ref<GroupParticipant[]>([]);
const groupSettingsVisible = ref(false);
const tabs = ref(['Expenses', 'Balances']);
const currentTab = ref('Expenses');
const switchTab = (tab: string) => {
  currentTab.value = tab;
}


const invitationLink = computed(() => generateGroupInvitationLink(group.value));

const loadGroupData = async () => {
  loading.value = true;

  const {data: groupData} = await groupService.fetchGroupDetails(groupId);

  group.value = groupData.group;
  participants.value = groupData.participants;
  expenses.value = await expenseService.fetchExpenses(groupId);
  settlements.value = await settlementService.fetchGroupSettlements(groupId);
  loading.value = false;
};

const openGroupSettings = () => {
  groupSettingsVisible.value = true;
}

const qrCode = ref();
const generateQRCode = () => {
  const qr = new QRious({
    value: invitationLink.value,
  });
  qr.set({
    size: 500,
  });
  qrCode.value = qr.toDataURL();
}

const errorEditGroup = ref('');
const groupUpdateName = ref('');

watch(group, () => {
  groupUpdateName.value = group.value?.name || '';
});
const handleUpdateGroup = async () => {
  errorEditGroup.value = '';
  const { error: updateError } = await groupService.updateGroupDetails(groupId, {
    name: groupUpdateName.value,
    // Include other fields to update
  });
  if (updateError) {
    errorEditGroup.value = 'Failed to update group.';
  }
};

const handleDeleteGroup = async () => {
  const confirmDelete = confirm('Are you sure you want to delete this group? This action cannot be undone.');
  if (confirmDelete) {
    const { error: deleteError } = await groupService.deleteGroup(groupId);
    if (deleteError) {
      errorEditGroup.value = 'Failed to delete group.';
    }
  }
};

onMounted(() => {
  loadGroupData();
});
</script>

<template>
  <section class="w-screen md:max-w-screen-xl md:m-auto p-5 h-screen">
    <div class="flex justify-between">
      <router-link to="/" tag="button">Back</router-link>
      <button @click="openGroupSettings">Settings</button>
    </div>
    <div v-if="loading">
      <p>Loading...</p>
    </div>
    <template v-else-if="group">
      <GroupHeader :group="group" :expenses="expenses" :settlements="settlements"/>
      <hr class="h-1 my-8 mx-auto w-52 bg-gray-100 rounded border-transparent"/>
      <div class="flex justify-center gap-4 mb-5 lg:hidden">
        <template v-for="tab in tabs" :key="tab">
          <button
              @click="switchTab(tab)"
              :class="`px-4 py-2 rounded-xl ${currentTab === tab ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-800'}`"
          >
            {{ tab }}
          </button>
        </template>
      </div>
      <div class="bg-gray-100 -mx-5 p-5 rounded-3xl">
        <div class="lg:hidden">
          <div v-if="currentTab === 'Expenses'">
            <GroupExpensesList :groupId="group.id" :expenses="expenses"/>
          </div>
          <div v-else-if="currentTab === 'Balances'" class="my-10">
            <GroupBalance :expenses="expenses" :settlements="settlements" :participants="participants" :currency="group.currency"/>
          </div>
        </div>
        <div class="hidden lg:flex gap-10">
          <div class="w-2/3">
            <GroupExpensesList :groupId="group.id" :expenses="expenses"/>
          </div>
          <div class="w-1/3">
            <GroupBalance :expenses="expenses" :settlements="settlements" :participants="participants" :currency="group.currency"/>
          </div>
        </div>
        <GroupSettlementsList :settlements="settlements" :group-id="group.id" :participants="participants"/>
      </div>
    </template>


    <Transition name="slide">
      <div v-if="groupSettingsVisible" class="w-80 fixed top-0 right-0 bg-gray-50 h-screen p-5">
        <div class="flex justify-between">
          <h2 class="text-2xl font-bold font-display">Settings</h2>
          <button @click="groupSettingsVisible = false">Close</button>
        </div>
        <hr class="my-5">
        <div>
          <p class="text-xl font-bold mb-4">Edit Group name</p>
          <form @submit.prevent="handleUpdateGroup">
            <div>
              <label for="name">Group Name:</label>
              <BaseInput v-model="groupUpdateName" id="name" name="groupName" required />
            </div>
            <!-- Add other editable fields as needed -->
            <BaseButton type="submit">Save Changes</BaseButton>
            <BaseButton type="button" @click="handleDeleteGroup" class="delete-button">
              Delete Group
            </BaseButton>
          </form>
          <p v-if="errorEditGroup">{{ errorEditGroup }}</p>
        </div>
        <div>
          <p class="text-xl font-bold mb-4">Participants</p>
          <div class="flex flex-col gap-2">
            <div class="rounded-2xl bg-white p-4" v-for="participant in participants">
              <span class="text-lg font-bold">{{ participant.name }}</span></div>
          </div>
        </div>
        <hr class="my-5">
        <div>
          <p class="text-xl font-bold mb-4">Share group</p>
          <div class="border-4 border-gray-800 rounded-xl p-5 flex justify-between items-center w-2/3 aspect-square" v-if="qrCode">
            <img :src="qrCode" alt="QR code to join the group" class="w-full mx-auto"/>
          </div>
          <div class="flex gap-4 mt-4">
            <BaseButton type="button" @click="copyLink(invitationLink)">Copy link</BaseButton>
            <BaseButton type="button" @click="generateQRCode">QR Code</BaseButton>
          </div>
        </div>
      </div>
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
  transform: translateX(320px);
}
</style>