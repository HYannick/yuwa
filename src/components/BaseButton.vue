<template>
  <button :type="type" :class="`relative overflow-hidden text-center ${bgColor} font-bold text-gray-50 border-transparent rounded-xl px-4 ${sizeCss}`" @click="createRipple">
    <slot></slot>
  </button>
</template>

<script lang="ts" setup>
import {computed} from 'vue';

const props = withDefaults(defineProps<{
  type: 'button' | 'submit' | 'reset',
  bgColor?: string,
  size?: 'small' | 'medium' | 'large';
}>(), {
  bgColor: 'bg-gray-900 dark:bg-amber-600',
  size: 'medium'
});

const sizeCss = computed(() => {
  switch (props.size) {
    case 'small':
      return 'h-12';
    case 'medium':
      return 'h-14';
    case 'large':
      return 'h-16';
    default:
      return 'h-14';
  }
});

const createRipple = (event: MouseEvent) => {
  const button = event.currentTarget as HTMLElement;

  const circle = document.createElement("span");
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
  circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
  circle.classList.add("ripple");

  const ripple = button.getElementsByClassName("ripple")[0];

  if (ripple) {
    ripple.remove();
  }

  button.appendChild(circle);
};
</script>

<style>
span.ripple {
  position: absolute; /* The absolute position we mentioned earlier */
  border-radius: 50%;
  transform: scale(0);
  animation: ripple 600ms linear forwards;
  background-color: rgba(255, 255, 255, 0.2);
  z-index: 99;
}
@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
</style>