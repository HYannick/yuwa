<template>
  <div class="flex justify-between items-center mb-5">
    <h2 class="font-semibold text-2xl">{{label}}</h2>
    <BaseRouterLinkButton v-if="showAction" :to="to" size="small" class="gap-2 border-2 border-indigo-300 bg-indigo-500 text-gray-800">
      <component :is="actionIcon" class="w-5 stroke-2 stroke-indigo-50" />
    </BaseRouterLinkButton>
  </div>
</template>
<script setup lang="ts">
import BaseRouterLinkButton from '@/components/BaseRouterLinkButton.vue';
import {VueElement} from 'vue';
withDefaults(defineProps<{showAction?: boolean, to: string, actionIcon: VueElement, label: string }>(), {showAction: true})
</script>