<template>
  <div>
    <h2 class="text-xl font-bold text-slate-800 dark:text-white mb-1">Documentos</h2>
    <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">Anexe documentos opcionalmente para referência. <strong>Nenhum arquivo é enviado a servidores.</strong></p>

    <!-- Alerta de privacidade -->
    <AppAlert type="warning" title="Privacidade dos seus documentos" class="mb-6">
      Documentos trabalhistas contêm dados pessoais sensíveis. Todos os arquivos são processados
      <strong>exclusivamente no seu dispositivo</strong> e não são enviados a servidores externos.
      O sistema armazena apenas metadados (nome, tipo, tamanho) — nunca o conteúdo dos arquivos.
    </AppAlert>

    <!-- Área de upload -->
    <div
      id="drop-zone"
      :class="['border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer mb-6',
        isDragging ? 'border-brand-500 bg-brand-50 dark:bg-brand-950' : 'border-slate-300 dark:border-slate-600 hover:border-brand-400 hover:bg-slate-50 dark:hover:bg-slate-800/50']"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="handleDrop"
      @click="fileInputRef?.click()"
    >
      <input
        ref="fileInputRef"
        type="file"
        class="hidden"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        @change="handleFileChange"
      />
      <div class="flex flex-col items-center gap-3">
        <div :class="['w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-transform duration-200', isDragging ? 'scale-110' : '']">
          📂
        </div>
        <div>
          <p class="font-semibold text-slate-700 dark:text-slate-300">Arraste arquivos aqui ou clique para selecionar</p>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">PDF, JPG, PNG, WEBP · Máx. 10 MB por arquivo</p>
        </div>
      </div>
    </div>

    <!-- Upload dialog por categoria -->
    <AppModal :open="showCategoryModal" title="Tipo de documento" size="sm" @close="showCategoryModal = false">
      <div class="space-y-2">
        <button
          v-for="cat in categorias"
          :key="cat.value"
          type="button"
          :class="['w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all', selectedCategory === cat.value ? 'border-brand-500 bg-brand-50 dark:bg-brand-950' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300']"
          @click="selectedCategory = cat.value"
        >
          <span class="text-xl">{{ cat.icon }}</span>
          <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ cat.label }}</span>
        </button>
      </div>
      <template #footer>
        <div class="flex gap-3">
          <AppButton variant="secondary" class="flex-1" @click="showCategoryModal = false">Cancelar</AppButton>
          <AppButton variant="primary" class="flex-1" @click="confirmUpload">Confirmar</AppButton>
        </div>
      </template>
    </AppModal>

    <!-- Lista de documentos -->
    <div v-if="store.documentos.length > 0" class="space-y-3">
      <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300">Documentos anexados ({{ store.documentos.length }})</h3>
      <div
        v-for="doc in store.documentos"
        :key="doc.id"
        class="card p-4 flex items-center gap-4"
      >
        <!-- Preview -->
        <div class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
          <img v-if="doc.dataUrl" :src="doc.dataUrl" :alt="doc.nome" class="w-full h-full object-cover" />
          <span v-else class="text-2xl">{{ getFileIcon(doc.tipo) }}</span>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-slate-800 dark:text-white truncate">{{ doc.nomeSanitizado }}</p>
          <div class="flex items-center gap-2 mt-1">
            <span class="badge-brand text-xs">{{ LABELS_CATEGORIA[doc.categoria] }}</span>
            <span class="text-xs text-slate-400">{{ formatFileSize(doc.tamanho) }}</span>
            <span :class="['badge text-xs', doc.status === 'VALIDADO' ? 'badge-success' : 'badge-danger']">
              {{ doc.status === 'VALIDADO' ? '✓ Válido' : '✗ Erro' }}
            </span>
          </div>
          <p v-if="doc.erroMensagem" class="text-xs text-danger-600 mt-1">{{ doc.erroMensagem }}</p>
        </div>

        <!-- Remove -->
        <button type="button" class="btn-ghost p-2 shrink-0 text-slate-400 hover:text-danger-500" @click="store.removerDocumento(doc.id)">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      </div>
    </div>

    <!-- Info OCR futuro -->
    <div class="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
      <div class="flex items-start gap-3">
        <span class="text-lg">🔬</span>
        <div>
          <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Extração automática (em breve)</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Futuramente, o sistema poderá extrair automaticamente dados dos documentos via OCR,
            pré-preenchendo campos do formulário para sua confirmação. Por ora, preencha manualmente.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRescisaoStore } from '../../stores/rescisao.store'
import { CategoriaDocumento, LABELS_CATEGORIA_DOCUMENTO } from '../../domain/rescisao/types'
import { formatFileSize, getFileIcon } from '../../utils/files'
import AppAlert from '../ui/AppAlert.vue'
import AppModal from '../ui/AppModal.vue'
import AppButton from '../ui/AppButton.vue'

const store = useRescisaoStore()

const LABELS_CATEGORIA = LABELS_CATEGORIA_DOCUMENTO
const isDragging = ref(false)
const showCategoryModal = ref(false)
const selectedCategory = ref<CategoriaDocumento>(CategoriaDocumento.OUTRO)
const pendingFiles = ref<File[]>([])
const fileInputRef = ref<HTMLInputElement | null>(null)

const categorias = [
  { value: CategoriaDocumento.CARTEIRA_TRABALHO, icon: '📗', label: 'Carteira de Trabalho' },
  { value: CategoriaDocumento.EXTRATO_FGTS, icon: '🏦', label: 'Extrato do FGTS' },
  { value: CategoriaDocumento.TERMO_RESCISAO, icon: '📄', label: 'Termo de Rescisão' },
  { value: CategoriaDocumento.HOLERITE, icon: '🧾', label: 'Holerite' },
  { value: CategoriaDocumento.CONTRATO_TRABALHO, icon: '📋', label: 'Contrato de Trabalho' },
  { value: CategoriaDocumento.OUTRO, icon: '📎', label: 'Outro Documento' },
]

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files?.length) {
    pendingFiles.value = Array.from(input.files)
    showCategoryModal.value = true
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  if (event.dataTransfer?.files.length) {
    pendingFiles.value = Array.from(event.dataTransfer.files)
    showCategoryModal.value = true
  }
}

async function confirmUpload() {
  showCategoryModal.value = false
  for (const file of pendingFiles.value) {
    await store.adicionarDocumento(file, selectedCategory.value)
  }
  pendingFiles.value = []
  if (fileInputRef.value) fileInputRef.value.value = ''
}
</script>
