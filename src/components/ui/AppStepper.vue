<template>
  <!-- Stepper horizontal para o wizard -->
  <div class="w-full">
    <!-- Desktop: horizontal -->
    <nav aria-label="Etapas do cálculo" class="hidden sm:block">
      <ol class="flex items-center w-full">
        <li
          v-for="(step, index) in steps"
          :key="step.id"
          class="flex items-center"
          :class="index < steps.length - 1 ? 'flex-1' : ''"
        >
          <!-- Step item -->
          <div class="flex flex-col items-center gap-1.5">
            <button
              type="button"
              :class="['w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 border-2', stepClass(index)]"
              :title="step.label"
              @click="canNavigateTo(index) && $emit('go-to', index + 1)"
            >
              <!-- Completed -->
              <svg v-if="isCompleted(index)" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
              <span v-else>{{ index + 1 }}</span>
            </button>
            <span :class="['text-xs font-medium whitespace-nowrap', labelClass(index)]">{{ step.label }}</span>
          </div>

          <!-- Connector -->
          <div v-if="index < steps.length - 1" :class="['flex-1 h-0.5 mx-2 mb-5 rounded transition-all duration-300', isCompleted(index) ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700']" />
        </li>
      </ol>
    </nav>

    <!-- Mobile: compact -->
    <div class="sm:hidden flex items-center gap-3">
      <div class="flex gap-1.5">
        <div
          v-for="(_, index) in steps"
          :key="index"
          :class="['h-1.5 rounded-full transition-all duration-300', index === currentStep - 1 ? 'w-6 bg-brand-600' : isCompleted(index) ? 'w-3 bg-brand-400' : 'w-3 bg-slate-200 dark:bg-slate-700']"
        />
      </div>
      <span class="text-sm font-medium text-slate-600 dark:text-slate-400">
        Etapa {{ currentStep }}/{{ steps.length }} — {{ steps[currentStep - 1]?.label }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Step {
  id: string
  label: string
  icon?: string
}

interface Props {
  steps: Step[]
  currentStep: number
  completedSteps?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  completedSteps: () => [],
})

defineEmits<{ 'go-to': [step: number] }>()

function isActive(index: number) {
  return index === props.currentStep - 1
}

function isCompleted(index: number) {
  return props.completedSteps.includes(index + 1) || index < props.currentStep - 1
}

function canNavigateTo(index: number) {
  return isCompleted(index) || index === props.currentStep - 1
}

function stepClass(index: number) {
  if (isActive(index)) return 'border-brand-600 bg-brand-600 text-white scale-110 shadow-md shadow-brand-200 dark:shadow-brand-900'
  if (isCompleted(index)) return 'border-brand-500 bg-brand-500 text-white cursor-pointer hover:bg-brand-600'
  return 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500'
}

function labelClass(index: number) {
  if (isActive(index)) return 'text-brand-700 dark:text-brand-300'
  if (isCompleted(index)) return 'text-brand-600 dark:text-brand-400'
  return 'text-slate-400 dark:text-slate-500'
}
</script>
