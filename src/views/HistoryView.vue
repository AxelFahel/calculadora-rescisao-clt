<template>
  <div class="animate-fade-in">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Histórico de cálculos</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1">{{ historico.totalCalculos }} cálculo(s) salvos</p>
      </div>
      <div class="flex gap-2">
        <AppButton v-if="historico.totalCalculos > 0" variant="ghost" size="sm" id="btn-limpar-historico" @click="confirmarLimpeza">
          🗑️ Limpar tudo
        </AppButton>
        <RouterLink to="/calculo/novo" class="btn-primary">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
          Novo cálculo
        </RouterLink>
      </div>
    </div>

    <!-- Vazio -->
    <div v-if="historico.totalCalculos === 0" class="text-center py-20">
      <div class="text-6xl mb-4">📋</div>
      <h2 class="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Histórico vazio</h2>
      <p class="text-slate-500 dark:text-slate-400 mb-6">Seus cálculos salvos aparecerão aqui.</p>
      <RouterLink to="/calculo/novo" class="btn-primary">Criar primeiro cálculo</RouterLink>
    </div>

    <!-- Grid de cards -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="item in historico.calculosOrdenados"
        :key="item.id"
        class="card p-5 flex flex-col gap-4 hover:shadow-card-hover transition-all duration-200"
      >
        <!-- Header -->
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <p class="font-bold text-slate-800 dark:text-white truncate">{{ item.nomeTrabalhador }}</p>
            <p v-if="item.empresa" class="text-xs text-slate-500 truncate">{{ item.empresa }}</p>
          </div>
          <span class="badge-brand text-xs shrink-0">{{ formatDate(item.dataCalculo) }}</span>
        </div>

        <!-- Tipo -->
        <div>
          <span class="badge badge-neutral text-xs">{{ LABELS_TIPO_RESCISAO[item.tipoRescisao] }}</span>
        </div>

        <!-- Total -->
        <div class="p-3 bg-brand-50 dark:bg-brand-950 rounded-xl text-center">
          <p class="text-xs text-slate-500 dark:text-slate-400">Total líquido estimado</p>
          <p class="text-2xl font-bold text-brand-600 dark:text-brand-400">{{ formatCurrency(item.totalLiquido) }}</p>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 pt-1 border-t border-slate-100 dark:border-slate-700">
          <AppButton variant="outline" size="sm" class="flex-1" :id="`btn-ver-${item.id}`" @click="verDetalhe(item)">Ver detalhe</AppButton>
          <AppButton variant="secondary" size="sm" :id="`btn-duplicar-${item.id}`" @click="duplicar(item)">Duplicar</AppButton>
          <AppButton variant="ghost" size="sm" :id="`btn-remover-${item.id}`" @click="historico.remover(item.id)">
            <svg class="w-4 h-4 text-danger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </AppButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { useHistoricoStore } from '../stores/historico.store'
import { useRescisaoStore } from '../stores/rescisao.store'
import { LABELS_TIPO_RESCISAO } from '../domain/rescisao/types'
import type { HistoricoItem } from '../domain/rescisao/types'
import { formatCurrency } from '../utils/currency'
import { formatDate } from '../utils/dates'
import AppButton from '../components/ui/AppButton.vue'

const historico = useHistoricoStore()
const rescisao = useRescisaoStore()
const router = useRouter()

async function verDetalhe(item: HistoricoItem) {
  rescisao.carregarDados(item.resultado.dadosContrato)
  rescisao.calcular()
  await router.push({ name: 'resultado' })
}

async function duplicar(item: HistoricoItem) {
  rescisao.carregarDados(item.resultado.dadosContrato)
  await router.push({ name: 'novo-calculo' })
}

function confirmarLimpeza() {
  if (confirm('Tem certeza que deseja limpar todo o histórico? Esta ação não pode ser desfeita.')) {
    historico.limparTudo()
  }
}
</script>
