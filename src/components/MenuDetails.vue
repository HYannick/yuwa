<template>
  <div class="w-full fixed z-50 top-0 left-32 right-0 bg-zinc-100 dark:bg-zinc-900 text-gray-800 dark:text-zinc-400 h-screen p-5">
    <div class="relative z-10">
      <div class="flex rounded-xl pb-4 items-center">
        <button @click="$emit('close')" class="flex items-center p-2 w-10 aspect-square">
          <ArrowLeftIcon class="w-6 stroke-[3px]"/>
        </button>
        <h2 class="text-xl font-bold font-display">Menu</h2>
      </div>
      <ul>
        <li class="p-3">
          <router-link to="profile" class="text-xl">Profile</router-link>
        </li>
        <li class="p-3">
          <router-link to="settings" class="text-xl">Settings</router-link>
        </li>
        <li class="p-3">
          <button @click="signOut" class="text-xl text-rose-500">Disconnect</button>
        </li>
        <li class="p-3">
          <button class="text-xl" @click="switchTheme">{{ isDarkMode ? 'Disable Dark Mode' : 'Enable Dark Mode' }}</button>
        </li>
      </ul>
    </div>
  </div>
</template>
<script setup lang="ts">
import {ArrowLeftIcon} from '@heroicons/vue/24/outline';
import {inject} from 'vue';
import {AuthService} from '@/services/AuthService.ts';
import {useTheme} from '@/composables/useTheme.ts';

const authService = inject('authService') as AuthService;
const { isDarkMode, switchTheme } = useTheme();

const signOut = async () => {
  await authService.signOut();
  window.location.reload();
}
</script>