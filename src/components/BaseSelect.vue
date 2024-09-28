<template>
  <select v-model="value" :id="id" :name="name" class="rounded-xl p-5 w-full bg-gray-100 font-semibold" :required="required">
    <option v-for="option in props.options" :key="option.value" :value="option.value">{{ option.label }}</option>
  </select>
</template>

<script lang="ts" setup>
import {computed} from 'vue';

const props = withDefaults(defineProps<{
  modelValue: string | number,
  name: string,
  id: string,
  required?: boolean,
  options: {label: string, value: string | number}[]
}>(), {
  required: false
})
const emit = defineEmits(['update:modelValue']);
const value = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})


</script>