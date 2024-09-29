<script setup lang="ts">
import {storeToRefs} from 'pinia';
import {useUserStore} from '@/stores/userStore.ts';
import {computed, inject, onMounted, ref} from 'vue';
import {GroupService} from '@/services/GroupService.ts';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';
import BaseRouterLinkButton from '@/components/BaseRouterLinkButton.vue';
import {Group} from '@/domain/Group';
import {MagnifyingGlassIcon, ChevronRightIcon} from '@heroicons/vue/24/outline';
import BaseHeader from '@/components/BaseHeader.vue';

const {user} = storeToRefs(useUserStore());
const groupService = inject('groupService') as GroupService;

const userStore = useUserStore();
const groups = ref<Group[]>([]);
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
  return groupURL.value.match(pattern);
})
const joinGroupVisible = ref(false)
const toggleGroupJoin = () => {
  joinGroupVisible.value = !joinGroupVisible.value;
}

const greetings = computed(() => {
  const currentHour: number = new Date().getHours();

  if (currentHour >= 5 && currentHour < 12) {
    return "Good morning";
  } else if (currentHour >= 12 && currentHour < 17) {
    return "Good afternoon";
  } else if (currentHour >= 17 && currentHour < 21) {
    return "Good evening";
  } else {
    return "Hello";
  }
})


onMounted(() => {
  loadUserGroups();
});
</script>

<template>
  <section class="w-screen md:max-w-screen-xl md:m-auto p-4 h-screen">
    <div class="">
      <BaseHeader :username="user!.name!"/>
      <div class="w-full h-16"></div>
      <div class="flex justify-between items-center">
        <h2 class="text-gray-800 font-bold text-2xl mb-10 font-display relative">
          <span class="text-gray-400 text-lg">Here are</span><br>
          <span class="text-gray-800 text-4xl">Your Groups</span>
          <span class="rounded-full w-7 aspect-square bg-orange-300 absolute -bottom-2 left-0 -z-10"></span>
        </h2>
        <div class="relative">
          <MagnifyingGlassIcon class="w-8 stroke-2"/>
          <span class="rounded-full w-6 aspect-square bg-orange-100 absolute -bottom-1 right-0 -z-10"></span></div>
      </div>
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
      <div v-else>
        <ul>
          <li v-for="group in groups" :key="group.id" class="rounded-2xl bg-gray-100 py-3 px-4 text-gray-800 mb-5">
            <router-link :to="`/groups/${group.id}`" class="flex justify-between items-center">
              <div class="flex flex-col">
                <span class="font-bold text-lg">{{ group.name }}</span>
                <span class="text-gray-400">{{ new Date(group.created_at).toDateString() }}</span>
              </div>
              <ChevronRightIcon class="w-6 stroke-2 stroke-gray-300"/>
            </router-link>
          </li>
        </ul>
      </div>
      <div class="h-40"></div>
      <div class="fixed bottom-1 left-0 flex gap-4 w-full border-2 p-2 rounded-2xl">
        <BaseRouterLinkButton to="/groups/create" size="medium" class="w-full">Create a group</BaseRouterLinkButton>
        <BaseButton type="button" @click="toggleGroupJoin" class="w-full">Join a group</BaseButton>
      </div>
      <div v-if="joinGroupVisible">
        <p>the group URL</p>
        <BaseInput name="groupURL" v-model="groupURL"/>
        <RouterLink :to="`/join-group?${sanitizedURL}`">Join a group</RouterLink>
      </div>
    </div>
  </section>
  <PWABadge/>
</template>
