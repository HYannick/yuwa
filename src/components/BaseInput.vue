<template>
  <label :for="name" class="font-bold text-gray-800 dark:text-zinc-400 block mb-2" v-if="label">{{ label }}</label>
  <input v-model="value" :class="`rounded-xl ${sizeCss} px-5 w-full ${color} ${textColor} font-semibold`" :type="type" :placeholder="placeholder" :required="required" :name="name" />
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
  placeholder: 'Input Text',
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