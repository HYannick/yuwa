<template>
  <div class="flex justify-between">
    <div class="flex items-center gap-3">
      <div class="rounded-xl w-14 aspect-square bg-orange-300 overflow-hidden">
        <img alt="avatar" src="@/assets/avatar_placeholder.jpeg" class="object-cover"/>
      </div>
      <h1 class="font-display text-gray-400"><span class="text-lg">{{ greetings }}</span>,<br><span
          class="font-semibold text-gray-800 text-2xl">{{ username }}</span></h1>
    </div>
    <div class="flex items-center gap-3">
      <div class="flex items-center justify-center rounded-full relative">
        <Bars2Icon type="button" class="w-8 stroke-2" @click="openMenu"/>
      </div>
    </div>
    <MenuLayout :menu-open="menuOpen" @close="closeMenu" />
  </div>
</template>
<script lang="ts" setup>
import {computed, ref} from 'vue';
import {Bars2Icon} from '@heroicons/vue/24/outline';
import MenuLayout from '@/components/MenuLayout.vue';
import {useSidebarHistoryState} from '@/composables/useSidebarHistoryState.ts';

const menuOpen = ref(false);
defineProps<{ username: string }>()
const {onBackButtonPressed, pushTo, resetRoute} = useSidebarHistoryState();
const openMenu = () => {
  menuOpen.value = true;
  pushTo('menu')
}

const closeMenu = () => {
  resetRoute('menu')
  menuOpen.value = false;
}

window.addEventListener('popstate', () => onBackButtonPressed(menuOpen.value, closeMenu));

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
</script>