<template>
  <div>
    <h2 class="text-xl font-bold text-slate-800 dark:text-white mb-1">Dados do contrato</h2>
    <p class="text-sm text-slate-500 dark:text-slate-400 mb-8">Informações básicas do trabalhador e do vínculo empregatício.</p>

    <div class="space-y-6">
      <!-- Dados do trabalhador -->
      <div>
        <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-4 flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 text-xs flex items-center justify-center font-bold">1</span>
          Trabalhador
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="sm:col-span-2">
            <label for="nome-trabalhador" class="label label-required">Nome completo</label>
            <input
              id="nome-trabalhador"
              v-model="dados.nomeTrabalhador"
              type="text"
              placeholder="Ex: João da Silva"
              :class="errors.nomeTrabalhador ? 'input-error' : 'input'"
              @blur="validate('nomeTrabalhador')"
            />
            <p v-if="errors.nomeTrabalhador" class="error-msg">
              <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              {{ errors.nomeTrabalhador }}
            </p>
          </div>
          <div>
            <label for="cargo" class="label">Cargo</label>
            <input id="cargo" v-model="dados.cargo" type="text" placeholder="Ex: Analista de TI" class="input" @change="syncStore" />
          </div>
          <div>
            <label for="empresa" class="label">Empresa</label>
            <input id="empresa" v-model="dados.empresa" type="text" placeholder="Ex: Acme Ltda." class="input" @change="syncStore" />
          </div>
          <div>
            <label for="cnpj" class="label">CNPJ</label>
            <input id="cnpj" v-model="dados.cnpj" type="text" placeholder="00.000.000/0000-00" class="input" @input="maskCNPJ" />
            <p v-if="errors.cnpj" class="error-msg">{{ errors.cnpj }}</p>
          </div>
          <div>
            <label for="sindicato" class="label">Sindicato / Convenção</label>
            <input id="sindicato" v-model="dados.sindicato" type="text" placeholder="Opcional" class="input" @change="syncStore" />
          </div>
        </div>
      </div>

      <!-- Período do contrato -->
      <div>
        <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-4 flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 text-xs flex items-center justify-center font-bold">2</span>
          Período do contrato
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label for="data-admissao" class="label label-required">Data de admissão</label>
            <input
              id="data-admissao"
              v-model="displayDates.admissao"
              type="text"
              placeholder="DD/MM/AAAA"
              maxlength="10"
              :class="errors.dataAdmissao ? 'input-error' : 'input'"
              @input="handleDateInput('admissao', $event)"
              @blur="validate('dataAdmissao')"
            />
            <p v-if="errors.dataAdmissao" class="error-msg">{{ errors.dataAdmissao }}</p>
          </div>
          <div>
            <label for="data-desligamento" class="label label-required">Data de desligamento</label>
            <input
              id="data-desligamento"
              v-model="displayDates.desligamento"
              type="text"
              placeholder="DD/MM/AAAA"
              maxlength="10"
              :class="errors.dataDesligamento ? 'input-error' : 'input'"
              @input="handleDateInput('desligamento', $event)"
              @blur="validate('dataDesligamento')"
            />
            <p v-if="errors.dataDesligamento" class="error-msg">{{ errors.dataDesligamento }}</p>
          </div>
          <div>
            <label for="ultimo-dia" class="label label-required">Último dia trabalhado</label>
            <input
              id="ultimo-dia"
              v-model="displayDates.ultimoDia"
              type="text"
              placeholder="DD/MM/AAAA"
              maxlength="10"
              :class="errors.ultimoDiaTrabalhado ? 'input-error' : 'input'"
              @input="handleDateInput('ultimoDia', $event)"
              @blur="validate('ultimoDiaTrabalhado')"
            />
            <p v-if="errors.ultimoDiaTrabalhado" class="error-msg">{{ errors.ultimoDiaTrabalhado }}</p>
          </div>
        </div>

        <!-- Tempo de serviço preview -->
        <div v-if="tempoServico" class="mt-4 p-4 bg-brand-50 dark:bg-brand-950 rounded-xl border border-brand-100 dark:border-brand-900 flex items-center gap-3">
          <span class="text-2xl">⏱️</span>
          <div>
            <p class="text-sm font-semibold text-brand-700 dark:text-brand-300">Tempo de serviço estimado</p>
            <p class="text-sm text-brand-600 dark:text-brand-400">{{ tempoServico }}</p>
          </div>
        </div>
      </div>

      <!-- Salário -->
      <div>
        <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-4 flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 text-xs flex items-center justify-center font-bold">3</span>
          Remuneração
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="salario" class="label label-required">Salário bruto mensal</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">R$</span>
              <input
                id="salario"
                v-model="salarioDisplay"
                type="text"
                placeholder="0,00"
                inputmode="numeric"
                :class="['pl-10', errors.salarioBrutoMensal ? 'input-error' : 'input']"
                @input="handleSalarioInput"
                @blur="validate('salarioBrutoMensal')"
              />
            </div>
            <p v-if="errors.salarioBrutoMensal" class="error-msg">{{ errors.salarioBrutoMensal }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue'
import { useRescisaoStore } from '../../stores/rescisao.store'
import { maskDate, parseDateBR, formatDate, formatTempoServico } from '../../utils/dates'
import { maskCurrency, parseCurrency } from '../../utils/currency'
import { calcularTempoServico } from '../../domain/rescisao/calculos'

const store = useRescisaoStore()

// Local reactive copy
const dados = reactive({
  nomeTrabalhador: store.dados.nomeTrabalhador,
  cargo: store.dados.cargo || '',
  empresa: store.dados.empresa || '',
  cnpj: store.dados.cnpj || '',
  sindicato: store.dados.sindicato || '',
  dataAdmissao: store.dados.dataAdmissao,
  dataDesligamento: store.dados.dataDesligamento,
  ultimoDiaTrabalhado: store.dados.ultimoDiaTrabalhado,
  salarioBrutoMensal: store.dados.salarioBrutoMensal,
})

const displayDates = reactive({
  admissao: formatDate(dados.dataAdmissao),
  desligamento: formatDate(dados.dataDesligamento),
  ultimoDia: formatDate(dados.ultimoDiaTrabalhado),
})

const salarioDisplay = ref(
  dados.salarioBrutoMensal > 0
    ? dados.salarioBrutoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
    : '',
)

const errors = reactive<Record<string, string>>({})

function handleDateInput(field: 'admissao' | 'desligamento' | 'ultimoDia', event: Event) {
  const input = event.target as HTMLInputElement
  const masked = maskDate(input.value)
  displayDates[field] = masked
  input.value = masked

  if (masked.length === 10) {
    const iso = parseDateBR(masked)
    const keyMap = { admissao: 'dataAdmissao', desligamento: 'dataDesligamento', ultimoDia: 'ultimoDiaTrabalhado' }
    const key = keyMap[field] as keyof typeof dados
    ;(dados as any)[key] = iso
    syncStore()
  }
}

function handleSalarioInput(event: Event) {
  const input = event.target as HTMLInputElement
  const masked = maskCurrency(input.value)
  salarioDisplay.value = masked
  input.value = masked
  dados.salarioBrutoMensal = parseCurrency(masked)
  syncStore()
}

function maskCNPJ(event: Event) {
  const input = event.target as HTMLInputElement
  let v = input.value.replace(/\D/g, '').slice(0, 14)
  if (v.length > 12) v = v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  else if (v.length > 8) v = v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '$1.$2.$3/$4')
  else if (v.length > 5) v = v.replace(/(\d{2})(\d{3})(\d{3})/, '$1.$2.$3')
  else if (v.length > 2) v = v.replace(/(\d{2})(\d{3})/, '$1.$2')
  dados.cnpj = v
  input.value = v
  syncStore()
}

function validate(field: string) {
  errors[field] = ''
  if (field === 'nomeTrabalhador' && dados.nomeTrabalhador.length < 3) {
    errors[field] = 'Nome deve ter ao menos 3 caracteres'
  }
  if (field === 'salarioBrutoMensal' && dados.salarioBrutoMensal <= 0) {
    errors[field] = 'Informe o salário bruto mensal'
  }
  if (field === 'dataAdmissao' && !dados.dataAdmissao) {
    errors[field] = 'Informe a data de admissão'
  }
  if (field === 'dataDesligamento') {
    if (!dados.dataDesligamento) errors[field] = 'Informe a data de desligamento'
    else if (dados.dataAdmissao && dados.dataDesligamento <= dados.dataAdmissao)
      errors[field] = 'Deve ser após a data de admissão'
  }
  if (field === 'ultimoDiaTrabalhado' && !dados.ultimoDiaTrabalhado) {
    errors[field] = 'Informe o último dia trabalhado'
  }
  syncStore()
}

function syncStore() {
  store.atualizarDados({ ...dados })
}

const tempoServico = computed(() => {
  if (!dados.dataAdmissao || !dados.dataDesligamento) return null
  if (dados.dataDesligamento <= dados.dataAdmissao) return null
  const { anos, meses, dias } = calcularTempoServico(dados.dataAdmissao, dados.dataDesligamento)
  return formatTempoServico(anos, meses, dias)
})
</script>
