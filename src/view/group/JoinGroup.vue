<!-- src/components/JoinGroup.vue -->
<template>
  <section class="bg-zinc-100 dark:bg-zinc-900 w-screen min-h-screen md:max-w-screen min-h-screen-xl md:m-auto p-5 flex flex-col items-center">
    <h3 class="text-5xl font-bold font-display my-10 text-center">
      <span v-if="error">Uh oh..</span>
      <span v-else-if="success"><span class="font-normal mb-2 text-4xl">Welcome to</span><br> <span
          class="font-bold text-fuchsia-900">{{ groupNameFromURL }}</span></span>
    </h3>
    <div class="flex-1 flex flex-col h-full justify-center gap-36">
      <template v-if="error">
        <template v-if="error.type === JoinErrorTypeEnum.ALREADY_JOINED">
          <p class="text-2xl text-center mb-20">Looks like you are already in this group! Start splitting :)</p>
          <BaseButton @click="router.push({ path: `/groups/${groupIdFromURL}` })" type="button" class="w-full">Continue</BaseButton>
        </template>
        <template v-else-if="error.type === JoinErrorTypeEnum.EXPIRED_TOKEN || error.type == JoinErrorTypeEnum.INVALID_TOKEN">
          <p class="text-2xl text-center mb-20">Looks like the token is not valid or expired ! Ask again to your group manager :)</p>
          <BaseButton @click="router.push({ name: 'home' })" type="button" class="w-full">Go to Home</BaseButton>
        </template>
        <template v-else-if="error.type === JoinErrorTypeEnum.MAX_USES_REACHED">
          <p class="text-2xl text-center mb-20">There is too many members in the group :(</p>
          <BaseButton @click="router.push({ name: 'home' })" type="button" class="w-full">Go to Home</BaseButton>
        </template>
        <template v-else>
          <p class="text-2xl text-center mb-20">We were unable to process the request :(. The link might be invalid or expired. Ask again to your
            group manager :)</p>
          <BaseButton @click="router.push({ name: 'home' })" type="button" class="w-full">Go to Home</BaseButton>
        </template>
      </template>
      <div v-else-if="success">
        <p class="text-2xl text-center mb-20">You have successfully joined the group!</p>
        <BaseButton @click="router.push({ path: `/groups/${groupId}` })" type="button" class="w-full">Continue</BaseButton>
      </div>
      <div v-else>
        <p class="text-2xl text-center mb-20">Attempt Joining group...</p>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import {ref, onMounted, inject} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {useUserStore} from '@/stores/userStore.ts';
import {GroupService, } from '@/services/GroupService.ts';
import BaseButton from '@/components/BaseButton.vue';
import {JoinErrorTypeEnum} from '@/domain/enums/JoinErrorTypeEnum.ts';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const groupService = inject('groupService') as GroupService;

const invitationToken = route.query.token as string;
const groupNameFromURL = route.query.group_name as string;
const groupIdFromURL = route.query.group_id as string;
const error = ref<{ type: string, message: string } | null>(null);
const success = ref(false);
const groupId = ref('');
const groupName = ref(route.query.group_name);

const joinGroup = async () => {
  if (!invitationToken) {
    error.value = {
      type: 'invalid-token',
      message: 'Invalid invitation link',
    };
    return;
  }

  await userStore.fetchUser();
  if (!userStore.user) {
    // Redirect to login with return URL
    await router.push({
      name: 'login',
      query: {returnUrl: route.fullPath, origin: 'groups/join', groupName: groupNameFromURL, groupId: groupIdFromURL}
    });
    return;
  }

  const userId = userStore.user.auth_id;
  const {data, error: joinError} = await groupService.joinGroupByToken(invitationToken, userId);

  if (joinError) {
    error.value = joinError
  } else {
    success.value = true;
    groupId.value = data.groupId;
    groupName.value = data.groupName;
  }
};

onMounted(() => {
  joinGroup();
});
</script>

