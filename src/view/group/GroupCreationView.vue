<script setup lang="ts">
import BaseButton from '@/components/BaseButton.vue';
import {inject, ref} from 'vue';
import BaseInput from '@/components/BaseInput.vue';
import {GroupService} from '@/services/GroupService.ts';
import {copyLink} from '@/utils/dom.utils.ts';
import {generateGroupInvitationLink} from '@/utils/common.utils.ts';
import BackRouterButton from '@/components/BackRouterButton.vue';
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
  <section class="bg-zinc-100 dark:bg-zinc-900 w-screen min-h-screen md:max-w-screen min-h-screen-xl md:m-auto p-5">
    <div class="flex flex-col h-full">
      <BackRouterButton />
      <form  v-if="!invitationLink" class="flex flex-col flex-1" @submit.prevent="handleCreateGroup">
        <h2 class="font-display text-4xl font-bold text-center my-10 text-gray-800 dark:text-zinc-400">Create your group</h2>
        <BaseInput name="name" v-model="groupName" placeholder="Group name" required/>
        <hr class="h-1 my-8 mx-auto w-52 bg-gray-200 dark:bg-gray-600 rounded border-transparent"/>
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
