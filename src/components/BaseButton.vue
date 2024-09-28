<template>
  <button :type="type" :class="`text-center ${bgColor} font-bold text-gray-50 border-transparent rounded-xl p-4 ${size}`">
    <slot></slot>
  </button>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{
  type: 'button' | 'submit' | 'reset',
  bgColor?: string,
  size?: string;
}>(), {
  bgColor: 'bg-indigo-500',
  size: 'h-16'
});
</script>