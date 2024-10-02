<template>
  <RouterLink
      :to="to"
      tag="button"
      :class="`flex justify-center text-zinc-50 items-center text-center ${bgColor} font-bold rounded-xl px-4 ${sizeCss} dark:text-zinc-100`">
    <slot/>
  </RouterLink>
</template>

<script lang="ts" setup>

import {computed} from 'vue';

const props = withDefaults(defineProps<{
  to: string,
  bgColor?: string,
  size?: 'small' | 'medium' | 'large';
}>(), {
  bgColor: 'bg-gray-900 dark:bg-amber-600',
  size: 'medium'
})

const sizeCss = computed(() => {
  switch (props.size) {
    case 'small':
      return 'h-10';
    case 'medium':
      return 'h-14';
    case 'large':
      return 'h-16';
    default:
      return 'h-14';
  }
});
</script>