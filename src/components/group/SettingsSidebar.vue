<template>
  <div class="w-full fixed z-50 top-0 right-0 bg-gray-50 h-screen p-5">
    <div class="flex flex-col rounded-xl pb-4">
      <button @click="$emit('close')" class="flex items-center p-2 w-10 aspect-square">
        <ArrowLeftIcon class="w-6 stroke-[3px]"/>
      </button>
      <h2 class="text-4xl font-bold font-display mt-10 ml-10">Settings</h2>
    </div>
    <hr class="my-5">
    <div>
      <p class="text font-semibold mb-4">Edit Group name</p>
      <form @submit.prevent="handleUpdateGroup" class="flex items-center gap-4">
        <BaseInput v-model="groupUpdateName" id="name" name="groupName" required />
        <BaseButton type="submit" class="bg-teal-400">
          <RocketLaunchIcon class="w-6 stroke-2"/>
        </BaseButton>
      </form>
      <p v-if="errorEditGroup">{{ errorEditGroup }}</p>
    </div>
    <hr class="my-5">
    <div>
      <p class="text font-semibold mb-4">Participants</p>
      <div class="flex gap-2">
        <div class="rounded bg-white py-2 px-4" v-for="participant in participants">
          <span class="text-sm font-bold">{{ participant.name }}</span></div>
      </div>
    </div>
    <hr class="my-5">
    <div>
      <p class="text font-semibold mb-4">Share group</p>
      <div class="border-4 border-gray-800 rounded-xl p-5 flex justify-between items-center w-2/3 aspect-square" v-if="qrCode">
        <img :src="qrCode" alt="QR code to join the group" class="w-full mx-auto"/>
      </div>
      <div class="flex gap-4 mt-4">
        <BaseButton type="button" size="small" @click="copyLink(invitationLink)">Copy link</BaseButton>
        <BaseButton type="button" size="small" @click="generateQRCode">QR Code</BaseButton>
      </div>
    </div>
    <hr class="my-5">
    <div>
      <div class="flex gap-2 items-center mb-4">
        <ExclamationTriangleIcon class="w-6 stroke-2"/>
        <p class="text font-semibold">Danger Zone</p>
      </div>
      <BaseButton type="button" @click="handleDeleteGroup" class="delete-button" bg-color="bg-red-400 w-full">
        Delete group
      </BaseButton>
    </div>
  </div>
</template>
<script setup lang="ts">
import {copyLink} from '@/utils/dom.utils.ts';
import BaseButton from '@/components/BaseButton.vue';
import {ArrowLeftIcon, ExclamationTriangleIcon, RocketLaunchIcon} from '@heroicons/vue/24/outline';
import BaseInput from '@/components/BaseInput.vue';
import {computed, inject, ref} from 'vue';
// noinspection TypeScriptCheckImport
import QRious from 'qrious';
import {generateGroupInvitationLink} from '@/utils/common.utils.ts';
import {Group} from '@/domain/Group.ts';
import {GroupParticipant} from '@/domain/GroupParticipant.ts';
import {GroupService} from '@/services/GroupService.ts';
const groupService = inject('groupService') as GroupService;

const props = defineProps<{group: Group; participants: GroupParticipant[] }>();
const errorEditGroup = ref('');
const groupUpdateName = ref(props.group.name);

const qrCode = ref();
const invitationLink = computed(() => generateGroupInvitationLink(props.group));
const generateQRCode = () => {
  const qr = new QRious({
    value: invitationLink.value,
  });
  qr.set({
    size: 500,
  });
  qrCode.value = qr.toDataURL();
}
const handleUpdateGroup = async () => {
  errorEditGroup.value = '';
  const { error: updateError } = await groupService.updateGroupDetails(props.group.id, {
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
    const { error: deleteError } = await groupService.deleteGroup(props.group.id);
    if (deleteError) {
      errorEditGroup.value = 'Failed to delete group.';
    }
  }
};

</script>