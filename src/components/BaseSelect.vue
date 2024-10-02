<template>
  <label :for="name" class="font-bold text-gray-800 dark:text-zinc-400" v-if="label">{{label}}</label>
  <select v-model="value" :id="id" :name="name" class="mt-2 rounded-xl h-14 px-5 w-full bg-zinc-200 dark:bg-zinc-800 text-gray-800 dark:text-zinc-400 font-semibold" :required="required">
    <option v-for="option in props.options" :key="option.value" :value="option.value">{{ option.label }}</option>
  </select>
</template>

<script lang="ts" setup>
import {computed} from 'vue';

const props = withDefaults(defineProps<{
  modelValue: string | number;
  name: string;
  id: string;
  required?: boolean;
  label?: string;
  options: {label: string, value: string | number}[]
}>(), {
  required: false,
  label: ''
})
const emit = defineEmits(['update:modelValue']);
const value = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})


</script>