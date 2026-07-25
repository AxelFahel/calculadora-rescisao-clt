<template>
  <div>
    <h2 class="text-xl font-bold text-slate-800 dark:text-white mb-1">Verbas e FGTS</h2>
    <p class="text-sm text-slate-500 dark:text-slate-400 mb-8">Informações sobre férias, 13º, FGTS e valores adicionais.</p>

    <div class="space-y-8">

      <!-- Férias vencidas -->
      <div class="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <span class="text-2xl">🏖️</span>
            <div>
              <p class="font-semibold text-slate-800 dark:text-white text-sm">Férias vencidas</p>
              <p class="text-xs text-slate-500">Períodos já adquiridos e não gozados</p>
            </div>
          </div>
          <ToggleSwitch v-model="dados.temFeriasVencidas" id="toggle-ferias-vencidas" @update:modelValue="syncStore" />
        </div>
        <Transition name="expand">
          <div v-if="dados.temFeriasVencidas" class="mt-4">
            <label for="periodos-vencidos" class="label label-required">Quantidade de períodos vencidos</label>
            <input
              id="periodos-vencidos"
              v-model.number="dados.quantidadePeriodosVencidos"
              type="number"
              min="1" max="5"
              class="input w-32"
              @change="syncStore"
            />
          </div>
        </Transition>
      </div>

      <!-- 13º adiantado -->
      <div class="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <span class="text-2xl">🎁</span>
            <div>
              <p class="font-semibold text-slate-800 dark:text-white text-sm">Adiantamento de 13º</p>
              <p class="text-xs text-slate-500">Já recebeu parcela do 13º este ano?</p>
            </div>
          </div>
          <ToggleSwitch v-model="dados.teveAdiantamento13" id="toggle-adiantamento-13" @update:modelValue="syncStore" />
        </div>
        <Transition name="expand">
          <div v-if="dados.teveAdiantamento13" class="mt-4">
            <label for="valor-adiantamento" class="label label-required">Valor adiantado</label>
            <div class="relative w-48">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
              <input
                id="valor-adiantamento"
                v-model="adiantamento13Display"
                type="text"
                inputmode="numeric"
                class="input pl-10"
                @input="handleMoney($event, 'valorAdiantamento13', 'adiantamento13Display')"
              />
            </div>
          </div>
        </Transition>
      </div>

      <!-- Médias variáveis -->
      <div class="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <span class="text-2xl">📊</span>
            <div>
              <p class="font-semibold text-slate-800 dark:text-white text-sm">Médias variáveis habituais</p>
              <p class="text-xs text-slate-500">Horas extras, comissões, adicionais etc.</p>
            </div>
          </div>
          <ToggleSwitch v-model="dados.temMediasVariaveis" id="toggle-medias" @update:modelValue="syncStore" />
        </div>
        <Transition name="expand">
          <div v-if="dados.temMediasVariaveis" class="mt-4">
            <label for="media-variavel" class="label label-required">Média mensal</label>
            <div class="relative w-48">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
              <input
                id="media-variavel"
                v-model="mediaDisplay"
                type="text"
                inputmode="numeric"
                class="input pl-10"
                @input="handleMoney($event, 'mediaVariavel', 'mediaDisplay')"
              />
            </div>
          </div>
        </Transition>
      </div>

      <!-- FGTS -->
      <div class="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div class="flex items-center gap-3 mb-4">
          <span class="text-2xl">🏦</span>
          <div>
            <p class="font-semibold text-slate-800 dark:text-white text-sm">FGTS</p>
            <p class="text-xs text-slate-500">Informe o saldo real do extrato FGTS Digital</p>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="saldo-fgts" class="label">Saldo informado (extrato)</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
              <input
                id="saldo-fgts"
                v-model="fgtsDisplay"
                type="text"
                inputmode="numeric"
                placeholder="0,00"
                class="input pl-10"
                @input="handleMoney($event, 'saldoFgtsInformado', 'fgtsDisplay')"
              />
            </div>
          </div>
          <div>
            <label for="multa-manual" class="label">Percentual multa (manual)</label>
            <div class="relative">
              <input
                id="multa-manual"
                v-model="multaDisplay"
                type="text"
                placeholder="Padrão automático"
                class="input pr-8"
                @input="handleMulta"
              />
              <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
            </div>
            <p class="text-xs text-slate-400 mt-1">Deixe vazio para usar regra padrão</p>
          </div>
        </div>
      </div>

      <!-- Informações adicionais -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label for="dias-trabalhados" class="label">Dias trabalhados no mês</label>
          <input
            id="dias-trabalhados"
            v-model.number="dados.diasTrabalhadosNoMes"
            type="number"
            min="1" max="31"
            placeholder="Auto"
            class="input"
            @change="syncStore"
          />
          <p class="text-xs text-slate-400 mt-1">Deixe vazio para calcular automaticamente</p>
        </div>
        <div>
          <label for="faltas" class="label">Faltas não justificadas</label>
          <input id="faltas" v-model.number="dados.faltas" type="number" min="0" class="input" @change="syncStore" />
        </div>
        <div>
          <label for="dependentes" class="label">Dependentes (IRRF)</label>
          <input id="dependentes" v-model.number="dados.dependentesIRRF" type="number" min="0" max="10" class="input" @change="syncStore" />
        </div>
      </div>

      <!-- Créditos e descontos extras -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <!-- Créditos -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <label class="label">Outros créditos</label>
            <button type="button" class="btn-ghost text-xs px-2 py-1" @click="adicionarCredito">+ Adicionar</button>
          </div>
          <div v-for="(credito, i) in dados.creditosExtras" :key="i" class="flex gap-2 mb-2">
            <input v-model="credito.descricao" type="text" placeholder="Descrição" class="input flex-1 text-xs" @change="syncStore" />
            <div class="relative w-28">
              <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">R$</span>
              <input v-model="credito.valor" type="number" min="0" step="0.01" class="input pl-8 text-xs" @change="syncStore" />
            </div>
            <button type="button" class="btn-ghost px-2" @click="removerCredito(i)">
              <svg class="w-4 h-4 text-danger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        <!-- Descontos -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <label class="label">Outros descontos</label>
            <button type="button" class="btn-ghost text-xs px-2 py-1" @click="adicionarDesconto">+ Adicionar</button>
          </div>
          <div v-for="(desconto, i) in dados.descontosExtras" :key="i" class="flex gap-2 mb-2">
            <input v-model="desconto.descricao" type="text" placeholder="Descrição" class="input flex-1 text-xs" @change="syncStore" />
            <div class="relative w-28">
              <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">R$</span>
              <input v-model="desconto.valor" type="number" min="0" step="0.01" class="input pl-8 text-xs" @change="syncStore" />
            </div>
            <button type="button" class="btn-ghost px-2" @click="removerDesconto(i)">
              <svg class="w-4 h-4 text-danger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Observações -->
      <div>
        <label for="observacoes" class="label">Observações</label>
        <textarea id="observacoes" v-model="dados.observacoes" rows="3" class="input resize-none" placeholder="Informações adicionais relevantes para o cálculo..." @change="syncStore" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRescisaoStore } from '../../stores/rescisao.store'
import { maskCurrency, parseCurrency } from '../../utils/currency'
import ToggleSwitch from '../ui/ToggleSwitch.vue'

const store = useRescisaoStore()

const dados = reactive({
  temFeriasVencidas: store.dados.temFeriasVencidas,
  quantidadePeriodosVencidos: store.dados.quantidadePeriodosVencidos,
  teveAdiantamento13: store.dados.teveAdiantamento13,
  valorAdiantamento13: store.dados.valorAdiantamento13,
  temMediasVariaveis: store.dados.temMediasVariaveis,
  mediaVariavel: store.dados.mediaVariavel,
  saldoFgtsInformado: store.dados.saldoFgtsInformado,
  percentualMultaFgtsManual: store.dados.percentualMultaFgtsManual,
  diasTrabalhadosNoMes: store.dados.diasTrabalhadosNoMes,
  faltas: store.dados.faltas,
  dependentesIRRF: store.dados.dependentesIRRF,
  descontosExtras: [...store.dados.descontosExtras],
  creditosExtras: [...store.dados.creditosExtras],
  observacoes: store.dados.observacoes || '',
})

function fmt(v: number) {
  return v > 0 ? v.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : ''
}

const adiantamento13Display = ref(fmt(dados.valorAdiantamento13))
const mediaDisplay = ref(fmt(dados.mediaVariavel))
const fgtsDisplay = ref(fmt(dados.saldoFgtsInformado))
const multaDisplay = ref(dados.percentualMultaFgtsManual >= 0 ? (dados.percentualMultaFgtsManual * 100).toFixed(0) : '')

function handleMoney(event: Event, field: keyof typeof dados, displayRef: string) {
  const input = event.target as HTMLInputElement
  const masked = maskCurrency(input.value)
  input.value = masked
  if (displayRef === 'adiantamento13Display') adiantamento13Display.value = masked
  else if (displayRef === 'mediaDisplay') mediaDisplay.value = masked
  else if (displayRef === 'fgtsDisplay') fgtsDisplay.value = masked
  ;(dados as any)[field] = parseCurrency(masked)
  syncStore()
}

function handleMulta(event: Event) {
  const val = (event.target as HTMLInputElement).value.replace(/[^\d.]/g, '')
  multaDisplay.value = val
  dados.percentualMultaFgtsManual = val ? parseFloat(val) / 100 : -1
  syncStore()
}

function syncStore() {
  store.atualizarDados({ ...dados })
}

function adicionarCredito() {
  dados.creditosExtras.push({ descricao: '', valor: 0 })
}
function removerCredito(i: number) {
  dados.creditosExtras.splice(i, 1)
  syncStore()
}
function adicionarDesconto() {
  dados.descontosExtras.push({ descricao: '', valor: 0 })
}
function removerDesconto(i: number) {
  dados.descontosExtras.splice(i, 1)
  syncStore()
}
</script>

<style scoped>
.expand-enter-active, .expand-leave-active { transition: all 0.2s ease; overflow: hidden; }
.expand-enter-from, .expand-leave-to { max-height: 0; opacity: 0; }
.expand-enter-to, .expand-leave-from { max-height: 200px; opacity: 1; }
</style>
