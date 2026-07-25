<template>
  <div :class="{ dark: isDark }" class="min-h-screen transition-colors duration-200">
    <div class="min-h-screen bg-surface-50 dark:bg-slate-950">
      <!-- Navbar -->
      <nav class="sticky top-0 z-50 glass border-b border-slate-200/60 dark:border-slate-700/60">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <!-- Logo -->
            <RouterLink to="/" class="flex items-center gap-3 group">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="hidden sm:block">
                <p class="text-sm font-bold text-slate-900 dark:text-white leading-tight">Rescisão CLT</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 leading-tight">Calculadora Trabalhista</p>
              </div>
            </RouterLink>

            <!-- Nav links -->
            <div class="hidden md:flex items-center gap-1">
              <RouterLink
                v-for="link in navLinks"
                :key="link.to"
                :to="link.to"
                class="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all"
                :class="{ 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300': $route.path === link.to }"
              >
                {{ link.label }}
              </RouterLink>
            </div>

            <!-- Right actions -->
            <div class="flex items-center gap-2">
              <ThemeToggle />
              <RouterLink to="/calculo/novo" class="btn-primary hidden sm:inline-flex">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Novo cálculo
              </RouterLink>
            </div>
          </div>
        </div>
      </nav>

      <!-- Page content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>

      <!-- Footer -->
      <footer class="mt-16 border-t border-slate-200 dark:border-slate-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p class="text-sm text-slate-500 dark:text-slate-400">
              © {{ new Date().getFullYear() }} Calculadora de Rescisão CLT · Uso exclusivamente informativo
            </p>
            <div class="flex items-center gap-1 px-3 py-1.5 bg-warning-50 dark:bg-yellow-950 rounded-lg">
              <svg class="w-3.5 h-3.5 text-warning-600 dark:text-yellow-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span class="text-xs text-warning-700 dark:text-yellow-300 font-medium">Estimativa · Não substitui análise jurídica ou contábil</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import ThemeToggle from './components/ui/ThemeToggle.vue'

const isDark = ref(localStorage.getItem('theme') === 'dark')

const navLinks = [
  { to: '/', label: 'Início' },
  { to: '/calculo/novo', label: 'Novo Cálculo' },
  { to: '/historico', label: 'Histórico' },
]
</script>
