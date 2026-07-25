<template>
  <div class="animate-fade-in max-w-5xl mx-auto">
    <!-- Sem resultado -->
    <div v-if="!store.resultado" class="text-center py-20">
      <div class="text-6xl mb-4">🧮</div>
      <h2 class="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Nenhum cálculo realizado</h2>
      <p class="text-slate-500 dark:text-slate-400 mb-6">Preencha o formulário para calcular a rescisão.</p>
      <RouterLink to="/calculo/novo" class="btn-primary">Iniciar cálculo</RouterLink>
    </div>

    <!-- Resultado -->
    <template v-else>
      <!-- Header -->
      <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-3 mb-4">
            <RouterLink to="/calculo/novo" class="btn-ghost px-2 py-1.5 text-sm no-print">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
              Voltar
            </RouterLink>
          </div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Resultado da Rescisão</h1>
          <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">Cálculo realizado em {{ formatDateTime(r.dataCalculo) }}</p>
        </div>
        <div class="flex flex-wrap gap-2 no-print">
          <AppButton variant="secondary" size="sm" id="btn-salvar" @click="salvar">💾 Salvar</AppButton>
          <AppButton variant="secondary" size="sm" id="btn-json" @click="baixarJSON">📦 JSON</AppButton>
          <AppButton variant="secondary" size="sm" id="btn-imprimir" @click="imprimir">🖨️ Imprimir</AppButton>
          <AppButton variant="outline" size="sm" id="btn-pdf" @click="imprimir">📄 Exportar PDF</AppButton>
          <AppButton variant="ghost" size="sm" id="btn-novo-calculo-resultado" @click="novoCalculo">🔄 Novo</AppButton>
        </div>
      </div>

      <!-- Aviso legal -->
      <AppAlert type="warning" class="mb-6 no-print">
        <strong>Este é um cálculo estimativo.</strong> Os valores podem variar por convenção coletiva, descontos,
        faltas, adicionais, verbas variáveis e decisões judiciais. Não substitui análise contábil ou jurídica.
      </AppAlert>

      <!-- Resumo do contrato -->
      <div class="card p-6 mb-6">
        <h2 class="text-lg font-bold text-slate-800 dark:text-white mb-4">Resumo do Contrato</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <InfoItem label="Trabalhador" :value="r.dadosContrato.nomeTrabalhador" />
          <InfoItem v-if="r.dadosContrato.empresa" label="Empresa" :value="r.dadosContrato.empresa" />
          <InfoItem label="Admissão" :value="formatDate(r.dadosContrato.dataAdmissao)" />
          <InfoItem label="Desligamento" :value="formatDate(r.dadosContrato.dataDesligamento)" />
          <InfoItem label="Tempo de serviço" :value="tempoServicoFormatado" />
          <InfoItem label="Tipo de rescisão" :value="LABELS_TIPO_RESCISAO[r.dadosContrato.tipoRescisao]" />
          <InfoItem label="Aviso prévio" :value="LABELS_TIPO_AVISO[r.dadosContrato.tipoAvisoPrevio]" />
          <InfoItem label="Dias de aviso" :value="`${r.avisoPrevio.totalDias} dias`" />
          <InfoItem label="Salário bruto" :value="formatCurrency(r.dadosContrato.salarioBrutoMensal)" />
        </div>
      </div>

      <!-- Totais em destaque -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div class="card p-6 text-center border-t-4 border-success-500">
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Bruto a Receber</p>
          <p class="text-3xl font-bold text-success-600 dark:text-success-400">{{ formatCurrency(r.totalBruto) }}</p>
        </div>
        <div class="card p-6 text-center border-t-4 border-danger-500">
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-1">Total de Descontos</p>
          <p class="text-3xl font-bold text-danger-600 dark:text-danger-400">{{ formatCurrency(r.totalDescontos) }}</p>
        </div>
        <div class="card p-6 text-center border-t-4 border-brand-500 ring-1 ring-brand-200 dark:ring-brand-900">
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Líquido Estimado</p>
          <p class="text-3xl font-bold text-brand-600 dark:text-brand-400">{{ formatCurrency(r.totalLiquido) }}</p>
          <p class="text-xs text-slate-400 mt-1">+ Multa FGTS: {{ formatCurrency(r.multaFgts) }}</p>
        </div>
      </div>

      <!-- Impostos -->
      <div class="card p-6 mb-6">
        <h2 class="text-lg font-bold text-slate-800 dark:text-white mb-4">Impostos descontados</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">INSS 2026</p>
            <p class="text-xl font-bold text-danger-600 dark:text-danger-400">{{ formatCurrency(r.inss.valor) }}</p>
            <p class="text-xs text-slate-400 mt-1">
              Base total: {{ formatCurrency(r.inss.base) }} · alíquota efetiva {{ formatPercent(r.inss.aliquotaEfetiva) }}
            </p>
          </div>
          <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">IRRF 2026</p>
            <p class="text-xl font-bold text-danger-600 dark:text-danger-400">{{ formatCurrency(r.irrf.valor) }}</p>
            <p class="text-xs text-slate-400 mt-1">
              Base tributável: {{ formatCurrency(r.irrf.baseCalculo) }} · alíquota efetiva {{ formatPercent(r.irrf.aliquotaEfetiva) }}
            </p>
          </div>
        </div>
        <p class="text-xs text-slate-400 mt-3">
          Remuneração mensal e 13º salário são calculados separadamente. Verbas indenizatórias não compõem estas bases.
        </p>
      </div>

      <!-- Tabela de verbas -->
      <div class="card overflow-hidden mb-6">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 class="text-lg font-bold text-slate-800 dark:text-white">Memória de Cálculo</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400">Detalhamento de cada verba rescisória</p>
        </div>
        <div class="overflow-x-auto">
          <table class="table-auto-responsive">
            <thead>
              <tr>
                <th>Verba</th>
                <th class="hidden md:table-cell">Base de Cálculo</th>
                <th class="hidden lg:table-cell">Fórmula</th>
                <th class="text-right">Valor</th>
                <th class="hidden sm:table-cell">Tipo</th>
                <th class="hidden xl:table-cell">Observações</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="verba in r.verbas"
                :key="verba.id"
                :class="['transition-colors', verba.positivo ? 'hover:bg-success-50/30 dark:hover:bg-green-950/20' : 'hover:bg-danger-50/30 dark:hover:bg-red-950/20']"
              >
                <td>
                  <p class="font-medium text-slate-800 dark:text-slate-200 text-sm">{{ verba.nome }}</p>
                </td>
                <td class="hidden md:table-cell text-slate-500 dark:text-slate-400 text-xs">
                  {{ formatCurrency(verba.base) }}
                </td>
                <td class="hidden lg:table-cell text-slate-400 dark:text-slate-500 text-xs font-mono">
                  {{ verba.formula }}
                </td>
                <td class="text-right">
                  <span :class="['font-bold text-sm', verba.positivo ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400']">
                    {{ verba.positivo ? '+' : '−' }} {{ formatCurrency(verba.valor) }}
                  </span>
                </td>
                <td class="hidden sm:table-cell">
                  <span :class="verba.positivo ? 'badge-success' : 'badge-danger'">
                    {{ verba.positivo ? 'Crédito' : 'Desconto' }}
                  </span>
                </td>
                <td class="hidden xl:table-cell text-slate-400 dark:text-slate-500 text-xs">
                  {{ verba.observacoes || '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- FGTS -->
      <div class="card p-6 mb-6">
        <h2 class="text-lg font-bold text-slate-800 dark:text-white mb-4">FGTS</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Saldo informado</p>
            <p class="text-xl font-bold text-slate-800 dark:text-white">{{ formatCurrency(r.saldoFgtsInformado) }}</p>
            <p class="text-xs text-slate-400 mt-1">Conforme extrato FGTS Digital</p>
          </div>
          <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">FGTS estimado (verbas)</p>
            <p class="text-xl font-bold text-slate-800 dark:text-white">{{ formatCurrency(r.fgtsEstimadoSobreVerbas) }}</p>
            <p class="text-xs text-slate-400 mt-1">8% sobre verbas incidentes</p>
          </div>
          <div class="p-4 bg-success-50 dark:bg-green-950 rounded-xl border border-success-200 dark:border-green-800">
            <p class="text-xs font-semibold text-success-700 dark:text-success-400 uppercase tracking-wide mb-1">Multa FGTS ({{ formatPercent(r.percentualMultaFgts) }})</p>
            <p class="text-xl font-bold text-success-700 dark:text-success-400">{{ formatCurrency(r.multaFgts) }}</p>
            <p class="text-xs text-success-600 dark:text-success-500 mt-1">Sobre saldo informado</p>
          </div>
        </div>
      </div>

      <!-- Aviso legal final -->
      <div class="card p-6 border-l-4 border-warning-500 no-print">
        <div class="flex gap-3">
          <span class="text-2xl shrink-0">⚖️</span>
          <p class="text-sm text-slate-600 dark:text-slate-400">
            Cálculo estimativo realizado pelo motor versão {{ r.versaoMotor }}.
            Para rescisões a partir de <strong>01/03/2024</strong>, recolhimentos rescisórios de FGTS devem ser realizados pelo
            <strong>FGTS Digital</strong>. Consulte sempre um advogado trabalhista ou contador.
          </p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useRescisaoStore } from '../stores/rescisao.store'
import { useHistoricoStore } from '../stores/historico.store'
import { LABELS_TIPO_RESCISAO, LABELS_TIPO_AVISO } from '../domain/rescisao/types'
import { formatTempoServico } from '../utils/dates'
import { formatCurrency, formatPercent } from '../utils/currency'
import { formatDate, formatDateTime } from '../utils/dates'
import AppAlert from '../components/ui/AppAlert.vue'
import AppButton from '../components/ui/AppButton.vue'

const store = useRescisaoStore()
const historico = useHistoricoStore()
const router = useRouter()

const r = computed(() => store.resultado!)

const tempoServicoFormatado = computed(() => {
  if (!r.value) return ''
  const { anos, meses, dias } = r.value.tempoServico
  return formatTempoServico(anos, meses, dias)
})

function salvar() {
  if (store.resultado) {
    historico.salvar(store.resultado)
    alert('Cálculo salvo no histórico!')
  }
}

function baixarJSON() {
  const json = store.exportarJSON()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `rescisao_${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function imprimir() {
  window.print()
}

async function novoCalculo() {
  store.limpar()
  await router.push({ name: 'novo-calculo' })
}
</script>

<script lang="ts">
// Componente helper local
import { defineComponent, h } from 'vue'

const InfoItem = defineComponent({
  props: { label: String, value: String },
  setup(props) {
    return () =>
      h('div', [
        h('p', { class: 'text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-0.5' }, props.label),
        h('p', { class: 'text-sm font-semibold text-slate-800 dark:text-slate-200' }, props.value),
      ])
  },
})

export { InfoItem }
</script>
