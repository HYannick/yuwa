<template>
  <router-link :to="to" class="flex items-center p-2 w-10 text-gray-800 dark:text-zinc-400 aspect-square"><ArrowLeftIcon class="w-full stroke-[3px]" /></router-link>
</template>
<script setup lang="ts">
import {ArrowLeftIcon} from '@heroicons/vue/24/outline';
withDefaults(defineProps<{to: any; label?: string}>(), {
  to: '/',
  label: 'Back'
})
</script>