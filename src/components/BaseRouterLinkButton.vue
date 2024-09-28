<template>
  <RouterLink
      :to="to"
      tag="button"
      :class="`flex justify-center items-center text-center ${bgColor} font-bold text-gray-50 border-transparent rounded-xl p-4 ${size}`">
    <slot />
  </RouterLink>
</template>

<script lang="ts" setup>

withDefaults(defineProps<{
  to: string,
  bgColor?: string,
  size?: string;
}>(), {
  bgColor: 'bg-indigo-500',
  size: 'h-16'
})
</script>