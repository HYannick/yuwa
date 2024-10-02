<script setup lang="ts">
import {storeToRefs} from 'pinia';
import {useUserStore} from '@/stores/userStore.ts';
import {computed, inject, onMounted, ref} from 'vue';
import {GroupService} from '@/services/GroupService.ts';
import BaseInput from '@/components/BaseInput.vue';
import {
  MagnifyingGlassIcon,
  ChevronRightIcon,
  ArrowTopRightOnSquareIcon,
  XMarkIcon,
  UserGroupIcon,
  ArrowLeftEndOnRectangleIcon,
  PlusIcon
} from '@heroicons/vue/24/outline';
import BaseHeader from '@/components/BaseHeader.vue';
import {useGroupStore} from '@/stores/groupStore.ts';
import {useSidebarHistoryState} from '@/composables/useSidebarHistoryState.ts';
import Summary from '@/components/Summary.vue';

const groupStore = useGroupStore();
const {user} = storeToRefs(useUserStore());
const {groups} = storeToRefs(groupStore);
const groupService = inject('groupService') as GroupService;
const userStore = useUserStore();
const loading = ref(true);
const error = ref('');

const loadUserGroups = async () => {
  if (groups.value.length > 0) {
    loading.value = false;
    return;
  }

  if (!userStore.user) {
    loading.value = false;
    error.value = 'User not authenticated.';
    return;
  }

  const userId = userStore.user.auth_id;

  const {error: fetchError} = await groupService.fetchUserGroups(userId);

  loading.value = false;

  if (fetchError) {
    error.value = 'Failed to load groups.';
  } else {
  }
};

onMounted(async () => {
  await loadUserGroups();
});
const {onBackButtonPressed, pushTo, resetRoute} = useSidebarHistoryState();
const controlsOpen = ref(false);
const toggleControls = () => {
  pushTo('controls');
  controlsOpen.value = !controlsOpen.value;
}
const closeControls = () => {
  resetRoute('controls');
  controlsOpen.value = false;
}

onMounted(() => {
  window.addEventListener('popstate', () => onBackButtonPressed(controlsOpen.value, closeControls));
});
</script>

<template>
  <section class="bg-zinc-100 dark:bg-zinc-900 w-screen min-h-screen md:max-w-screen min-h-screen-xl md:m-auto p-4">
    <div>
      <BaseHeader :username="user!.name!"/>
      <Summary />
      <div class="flex justify-between items-center">
        <h2 class="text-gray-800 dark:text-zinc-400 font-bold text-2xl mb-10 font-display relative">
          <span class="text-gray-400 dark:text-zinc-600 text-lg">Here are</span><br>
          <span class="text-gray-800 dark:text-zinc-400 text-4xl relative z-10">Your Groups</span>
          <span class="rounded-full w-7 aspect-square bg-orange-300 dark:bg-yellow-800 absolute -bottom-2 left-0"></span>
        </h2>
        <div class="relative">
          <MagnifyingGlassIcon class="w-8 stroke-2 stroke-gray-800 dark:stroke-zinc-100"/>
        </div>
      </div>
      <Transition name="fade" mode="out-in">
        <div v-if="loading" class="flex flex-col w-full justify-center items-center">
          <img src="@/assets/illustrations/undraw_loading.svg" alt="loading" class="w-2/3"/>
          <p class="text-2xl mt-10">One moment...</p>
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
            <li v-for="group in groups" :key="group.id" class="rounded-2xl bg-zinc-200 dark:bg-zinc-800 py-3 px-4 text-gray-800 dark:text-zinc-400 mb-5">
              <router-link :to="`/groups/${group.id}`" class="flex justify-between items-center">
                <div class="flex flex-col">
                  <span class="font-bold text-lg">{{ group.name }}</span>
                  <span class="text-gray-400 dark:text-zinc-500">{{ new Date(group.created_at).toDateString() }}</span>
                </div>
                <ChevronRightIcon class="w-6 stroke-2 stroke-gray-300 dark:stroke-zinc-300"/>
              </router-link>
            </li>
          </ul>
        </div>
      </Transition>

      <div class="h-20"></div>
      <div class="fixed right-5 bottom-5 z-50 flex flex-col items-end">
        <Transition name="slide">
          <div class="flex flex-col gap-5 mb-5 items-end" v-if="controlsOpen">
            <router-link to="/groups/create" class="flex gap-5 items-center">
              <span class="font-bold">New group</span>
              <div class="w-16 h-16 rounded-2xl bg-gray-800 dark:bg-gray-50 flex items-center justify-center">
                <UserGroupIcon class="w-6 stroke-2 stroke-white"/>
              </div>
            </router-link>
            <router-link to="/groups/request" class="flex gap-5 items-center">
              <span class="font-bold">Join a group</span>
              <div class="w-16 h-16 rounded-2xl bg-gray-800 dark:bg-gray-50 flex items-center justify-center">
                <ArrowLeftEndOnRectangleIcon class="w-6 stroke-2 stroke-white"/>
              </div>
            </router-link>
          </div>
        </Transition>
        <button class="w-16 h-16 rounded-2xl bg-gray-800 dark:bg-amber-600 flex items-center justify-center" @click="toggleControls">
          <PlusIcon class="w-6 stroke-2 stroke-white"/>
        </button>
      </div>
      <Transition name="fade">
        <div v-if="controlsOpen" class="fixed inset-0 bg-zinc-100 dark:bg-zinc-900 bg-opacity-90" @click="closeControls"></div>
      </Transition>
    </div>
  </section>
  <PWABadge/>
</template>