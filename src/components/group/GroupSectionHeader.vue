<template>
  <div class="flex justify-between items-center mb-5">
    <h2 class="font-semibold text-2xl">{{label}}</h2>
    <BaseRouterLinkButton v-if="showAction" :to="to" size="small" class="gap-2 bg-orange-400">
      <component :is="actionIcon" class="w-5 stroke-2 stroke-white" />
      Add
    </BaseRouterLinkButton>
  </div>
</template>
<script setup lang="ts">
import BaseRouterLinkButton from '@/components/BaseRouterLinkButton.vue';
withDefaults(defineProps<{showAction?: boolean, to: string, actionIcon: any, label: string }>(), {showAction: true})
</script>