<template>
  <button
    type="button"
    :id="id"
    :class="['toggle', modelValue ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-600']"
    :aria-checked="modelValue"
    role="switch"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span :class="['toggle-thumb', modelValue ? 'translate-x-5' : 'translate-x-1']" />
  </button>
</template>

<script setup lang="ts">
defineProps<{ modelValue: boolean; id?: string }>()
defineEmits<{ 'update:modelValue': [v: boolean] }>()
</script>
