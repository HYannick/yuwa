<template>
  <Teleport to="body">
    <Transition name="slide">
      <MenuDetails v-if="menuOpen" @close="$emit('close')" />
    </Transition>
  </Teleport>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="menuOpen" class="fixed inset-0 bg-zinc-100 dark:bg-zinc-900 bg-opacity-40 dark:bg-opacity-90 z-40" @click="$emit('close')"></div>
    </Transition>
  </Teleport>
</template>
<script setup lang="ts">
import MenuDetails from '@/components/MenuDetails.vue';
defineProps<{menuOpen: boolean}>();
defineEmits(['close']);
</script>