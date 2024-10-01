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
        <Bars2Icon type="button" class="w-8 stroke-2"/>
<!--        <span class="rounded-full w-6 aspect-square bg-orange-100 absolute -bottom-1 right-0 -z-10"></span>-->
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {computed} from 'vue';
import {Bars2Icon} from '@heroicons/vue/24/outline';

defineProps<{ username: string }>()

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