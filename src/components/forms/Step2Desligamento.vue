<template>
  <div>
    <h2 class="text-xl font-bold text-slate-800 dark:text-white mb-1">Tipo de desligamento</h2>
    <p class="text-sm text-slate-500 dark:text-slate-400 mb-8">Defina o motivo da rescisão e as condições do aviso prévio.</p>

    <div class="space-y-8">
      <!-- Tipo de rescisão -->
      <div>
        <label class="label label-required mb-3 block">Tipo de rescisão</label>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label
            v-for="opt in tiposRescisao"
            :key="opt.value"
            :class="[
              'flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-150',
              dados.tipoRescisao === opt.value
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-950'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            ]"
          >
            <input
              type="radio"
              :id="`rescisao-${opt.value}`"
              :value="opt.value"
              v-model="dados.tipoRescisao"
              class="mt-0.5 accent-brand-600"
              @change="syncStore"
            />
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="text-lg">{{ opt.icon }}</span>
                <span class="text-sm font-medium text-slate-800 dark:text-slate-200">{{ opt.label }}</span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ opt.desc }}</p>
            </div>
          </label>
        </div>
      </div>

      <!-- Regras aplicáveis preview -->
      <div v-if="regrasAtivas" class="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <p class="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3">Verbas incluídas nesta modalidade</p>
        <div class="flex flex-wrap gap-2">
          <span v-for="verba in verbasAplicaveis" :key="verba.nome" :class="['badge', verba.ativo ? 'badge-success' : 'badge-neutral line-through opacity-50']">
            {{ verba.ativo ? '✓' : '✗' }} {{ verba.nome }}
          </span>
        </div>
        <p class="text-xs text-warning-600 dark:text-yellow-400 mt-3 font-medium">
          Multa FGTS: {{ formatPercent(regrasAtivas.percentualMultaFgts) }}
        </p>
      </div>

      <!-- Aviso prévio -->
      <div>
        <label class="label label-required mb-3 block">Tipo de aviso prévio</label>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label
            v-for="opt in tiposAvisoDisponiveis"
            :key="opt.value"
            :class="[
              'flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-150',
              dados.tipoAvisoPrevio === opt.value
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-950'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            ]"
          >
            <input
              type="radio"
              :id="`aviso-${opt.value}`"
              :value="opt.value"
              v-model="dados.tipoAvisoPrevio"
              class="mt-0.5 accent-brand-600"
              @change="syncStore"
            />
            <div>
              <p class="text-sm font-medium text-slate-800 dark:text-slate-200">{{ opt.label }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ opt.desc }}</p>
            </div>
          </label>
        </div>
      </div>

      <!-- Preview aviso proporcional -->
      <div v-if="infoAviso" class="p-4 bg-indigo-50 dark:bg-indigo-950 rounded-xl border border-indigo-100 dark:border-indigo-900">
        <div class="flex items-center gap-3 mb-2">
          <span class="text-2xl">📅</span>
          <p class="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Aviso prévio proporcional</p>
        </div>
        <div class="grid grid-cols-3 gap-3 text-center">
          <div class="bg-white dark:bg-indigo-900/50 rounded-lg p-3">
            <p class="text-lg font-bold text-indigo-700 dark:text-indigo-300">30</p>
            <p class="text-xs text-indigo-500 dark:text-indigo-400">dias base</p>
          </div>
          <div class="bg-white dark:bg-indigo-900/50 rounded-lg p-3">
            <p class="text-lg font-bold text-indigo-700 dark:text-indigo-300">+{{ infoAviso.diasPorAnosServico }}</p>
            <p class="text-xs text-indigo-500 dark:text-indigo-400">proporcional</p>
          </div>
          <div class="bg-white dark:bg-indigo-900/50 rounded-lg p-3">
            <p class="text-lg font-bold text-indigo-700 dark:text-indigo-300">{{ infoAviso.totalDias }}d</p>
            <p class="text-xs text-indigo-500 dark:text-indigo-400">total</p>
          </div>
        </div>
        <p v-if="infoAviso.valorIndenizado > 0" class="text-sm text-indigo-600 dark:text-indigo-400 mt-3 font-medium">
          Valor estimado: {{ formatCurrency(infoAviso.valorIndenizado) }}
          <span v-if="infoAviso.dataProjecaoTermino"> · Término projetado: {{ formatDate(infoAviso.dataProjecaoTermino) }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import { useRescisaoStore } from '../../stores/rescisao.store'
import { TipoRescisao, TipoAvisoPrevio, LABELS_TIPO_RESCISAO } from '../../domain/rescisao/types'
import { REGRAS_POR_RESCISAO } from '../../domain/rescisao/regras'
import { calcularInfoAvisoPrevio } from '../../domain/rescisao/calculos'
import { formatCurrency, formatPercent } from '../../utils/currency'
import { formatDate } from '../../utils/dates'

const store = useRescisaoStore()

const dados = reactive({
  tipoRescisao: store.dados.tipoRescisao,
  tipoAvisoPrevio: store.dados.tipoAvisoPrevio,
})

function syncStore() {
  store.atualizarDados({ ...dados })
}

const tiposRescisao = [
  { value: TipoRescisao.SEM_JUSTA_CAUSA, icon: '🔴', label: 'Sem justa causa', desc: 'Demissão pelo empregador sem motivo disciplinar' },
  { value: TipoRescisao.PEDIDO_DEMISSAO, icon: '🟡', label: 'Pedido de demissão', desc: 'Iniciativa de saída é do empregado' },
  { value: TipoRescisao.ACORDO, icon: '🤝', label: 'Acordo (Art. 484-A)', desc: 'Consensual entre empregado e empregador' },
  { value: TipoRescisao.TERMINO_EXPERIENCIA, icon: '📋', label: 'Término de experiência', desc: 'Fim natural do contrato a prazo determinado' },
  { value: TipoRescisao.JUSTA_CAUSA, icon: '⚠️', label: 'Justa causa', desc: 'Por infração grave do empregado (Art. 482)' },
  { value: TipoRescisao.RESCISAO_ANTECIPADA, icon: '📌', label: 'Rescisão antecipada', desc: 'Antes do término de contrato a prazo' },
]

const tiposAviso = [
  { value: TipoAvisoPrevio.INDENIZADO_EMPREGADOR, label: 'Indenizado pelo empregador', desc: 'Empregador paga o período sem trabalhar' },
  { value: TipoAvisoPrevio.TRABALHADO, label: 'Trabalhado', desc: 'Trabalhador cumpre o aviso normalmente' },
  { value: TipoAvisoPrevio.NAO_CUMPRIDO_EMPREGADO, label: 'Não cumprido pelo empregado', desc: 'Desconto no acerto rescisório' },
  { value: TipoAvisoPrevio.DISPENSADO, label: 'Dispensado pelo empregador', desc: 'Empregador dispensa o cumprimento' },
  { value: TipoAvisoPrevio.NAO_SE_APLICA, label: 'Não se aplica', desc: 'Para modalidades sem aviso prévio' },
]

const tiposAvisoDisponiveis = computed(() => {
  if (!regrasAtivas.value.temAvisoPrevio) {
    return tiposAviso.filter((opt) => opt.value === TipoAvisoPrevio.NAO_SE_APLICA)
  }
  if (dados.tipoRescisao === TipoRescisao.PEDIDO_DEMISSAO) {
    const permitidos: TipoAvisoPrevio[] = [
      TipoAvisoPrevio.TRABALHADO,
      TipoAvisoPrevio.NAO_CUMPRIDO_EMPREGADO,
      TipoAvisoPrevio.DISPENSADO,
    ]
    return tiposAviso.filter((opt) =>
      permitidos.includes(opt.value),
    )
  }
  const permitidos: TipoAvisoPrevio[] = [
    TipoAvisoPrevio.INDENIZADO_EMPREGADOR,
    TipoAvisoPrevio.TRABALHADO,
    TipoAvisoPrevio.DISPENSADO,
  ]
  return tiposAviso.filter((opt) =>
    permitidos.includes(opt.value),
  )
})

watch(
  () => dados.tipoRescisao,
  () => {
    if (!tiposAvisoDisponiveis.value.some((opt) => opt.value === dados.tipoAvisoPrevio)) {
      dados.tipoAvisoPrevio = tiposAvisoDisponiveis.value[0]?.value ?? TipoAvisoPrevio.NAO_SE_APLICA
    }
    syncStore()
  },
)

const regrasAtivas = computed(() => REGRAS_POR_RESCISAO[dados.tipoRescisao])

const verbasAplicaveis = computed(() => {
  const r = regrasAtivas.value
  return [
    { nome: 'Saldo de salário', ativo: r.temSaldoSalario },
    { nome: 'Aviso prévio', ativo: r.temAvisoPrevio },
    { nome: '13º proporcional', ativo: r.tem13Proporcional },
    { nome: 'Férias proporcionais', ativo: r.temFeriasProporcionais },
    { nome: 'Férias vencidas', ativo: r.temFeriasVencidas },
  ]
})

const infoAviso = computed(() => {
  if (!store.dados.dataAdmissao || !store.dados.dataDesligamento) return null
  if (store.dados.salarioBrutoMensal <= 0) return null
  return calcularInfoAvisoPrevio({ ...store.dados, ...dados })
})
</script>
