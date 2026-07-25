/**
 * historico.store.ts — Store Pinia para histórico de cálculos (localStorage)
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { HistoricoItem, ResultadoRescisao } from '../domain/rescisao/types'

const STORAGE_KEY = 'rescisao_clt_historico'
const MAX_HISTORICO = 50

function carregarDoStorage(): HistoricoItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const items = JSON.parse(raw) as HistoricoItem[]
    return items.map((item) => {
      if (item.resultado.totalComFgts === undefined) {
        const totalComFgts = item.resultado.totalLiquido
        const totalLiquido = Math.round((totalComFgts - item.resultado.multaFgts) * 100) / 100
        return {
          ...item,
          totalLiquido,
          resultado: { ...item.resultado, totalLiquido, totalComFgts },
        }
      }
      return item
    })
  } catch {
    return []
  }
}

function salvarNoStorage(items: HistoricoItem[]) {
  try {
    // Salva apenas metadados + dados de cálculo — sem arquivos/blobs
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (e) {
    console.warn('Não foi possível salvar no localStorage:', e)
  }
}

function generateId(): string {
  return `hist_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export const useHistoricoStore = defineStore('historico', () => {
  const calculos = ref<HistoricoItem[]>(carregarDoStorage())

  const totalCalculos = computed(() => calculos.value.length)
  const calculosOrdenados = computed(() =>
    [...calculos.value].sort(
      (a, b) => new Date(b.dataCalculo).getTime() - new Date(a.dataCalculo).getTime(),
    ),
  )

  function salvar(resultado: ResultadoRescisao): string {
    const existente = calculos.value.find((item) => item.dataCalculo === resultado.dataCalculo)
    if (existente) return existente.id

    const id = generateId()
    const item: HistoricoItem = {
      id,
      nomeTrabalhador: resultado.dadosContrato.nomeTrabalhador,
      empresa: resultado.dadosContrato.empresa,
      tipoRescisao: resultado.dadosContrato.tipoRescisao,
      dataCalculo: resultado.dataCalculo,
      totalLiquido: resultado.totalLiquido,
      resultado,
    }

    // Mantém limite máximo
    const atualizado = [item, ...calculos.value].slice(0, MAX_HISTORICO)
    calculos.value = atualizado
    salvarNoStorage(atualizado)
    return id
  }

  function remover(id: string) {
    calculos.value = calculos.value.filter((c) => c.id !== id)
    salvarNoStorage(calculos.value)
  }

  function restaurar(item: HistoricoItem) {
    if (calculos.value.some((calculo) => calculo.id === item.id)) return
    calculos.value = [item, ...calculos.value].slice(0, MAX_HISTORICO)
    salvarNoStorage(calculos.value)
  }

  function limparTudo() {
    calculos.value = []
    localStorage.removeItem(STORAGE_KEY)
  }

  function buscarPorId(id: string): HistoricoItem | undefined {
    return calculos.value.find((c) => c.id === id)
  }

  return {
    calculos,
    totalCalculos,
    calculosOrdenados,
    salvar,
    remover,
    restaurar,
    limparTudo,
    buscarPorId,
  }
})
