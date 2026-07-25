<template>
  <div :class="['card p-6', clickable && 'card-hover group', className]" @click="clickable ? $emit('click') : undefined">
    <div v-if="icon || $slots.icon" class="flex items-start gap-4">
      <div v-if="icon" :class="['w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200', iconBgClass, clickable && 'group-hover:scale-110']">
        <span class="text-2xl">{{ icon }}</span>
      </div>
      <slot name="icon" />
      <div class="flex-1 min-w-0">
        <slot />
      </div>
    </div>
    <template v-else>
      <slot />
    </template>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon?: string
  iconBg?: 'brand' | 'success' | 'warning' | 'danger' | 'purple'
  clickable?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  iconBg: 'brand',
  clickable: false,
})

const className = props.class

defineEmits<{ click: [] }>()

const iconBgClass = {
  brand:   'bg-brand-100 dark:bg-brand-900',
  success: 'bg-success-50 dark:bg-green-900',
  warning: 'bg-warning-50 dark:bg-yellow-900',
  danger:  'bg-danger-50 dark:bg-red-900',
  purple:  'bg-purple-100 dark:bg-purple-900',
}[props.iconBg]
</script>
