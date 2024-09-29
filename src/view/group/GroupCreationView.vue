<script setup lang="ts">
import BaseButton from '@/components/BaseButton.vue';
import {inject, ref} from 'vue';
import BaseInput from '@/components/BaseInput.vue';
import {GroupService} from '@/services/GroupService.ts';
import {copyLink} from '@/utils/dom.utils.ts';
import {generateGroupInvitationLink} from '@/utils/common.utils.ts';
import BackButton from '@/components/BackButton.vue';
const groupService = inject('groupService') as GroupService;

const invitationLink = ref('');
const error = ref<string | null>(null);
const groupName = ref('');


const handleCreateGroup = async () => {
  const {data: groupData, error: groupError} = await groupService.createGroup(groupName.value);
  if (groupError || !groupData) {
    error.value = groupError?.message || 'Error creating group.'
    return
  }

  const group = groupData[0];
  invitationLink.value = generateGroupInvitationLink(group);

}
</script>

<template>
  <section class="w-screen md:max-w-screen-xl md:m-auto p-5 h-screen">
    <div class="flex flex-col h-full">
      <BackButton />
      <form  v-if="!invitationLink" class="flex flex-col flex-1" @submit.prevent="handleCreateGroup">
        <h2 class="font-body text-2xl font-bold my-5">Create your group</h2>
        <BaseInput name="name" v-model="groupName" placeholder="Group name" required/>
        <hr class="h-1 my-8 mx-auto w-52 bg-gray-100 rounded border-transparent"/>
        <BaseButton type="submit" v-if="!invitationLink">Create the group</BaseButton>
      </form>
      <div v-else class="text-center">
        <h2 class="text-4xl font-body font-bold my-5">Group created!</h2>
        <img  src="@/assets/illustrations/undraw_social_share.svg" alt="Group created" class="w-full my-10"/>
        <p class="my-10 text-xl">Here is the invitationLink to share to your participants</p>
        <input class="rounded-xl p-5 w-full bg-gray-100 font-semibold" type="text" readonly :value="invitationLink" />
        <BaseButton type="button" class="my-10 w-full" @click="copyLink(invitationLink)">Copy Link</BaseButton>
      </div>
    </div>

  </section>
</template>

<style scoped>
</style>
