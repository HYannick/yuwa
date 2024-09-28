<script setup lang="ts">
import {storeToRefs} from 'pinia';
import {useUserStore} from '@/stores/userStore.ts';
import {computed, inject, onMounted, ref} from 'vue';
import {GroupService} from '@/services/GroupService.ts';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';
import BaseRouterLinkButton from '@/components/BaseRouterLinkButton.vue';

const {user} = storeToRefs(useUserStore());
const groupService = inject('groupService') as GroupService;

const userStore = useUserStore();
const groups = ref([]);
const loading = ref(true);
const error = ref('');

const loadUserGroups = async () => {
  if (!userStore.user) {
    loading.value = false;
    error.value = 'User not authenticated.';
    return;
  }

  const userId = userStore.user.auth_id;

  const {data, error: fetchError} = await groupService.fetchUserGroups(userId);
  loading.value = false;

  if (fetchError) {
    error.value = 'Failed to load groups.';
  } else {
    groups.value = data;
  }
};

const groupURL = ref('');
const sanitizedURL = computed(() => {
  const pattern = /\?(.*)/;
  return  groupURL.value.match(pattern);
})
const joinGroupVisible = ref(false)
const toggleGroupJoin = () => {
  joinGroupVisible.value = !joinGroupVisible.value;
}

onMounted(() => {
  loadUserGroups();
});
</script>

<template>
  <section class="w-screen md:max-w-screen-xl md:m-auto p-4 h-screen">
    <template class="flex flex-col h-full">
      <h1 class="font-display text-gray-400"><span class="text-2xl">Hello</span>,<br><span
          class="text-4xl font-semibold text-indigo-400">{{ user?.name }}</span></h1>
      <h2 class="text-gray-800 font-bold text-2xl mt-10 mb-5">Your Groups</h2>
        <div v-if="loading">
          <p>Loading your groups...</p>
        </div>
        <div v-else-if="groups.length == 0" class="flex h-full items-end justify-center">
          <h3 class="text-gray-400 font-black text-2xl text-center mb-56">
            <span class="font-normal text-xl">You are not part of a group yet :(</span>
            <br>
            Join or Create a new group!
          </h3>
        </div>
        <div v-else class="flex-1 overflow-y-scroll">
          <ul>
            <li v-for="group in groups" :key="group.id" class="rounded-2xl bg-gray-100 py-3 px-4 text-gray-800 mb-5">
              <router-link :to="`/groups/${group.id}`" class="flex flex-col">
                <span class="font-bold text-lg">{{ group.name }}</span>
                <span class="text-gray-400">{{ new Date(group.created_at).toDateString() }}</span>
              </router-link>
            </li>
          </ul>
        </div>
      <div class="flex gap-4 w-full">
      <BaseRouterLinkButton to="/groups/create" class="w-full">Create a group</BaseRouterLinkButton>
      <BaseButton type="button" @click="toggleGroupJoin" class="w-full">Join a group</BaseButton>
      </div>
      <div v-if="joinGroupVisible">
        <p>the group URL</p>
        <BaseInput name="groupURL" v-model="groupURL" />
        <RouterLink :to="`/join-group?${sanitizedURL}`">Join a group</RouterLink>
      </div>
    </template>
  </section>
  <PWABadge/>
</template>

<style scoped>

</style>
