/**
 * rescisao.store.ts — Store Pinia para o cálculo atual
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DadosContrato, ResultadoRescisao, DocumentoUpload } from '../domain/rescisao/types'
import { TipoRescisao, TipoAvisoPrevio, CategoriaDocumento, StatusDocumento } from '../domain/rescisao/types'
import { calcularRescisao } from '../domain/rescisao/calculos'
import { validateFile, sanitizeFilename, toDataUrl, generateDocumentId } from '../utils/files'
import { today } from '../utils/dates'

const DADOS_PADRAO: DadosContrato = {
  nomeTrabalhador: '',
  cargo: '',
  empresa: '',
  cnpj: '',
  sindicato: '',
  dataAdmissao: '',
  dataDesligamento: today(),
  ultimoDiaTrabalhado: today(),
  salarioBrutoMensal: 0,
  mediaVariavel: 0,
  temMediasVariaveis: false,
  tipoRescisao: TipoRescisao.SEM_JUSTA_CAUSA,
  tipoAvisoPrevio: TipoAvisoPrevio.INDENIZADO_EMPREGADOR,
  temFeriasVencidas: false,
  quantidadePeriodosVencidos: 0,
  teveAdiantamento13: false,
  valorAdiantamento13: 0,
  saldoFgtsInformado: 0,
  percentualMultaFgtsManual: -1,
  diasTrabalhadosNoMes: null,
  faltas: 0,
  dependentesIRRF: 0,
  descontosExtras: [],
  creditosExtras: [],
  observacoes: '',
}

export const useRescisaoStore = defineStore('rescisao', () => {
  // ── State ──
  const etapaAtual = ref(1)
  const dados = ref<DadosContrato>({ ...DADOS_PADRAO })
  const resultado = ref<ResultadoRescisao | null>(null)
  const documentos = ref<DocumentoUpload[]>([])
  const calculando = ref(false)
  const erroCalculo = ref<string | null>(null)
  const errosValidacao = ref<Record<string, string>>({})

  // ── Getters ──
  const etapasTotal = computed(() => 6)
  const podeContinuar = computed(() => etapaAtual.value < etapasTotal.value)
  const podeVoltar = computed(() => etapaAtual.value > 1)
  const totalDocumentos = computed(() => documentos.value.length)
  const temResultado = computed(() => resultado.value !== null)

  // ── Actions ──
  function atualizarDados(parcial: Partial<DadosContrato>) {
    dados.value = { ...dados.value, ...parcial }
    // Limpa resultado ao mudar dados
    resultado.value = null
    erroCalculo.value = null
    errosValidacao.value = {}
  }

  function avancarEtapa() {
    if (etapaAtual.value < etapasTotal.value) {
      etapaAtual.value++
    }
  }

  function voltarEtapa() {
    if (etapaAtual.value > 1) {
      etapaAtual.value--
    }
  }

  function irParaEtapa(etapa: number) {
    if (etapa >= 1 && etapa <= etapasTotal.value) {
      etapaAtual.value = etapa
    }
  }

  function calcular() {
    calculando.value = true
    erroCalculo.value = null

    try {
      resultado.value = calcularRescisao(dados.value)
    } catch (err) {
      erroCalculo.value =
        err instanceof Error ? err.message : 'Erro ao calcular rescisão'
      resultado.value = null
    } finally {
      calculando.value = false
    }
  }

  async function adicionarDocumento(
    file: File,
    categoria: CategoriaDocumento,
  ): Promise<{ success: boolean; error?: string }> {
    const validation = validateFile(file)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    const doc: DocumentoUpload = {
      id: generateDocumentId(),
      nome: file.name,
      nomeSanitizado: sanitizeFilename(file.name),
      tipo: file.type,
      tamanho: file.size,
      status: StatusDocumento.PENDENTE,
      categoria,
      dataUpload: new Date().toISOString(),
    }

    try {
      const dataUrl = await toDataUrl(file)
      if (dataUrl) doc.dataUrl = dataUrl
      doc.status = StatusDocumento.VALIDADO
    } catch {
      doc.status = StatusDocumento.ERRO
      doc.erroMensagem = 'Erro ao processar arquivo'
    }

    documentos.value.push(doc)
    return { success: true }
  }

  function removerDocumento(id: string) {
    documentos.value = documentos.value.filter((d) => d.id !== id)
  }

  function limpar() {
    dados.value = { ...DADOS_PADRAO }
    resultado.value = null
    documentos.value = []
    etapaAtual.value = 1
    erroCalculo.value = null
  }

  function carregarDados(dadosCarregados: DadosContrato) {
    dados.value = structuredClone(dadosCarregados)
    resultado.value = null
    etapaAtual.value = 1
  }

  function carregarResultado(resultadoCarregado: ResultadoRescisao) {
    resultado.value = structuredClone(resultadoCarregado)
    dados.value = structuredClone(resultadoCarregado.dadosContrato)
    etapaAtual.value = etapasTotal.value
  }

  function exportarJSON(): string {
    return JSON.stringify(
      {
        versao: '1.0.0',
        exportadoEm: new Date().toISOString(),
        resultado: resultado.value,
      },
      null,
      2,
    )
  }

  return {
    // State
    etapaAtual,
    dados,
    resultado,
    documentos,
    calculando,
    erroCalculo,
    errosValidacao,
    // Getters
    etapasTotal,
    podeContinuar,
    podeVoltar,
    totalDocumentos,
    temResultado,
    // Actions
    atualizarDados,
    avancarEtapa,
    voltarEtapa,
    irParaEtapa,
    calcular,
    adicionarDocumento,
    removerDocumento,
    limpar,
    carregarDados,
    carregarResultado,
    exportarJSON,
  }
})
