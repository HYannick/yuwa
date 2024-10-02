<script setup lang="ts">
import PWABadge from './components/PWABadge.vue'
import {RouterView, useRouter} from 'vue-router'
import {onMounted, provide, ref} from 'vue';
import {useTheme} from '@/composables/useTheme.ts';

const router = useRouter()
const transitionName = ref('')

const { setTheme } = useTheme();

router.afterEach((to, from) => {
  const toDepth = to.path.split('/').length
  const fromDepth = from.path.split('/').length
  transitionName.value = toDepth < fromDepth ? 'prev' : 'next'
})

onMounted(() => {
  setTheme();
})
</script>

<template>
  <main class="bg-zinc-100 dark:bg-zinc-900">
    <RouterView v-slot="{ Component, route}">
      <Transition :name="transitionName">
        <div :key="route.path">
          <component :is="Component"/>
        </div>
      </Transition>
      <PWABadge/>
    </RouterView>
  </main>

</template>

<style scoped>
main {
  display: grid;
  grid-template: "main";
  z-index: 0;
  height: 100vh;
}

main > :first-child {
  z-index: 1; /* Prevent flickering on first frame when transition classes not added yet */
}

main > * {
  grid-area: main; /* Transition: make sections overlap on same cell */
  position: relative;
}

/* Transitions */

.next-leave-to {
  animation: leaveToLeft 500ms both cubic-bezier(0.165, 0.84, 0.44, 1);
  z-index: 0;
}

.next-enter-to {
  animation: enterFromRight 500ms both cubic-bezier(0.165, 0.84, 0.44, 1);
  z-index: 1;
}

.prev-leave-to {
  animation: leaveToRight 500ms both cubic-bezier(0.165, 0.84, 0.44, 1);
  z-index: 1;
}

.prev-enter-to {
  animation: enterFromLeft 500ms both cubic-bezier(0.165, 0.84, 0.44, 1);
  z-index: 0;
}

@keyframes leaveToLeft {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-25%);
    filter: brightness(0.5);
  }
}

@keyframes enterFromLeft {
  from {
    transform: translateX(-25%);
    filter: brightness(0.5);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes leaveToRight {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(100%);
  }
}

@keyframes enterFromRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
</style>
