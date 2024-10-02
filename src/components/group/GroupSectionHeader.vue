<template>
  <div class="flex items-center gap-2 mb-5">
    <component :is="headerIcon" class="w-5 stroke-2 stroke-gray-800" />
    <h2 class="font-semibold text-2xl">{{label}}</h2>
  </div>
</template>
<script setup lang="ts">
withDefaults(defineProps<{showAction?: boolean, to: string, headerIcon: any, label: string }>(), {showAction: true})
</script>