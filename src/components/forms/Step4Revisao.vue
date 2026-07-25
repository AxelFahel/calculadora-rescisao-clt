<template>
  <div>
    <div class="flex flex-wrap items-start justify-between gap-3 mb-6">
      <div>
        <h2 class="text-xl font-bold text-slate-800 dark:text-white mb-1">Revise antes de calcular</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Confira principalmente datas, salário e tipo de desligamento.
        </p>
      </div>
      <span class="badge-warning">Nenhum valor foi calculado ainda</span>
    </div>

    <AppAlert type="info" class="mb-6">
      Encontrou algo incorreto? Use “Editar” para voltar à etapa correspondente sem perder os demais dados.
    </AppAlert>

    <div class="space-y-4">
      <section class="rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
        <div class="flex items-center justify-between gap-3 mb-4">
          <h3 class="font-semibold text-slate-800 dark:text-white">Contrato e remuneração</h3>
          <AppButton variant="ghost" size="sm" @click="store.irParaEtapa(1)">Editar</AppButton>
        </div>
        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <ReviewItem label="Trabalhador" :value="store.dados.nomeTrabalhador" />
          <ReviewItem label="Empresa" :value="store.dados.empresa || 'Não informada'" />
          <ReviewItem label="Admissão" :value="formatDate(store.dados.dataAdmissao)" />
          <ReviewItem label="Desligamento" :value="formatDate(store.dados.dataDesligamento)" />
          <ReviewItem label="Último dia trabalhado" :value="formatDate(store.dados.ultimoDiaTrabalhado)" />
          <ReviewItem label="Salário bruto" :value="formatCurrency(store.dados.salarioBrutoMensal)" />
        </dl>
      </section>

      <section class="rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
        <div class="flex items-center justify-between gap-3 mb-4">
          <h3 class="font-semibold text-slate-800 dark:text-white">Desligamento</h3>
          <AppButton variant="ghost" size="sm" @click="store.irParaEtapa(2)">Editar</AppButton>
        </div>
        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <ReviewItem label="Tipo de rescisão" :value="LABELS_TIPO_RESCISAO[store.dados.tipoRescisao]" />
          <ReviewItem label="Aviso prévio" :value="LABELS_TIPO_AVISO[store.dados.tipoAvisoPrevio]" />
        </dl>
      </section>

      <section class="rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
        <div class="flex items-center justify-between gap-3 mb-4">
          <h3 class="font-semibold text-slate-800 dark:text-white">Verbas, descontos e FGTS</h3>
          <AppButton variant="ghost" size="sm" @click="store.irParaEtapa(3)">Editar</AppButton>
        </div>
        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <ReviewItem label="Saldo informado do FGTS" :value="formatCurrency(store.dados.saldoFgtsInformado)" />
          <ReviewItem label="Faltas não justificadas" :value="`${store.dados.faltas} dia(s)`" />
          <ReviewItem label="Dependentes para IRRF" :value="String(store.dados.dependentesIRRF)" />
          <ReviewItem
            label="Férias vencidas"
            :value="store.dados.temFeriasVencidas ? `${store.dados.quantidadePeriodosVencidos} período(s)` : 'Não'"
          />
          <ReviewItem
            label="Médias variáveis"
            :value="store.dados.temMediasVariaveis ? formatCurrency(store.dados.mediaVariavel) : 'Não'"
          />
          <ReviewItem
            label="Outros lançamentos"
            :value="`${store.dados.creditosExtras.length} crédito(s) · ${store.dados.descontosExtras.length} desconto(s)`"
          />
        </dl>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, h } from 'vue'
import { useRescisaoStore } from '../../stores/rescisao.store'
import { LABELS_TIPO_AVISO, LABELS_TIPO_RESCISAO } from '../../domain/rescisao/types'
import { formatCurrency } from '../../utils/currency'
import { formatDate } from '../../utils/dates'
import AppAlert from '../ui/AppAlert.vue'
import AppButton from '../ui/AppButton.vue'

const store = useRescisaoStore()

const ReviewItem = defineComponent({
  props: { label: { type: String, required: true }, value: { type: String, required: true } },
  setup(props) {
    return () => h('div', [
      h('dt', { class: 'text-xs text-slate-500 dark:text-slate-400' }, props.label),
      h('dd', { class: 'font-medium text-slate-800 dark:text-slate-200 mt-0.5' }, props.value),
    ])
  },
})
</script>
