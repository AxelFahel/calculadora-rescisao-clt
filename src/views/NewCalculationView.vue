<template>
  <div class="animate-fade-in max-w-4xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-4">
        <RouterLink to="/" class="btn-ghost px-2 py-1.5 text-sm">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
          Voltar
        </RouterLink>
      </div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Novo cálculo de rescisão</h1>
      <p class="text-slate-500 dark:text-slate-400 mt-1">Preencha os campos em cada etapa para calcular os valores estimados.</p>
    </div>

    <!-- Stepper -->
    <div class="card p-6 mb-6">
      <AppStepper :steps="wizardSteps" :current-step="store.etapaAtual" @go-to="store.irParaEtapa" />
    </div>

    <!-- Step content -->
    <div class="card p-6 sm:p-8 mb-6 min-h-[400px]">
      <Transition name="step" mode="out-in">
        <component :is="currentStepComponent" :key="store.etapaAtual" />
      </Transition>
    </div>

    <!-- Navigation -->
    <div class="flex items-center justify-between gap-4">
      <AppButton
        v-if="store.podeVoltar && store.etapaAtual < 5"
        variant="secondary"
        id="btn-voltar-etapa"
        @click="store.voltarEtapa()"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
        Voltar
      </AppButton>
      <div v-else />

      <div class="flex items-center gap-3">
        <AppButton
          v-if="store.etapaAtual < 4"
          variant="primary"
          id="btn-avancar-etapa"
          @click="store.avancarEtapa()"
        >
          Continuar
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
        </AppButton>

        <AppButton
          v-if="store.etapaAtual === 4"
          variant="primary"
          id="btn-calcular"
          :loading="store.calculando"
          @click="calcularEIrParaResultado()"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          Calcular rescisão
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useRescisaoStore } from '../stores/rescisao.store'
import AppStepper from '../components/ui/AppStepper.vue'
import AppButton from '../components/ui/AppButton.vue'
import Step1DadosContrato from '../components/forms/Step1DadosContrato.vue'
import Step2Desligamento from '../components/forms/Step2Desligamento.vue'
import Step3VerbasFgts from '../components/forms/Step3VerbasFgts.vue'
import Step4Documentos from '../components/forms/Step4Documentos.vue'

const store = useRescisaoStore()
const router = useRouter()

const wizardSteps = [
  { id: 'dados',       label: 'Dados do Contrato' },
  { id: 'desligamento',label: 'Desligamento' },
  { id: 'verbas',      label: 'Verbas & FGTS' },
  { id: 'documentos',  label: 'Documentos' },
  { id: 'resultado',   label: 'Resultado' },
]

const currentStepComponent = computed(() => {
  switch (store.etapaAtual) {
    case 1: return Step1DadosContrato
    case 2: return Step2Desligamento
    case 3: return Step3VerbasFgts
    case 4: return Step4Documentos
    default: return Step1DadosContrato
  }
})

async function calcularEIrParaResultado() {
  store.calcular()
  if (store.resultado) {
    store.irParaEtapa(5)
    await router.push({ name: 'resultado' })
  }
}
</script>

<style scoped>
.step-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.step-leave-active { transition: opacity 0.15s ease; }
.step-enter-from   { opacity: 0; transform: translateX(16px); }
.step-leave-to     { opacity: 0; }
</style>
