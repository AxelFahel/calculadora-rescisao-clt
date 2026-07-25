<template>
  <button
    id="theme-toggle"
    type="button"
    class="relative w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
    :title="isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'"
    @click="toggle"
  >
    <Transition name="fade" mode="out-in">
      <!-- Sol (modo claro) -->
      <svg v-if="isDark" key="sun" class="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
      </svg>
      <!-- Lua (modo escuro) -->
      <svg v-else key="moon" class="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    </Transition>
  </button>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const isDark = ref(
  localStorage.getItem('theme') === 'dark' ||
  (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
)

function applyTheme(dark: boolean) {
  if (dark) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

function toggle() {
  isDark.value = !isDark.value
}

watch(isDark, applyTheme, { immediate: true })
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s, transform 0.15s; }
.fade-enter-from { opacity: 0; transform: rotate(-90deg) scale(0.8); }
.fade-leave-to   { opacity: 0; transform: rotate(90deg) scale(0.8); }
</style>
