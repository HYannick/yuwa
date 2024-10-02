<template>
  <label :for="name" class="font-bold text-gray-800 dark:text-zinc-400 block mb-2">{{label}}</label>
  <textarea v-model="value" class="rounded-xl p-5 w-full bg-zinc-200 font-semibold dark:bg-zinc-800" :name="name" :placeholder="placeholder"
            :id="name"></textarea>
</template>
<script setup lang="ts">
import {computed} from 'vue';

const emit = defineEmits(['update:modelValue'])

const value = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const props = withDefaults(defineProps<{
  modelValue: string | number,
  name: string,
  label?:string,
  placeholder?: string,
  type?: string,
  required?: boolean,
  size?: 'small' | 'medium' | 'large',
  color?: string,
  textColor?: string
}>(), {
  placeholder: 'Eg: Amazing trip to Antares',
  type: 'text',
  inputFor: '',
  label: '',
  required: false,
  size: 'medium',
  color: 'bg-zinc-200 dark:bg-zinc-800',
  textColor: 'text-gray-800 dark:text-zinc-400'
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