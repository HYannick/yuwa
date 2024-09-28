<template>
  <input v-model="value" :class="`rounded-xl ${size} w-full ${color} ${textColor} font-semibold`" :type="type" :placeholder="placeholder" :required="required" :name="name" />
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
  placeholder?: string,
  type?: string,
  required?: boolean,
  size?: string,
  color?: string,
  textColor?: string
}>(), {
  placeholder: 'Input Text',
  type: 'text',
  required: false,
  size: 'p-5',
  color: 'bg-gray-100',
  textColor: 'text-gray-800'
})
</script>