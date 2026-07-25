<template>
  <div class="animate-fade-in">
    <!-- Hero -->
    <section class="relative overflow-hidden rounded-3xl mb-10 bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 px-6 py-12 sm:px-12 sm:py-16">
      <!-- Background decoration -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div class="absolute -bottom-16 -left-16 w-64 h-64 bg-indigo-400/10 rounded-full blur-2xl" />
      </div>

      <div class="relative">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 text-white/90 rounded-full text-xs font-medium mb-4 backdrop-blur-sm border border-white/20">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          100% local · Dados seguros · Sem envio a servidores
        </div>

        <h1 class="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
          Calculadora de<br />
          <span class="text-indigo-200">Rescisão CLT</span>
        </h1>
        <p class="text-brand-100 text-base sm:text-lg max-w-xl mb-8">
          Calcule de forma rápida e estimada os valores rescisórios: saldo de salário, aviso prévio, 13º, férias, FGTS e muito mais.
        </p>

        <div class="flex flex-wrap gap-3">
          <RouterLink to="/calculo/novo" id="btn-novo-calculo-hero" class="btn bg-white text-brand-700 hover:bg-brand-50 shadow-lg hover:shadow-xl font-semibold">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
            Novo cálculo
          </RouterLink>
          <button type="button" class="btn bg-white/10 text-white hover:bg-white/20 border border-white/20 backdrop-blur-sm" @click="showLegal = true">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Aviso legal
          </button>
        </div>
      </div>
    </section>

    <!-- Dashboard cards -->
    <section class="mb-10">
      <h2 class="text-xl font-bold text-slate-800 dark:text-white mb-6">O que deseja fazer?</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <RouterLink
          v-for="card in dashboardCards"
          :key="card.id"
          :to="card.to"
          :id="card.id"
          class="card-hover p-6 flex flex-col gap-4 no-underline animate-slide-up"
        >
          <div :class="['w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-transform duration-200 group-hover:scale-110', card.iconBg]">
            {{ card.icon }}
          </div>
          <div>
            <h3 class="font-semibold text-slate-800 dark:text-white mb-1">{{ card.title }}</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{{ card.description }}</p>
          </div>
          <div class="flex items-center text-brand-600 dark:text-brand-400 text-sm font-medium mt-auto gap-1">
            {{ card.action }}
            <svg class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
          </div>
        </RouterLink>
      </div>
    </section>

    <!-- Estatísticas rápidas -->
    <section v-if="historico.totalCalculos > 0" class="mb-10">
      <h2 class="text-xl font-bold text-slate-800 dark:text-white mb-4">Cálculos recentes</h2>
      <div class="card overflow-hidden">
        <table class="table-auto-responsive">
          <thead>
            <tr>
              <th>Trabalhador</th>
              <th class="hidden sm:table-cell">Tipo</th>
              <th class="hidden md:table-cell">Data</th>
              <th class="text-right">Total líquido</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in historico.calculosOrdenados.slice(0, 5)"
              :key="item.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <td>
                <p class="font-medium text-slate-800 dark:text-white">{{ item.nomeTrabalhador }}</p>
                <p v-if="item.empresa" class="text-xs text-slate-500">{{ item.empresa }}</p>
              </td>
              <td class="hidden sm:table-cell">
                <span class="badge-brand">{{ LABELS_TIPO_RESCISAO[item.tipoRescisao].split(' ').slice(0, 2).join(' ') }}</span>
              </td>
              <td class="hidden md:table-cell text-slate-500 text-xs">{{ formatDateTime(item.dataCalculo) }}</td>
              <td class="text-right font-bold text-success-600 dark:text-success-400">{{ formatCurrency(item.totalLiquido) }}</td>
              <td class="text-right">
                <RouterLink :to="{ name: 'historico' }" class="btn-ghost text-xs px-2 py-1">Ver</RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="px-4 py-3 border-t border-slate-100 dark:border-slate-700 flex justify-end">
          <RouterLink to="/historico" class="btn-ghost text-sm">Ver todos os cálculos →</RouterLink>
        </div>
      </div>
    </section>

    <!-- Verbas calculadas info -->
    <section class="mb-10">
      <h2 class="text-xl font-bold text-slate-800 dark:text-white mb-4">Verbas calculadas</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div v-for="verba in verbas" :key="verba.nome" class="card p-4 text-center">
          <div class="text-2xl mb-2">{{ verba.icon }}</div>
          <p class="text-xs font-semibold text-slate-700 dark:text-slate-300">{{ verba.nome }}</p>
        </div>
      </div>
    </section>

    <!-- Aviso legal banner -->
    <section>
      <div class="card p-6 border-l-4 border-warning-500">
        <div class="flex gap-4">
          <div class="text-3xl">⚖️</div>
          <div>
            <h3 class="font-bold text-slate-800 dark:text-white mb-2">Aviso Legal Importante</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Os cálculos realizados por esta ferramenta são <strong>estimativos</strong> e podem variar por
              convenção coletiva, descontos, faltas, adicionais, verbas variáveis e decisões judiciais.
              <strong>Não substituem análise contábil ou jurídica especializada.</strong>
              Para rescisões a partir de 01/03/2024, os recolhimentos rescisórios de FGTS devem ser feitos
              pelo <strong>FGTS Digital</strong>.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal aviso legal -->
    <AppModal :open="showLegal" title="Aviso Legal" @close="showLegal = false">
      <div class="prose dark:prose-invert prose-sm max-w-none">
        <h3>Natureza estimativa dos cálculos</h3>
        <p>Esta calculadora fornece <strong>estimativas</strong> de verbas rescisórias trabalhistas com base nas regras gerais da CLT. Os valores apresentados podem divergir do cálculo oficial por:</p>
        <ul>
          <li>Convenções coletivas de trabalho ou acordos coletivos da categoria</li>
          <li>Descontos legais específicos (INSS, IRRF, contribuições sindicais)</li>
          <li>Faltas não justificadas, afastamentos e reduções salariais</li>
          <li>Adicionais contratuais (periculosidade, insalubridade, noturno)</li>
          <li>Verbas variáveis (comissões, prêmios, gorjetas)</li>
          <li>Decisões judiciais e súmulas do TST</li>
          <li>Regras específicas por setor ou porte da empresa</li>
        </ul>
        <h3>Não substitui consultoria profissional</h3>
        <p>Esta ferramenta <strong>não substitui</strong> análise contábil, jurídica ou trabalhista especializada. Para situações específicas, consulte um advogado trabalhista ou contador.</p>
        <h3>FGTS Digital</h3>
        <p>Para desligamentos a partir de <strong>01/03/2024</strong>, os recolhimentos rescisórios de FGTS devem ser realizados exclusivamente pelo sistema <strong>FGTS Digital</strong> do Governo Federal.</p>
        <h3>Privacidade</h3>
        <p>Todos os dados inseridos e documentos enviados são processados <strong>exclusivamente no seu dispositivo</strong>. Nenhuma informação é enviada a servidores externos.</p>
      </div>
      <template #footer>
        <AppButton variant="primary" class="w-full" @click="showLegal = false">Entendi</AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useHistoricoStore } from '../stores/historico.store'
import { LABELS_TIPO_RESCISAO } from '../domain/rescisao/types'
import { formatCurrency } from '../utils/currency'
import { formatDateTime } from '../utils/dates'
import AppModal from '../components/ui/AppModal.vue'
import AppButton from '../components/ui/AppButton.vue'

const historico = useHistoricoStore()
const showLegal = ref(false)

const dashboardCards = [
  {
    id: 'card-novo-calculo',
    to: '/calculo/novo',
    icon: '🧮',
    iconBg: 'bg-brand-100 dark:bg-brand-900',
    title: 'Novo cálculo',
    description: 'Calcule rescisão com assistente guiado em etapas.',
    action: 'Iniciar',
  },
  {
    id: 'card-historico',
    to: '/historico',
    icon: '📋',
    iconBg: 'bg-purple-100 dark:bg-purple-900',
    title: 'Histórico',
    description: 'Acesse cálculos anteriores salvos localmente.',
    action: 'Acessar',
  },
  {
    id: 'card-importar',
    to: '/calculo/novo',
    icon: '📂',
    iconBg: 'bg-success-50 dark:bg-green-900',
    title: 'Importar documentos',
    description: 'Anexe carteira de trabalho, extrato FGTS e holerites.',
    action: 'Importar',
  },
  {
    id: 'card-sobre',
    to: '/',
    icon: '⚖️',
    iconBg: 'bg-warning-50 dark:bg-yellow-900',
    title: 'Sobre o cálculo',
    description: 'Entenda as fórmulas e regras aplicadas.',
    action: 'Saiba mais',
  },
]

const verbas = [
  { nome: 'Saldo de Salário', icon: '💰' },
  { nome: 'Aviso Prévio', icon: '📅' },
  { nome: '13º Proporcional', icon: '🎁' },
  { nome: 'Férias + 1/3', icon: '🏖️' },
  { nome: 'FGTS', icon: '🏦' },
  { nome: 'Multa FGTS', icon: '⚖️' },
]
</script>
