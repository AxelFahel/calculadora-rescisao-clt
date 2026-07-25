import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useHistoricoStore } from '../../src/stores/historico.store'
import { useRescisaoStore } from '../../src/stores/rescisao.store'
import { calcularRescisao } from '../../src/domain/rescisao/calculos'
import { TipoAvisoPrevio, TipoRescisao } from '../../src/domain/rescisao/types'
import type { DadosContrato } from '../../src/domain/rescisao/types'

function dadosValidos(): DadosContrato {
  return {
    nomeTrabalhador: 'Pessoa Teste',
    dataAdmissao: '2024-01-01',
    dataDesligamento: '2026-07-15',
    ultimoDiaTrabalhado: '2026-07-15',
    salarioBrutoMensal: 4000,
    mediaVariavel: 0,
    temMediasVariaveis: false,
    tipoRescisao: TipoRescisao.SEM_JUSTA_CAUSA,
    tipoAvisoPrevio: TipoAvisoPrevio.INDENIZADO_EMPREGADOR,
    temFeriasVencidas: false,
    quantidadePeriodosVencidos: 0,
    teveAdiantamento13: false,
    valorAdiantamento13: 0,
    saldoFgtsInformado: 10000,
    percentualMultaFgtsManual: -1,
    diasTrabalhadosNoMes: 15,
    faltas: 0,
    dependentesIRRF: 0,
    descontosExtras: [],
    creditosExtras: [],
  }
}

describe('fluxos de novo cálculo e histórico', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('limpa integralmente o cálculo atual para iniciar outro', () => {
    const store = useRescisaoStore()
    store.atualizarDados(dadosValidos())
    store.calcular()
    store.irParaEtapa(5)

    store.limpar()

    expect(store.resultado).toBeNull()
    expect(store.etapaAtual).toBe(1)
    expect(store.dados.nomeTrabalhador).toBe('')
    expect(store.documentos).toEqual([])
  })

  it('não duplica o mesmo resultado no histórico', () => {
    const historico = useHistoricoStore()
    const resultado = calcularRescisao(dadosValidos())

    const primeiroId = historico.salvar(resultado)
    const segundoId = historico.salvar(resultado)

    expect(segundoId).toBe(primeiroId)
    expect(historico.totalCalculos).toBe(1)
  })

  it('permite desfazer a remoção de um item do histórico', () => {
    const historico = useHistoricoStore()
    const resultado = calcularRescisao(dadosValidos())
    const id = historico.salvar(resultado)
    const item = historico.buscarPorId(id)!

    historico.remover(id)
    historico.restaurar(item)

    expect(historico.buscarPorId(id)).toEqual(item)
  })

  it('abre o resultado histórico sem refazer o cálculo', () => {
    const store = useRescisaoStore()
    const resultado = calcularRescisao(dadosValidos())

    store.carregarResultado(resultado)

    expect(store.resultado?.dataCalculo).toBe(resultado.dataCalculo)
    expect(store.resultado?.totalLiquido).toBe(resultado.totalLiquido)
    expect(store.etapaAtual).toBe(6)
  })
})
