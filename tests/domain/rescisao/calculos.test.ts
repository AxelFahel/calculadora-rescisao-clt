/**
 * calculos.test.ts — Testes unitários do motor de cálculo de rescisão CLT
 * Usa Vitest. Execute com: npm run test
 */

import { describe, it, expect } from 'vitest'
import {
  calcularTempoServico,
  calcularAnosCompletos,
  calcularDiasAvisoPrevio,
  calcularValorAvisoPrevioIndenizado,
  calcularSaldoSalario,
  calcularDescontoFaltas,
  calcularAvos13,
  calcular13Proporcional,
  calcularFeriasProporcionais,
  calcularFeriasVencidas,
  calcularMultaFgts,
  calcularRescisao,
} from '../../../src/domain/rescisao/calculos'
import { TipoRescisao, TipoAvisoPrevio } from '../../../src/domain/rescisao/types'
import type { DadosContrato } from '../../../src/domain/rescisao/types'

// ─────────────────────────────────────────────────────────────────────────────
// Dados de teste
// ─────────────────────────────────────────────────────────────────────────────

function makeDados(overrides: Partial<DadosContrato> = {}): DadosContrato {
  return {
    nomeTrabalhador: 'Teste Trabalhador',
    dataAdmissao: '2021-01-01',
    dataDesligamento: '2024-07-01',
    ultimoDiaTrabalhado: '2024-07-01',
    salarioBrutoMensal: 3000,
    mediaVariavel: 0,
    temMediasVariaveis: false,
    tipoRescisao: TipoRescisao.SEM_JUSTA_CAUSA,
    tipoAvisoPrevio: TipoAvisoPrevio.INDENIZADO_EMPREGADOR,
    temFeriasVencidas: false,
    quantidadePeriodosVencidos: 0,
    teveAdiantamento13: false,
    valorAdiantamento13: 0,
    saldoFgtsInformado: 5000,
    percentualMultaFgtsManual: -1,
    diasTrabalhadosNoMes: null,
    faltas: 0,
    dependentesIRRF: 0,
    descontosExtras: [],
    creditosExtras: [],
    ...overrides,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Tempo de serviço
// ─────────────────────────────────────────────────────────────────────────────

describe('calcularTempoServico', () => {
  it('calcula corretamente 3 anos, 6 meses, 0 dias', () => {
    const r = calcularTempoServico('2021-01-01', '2024-07-01')
    expect(r.anos).toBe(3)
    expect(r.meses).toBe(6)
    expect(r.dias).toBe(0)
    expect(r.anosCompletos).toBe(3)
  })

  it('calcula menos de 1 ano corretamente', () => {
    const r = calcularTempoServico('2024-01-15', '2024-07-01')
    expect(r.anos).toBe(0)
    expect(r.meses).toBeGreaterThan(0)
  })

  it('anos completos na virada exata', () => {
    const r = calcularTempoServico('2020-06-01', '2025-06-01')
    expect(r.anos).toBe(5)
    expect(r.meses).toBe(0)
    expect(r.dias).toBe(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 2. Anos completos
// ─────────────────────────────────────────────────────────────────────────────

describe('calcularAnosCompletos', () => {
  it('retorna 0 para menos de 1 ano', () => {
    expect(calcularAnosCompletos('2024-01-01', '2024-11-30')).toBe(0)
  })

  it('retorna 1 para exatamente 1 ano', () => {
    expect(calcularAnosCompletos('2023-01-01', '2024-01-01')).toBe(1)
  })

  it('retorna 10 para 10 anos exatos', () => {
    expect(calcularAnosCompletos('2014-03-15', '2024-03-15')).toBe(10)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 3. Aviso prévio proporcional
// ─────────────────────────────────────────────────────────────────────────────

describe('calcularDiasAvisoPrevio', () => {
  it('0 anos completos = 30 dias', () => {
    expect(calcularDiasAvisoPrevio(0)).toBe(30)
  })

  it('1 ano completo = 33 dias', () => {
    expect(calcularDiasAvisoPrevio(1)).toBe(33)
  })

  it('5 anos = 45 dias', () => {
    expect(calcularDiasAvisoPrevio(5)).toBe(45)
  })

  it('10 anos = 60 dias', () => {
    expect(calcularDiasAvisoPrevio(10)).toBe(60)
  })

  it('20 anos = máximo 90 dias', () => {
    expect(calcularDiasAvisoPrevio(20)).toBe(90)
  })

  it('limita a 90 dias mesmo com muitos anos', () => {
    expect(calcularDiasAvisoPrevio(100)).toBe(90)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 4. Valor aviso indenizado
// ─────────────────────────────────────────────────────────────────────────────

describe('calcularValorAvisoPrevioIndenizado', () => {
  it('salário 3000, 30 dias = 3000', () => {
    expect(calcularValorAvisoPrevioIndenizado(3000, 30)).toBeCloseTo(3000, 2)
  })

  it('salário 3000, 33 dias ≈ 3300', () => {
    expect(calcularValorAvisoPrevioIndenizado(3000, 33)).toBeCloseTo(3300, 2)
  })

  it('salário 5000, 60 dias = 10000', () => {
    expect(calcularValorAvisoPrevioIndenizado(5000, 60)).toBeCloseTo(10000, 2)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 5. Saldo de salário
// ─────────────────────────────────────────────────────────────────────────────

describe('calcularSaldoSalario', () => {
  it('calcula pela data informada manualmente (15 dias)', () => {
    const dados = makeDados({ diasTrabalhadosNoMes: 15 })
    const resultado = calcularSaldoSalario(dados)
    expect(resultado).toBeCloseTo(1500, 2) // 3000 / 30 * 15
  })

  it('calcula pelo dia do mês do último dia trabalhado', () => {
    const dados = makeDados({
      ultimoDiaTrabalhado: '2024-07-10',
      diasTrabalhadosNoMes: null,
    })
    const resultado = calcularSaldoSalario(dados)
    expect(resultado).toBeCloseTo(1000, 2) // 3000 / 30 * 10
  })

  it('considera médias variáveis na base', () => {
    const dados = makeDados({
      temMediasVariaveis: true,
      mediaVariavel: 600,
      diasTrabalhadosNoMes: 30,
    })
    const resultado = calcularSaldoSalario(dados)
    expect(resultado).toBeCloseTo(3600, 2) // (3000+600) / 30 * 30
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 6. 13º proporcional
// ─────────────────────────────────────────────────────────────────────────────

describe('calcular13Proporcional', () => {
  it('considera apenas os meses do ano da rescisão em contratos antigos', () => {
    expect(calcularAvos13('2020-04-10', '2026-07-15')).toBe(7)
  })

  it('calcula 6 avos corretamente', () => {
    const dados = makeDados({
      dataAdmissao: '2024-01-01',
      dataDesligamento: '2024-07-01',
      tipoAvisoPrevio: TipoAvisoPrevio.NAO_SE_APLICA,
    })
    const { avos, valorBruto } = calcular13Proporcional(dados)
    expect(avos).toBe(6)
    expect(valorBruto).toBeCloseTo(1500, 2) // 3000 / 12 * 6
  })

  it('desconta adiantamento recebido', () => {
    const dados = makeDados({
      teveAdiantamento13: true,
      valorAdiantamento13: 750,
      dataAdmissao: '2024-01-01',
      dataDesligamento: '2024-07-01',
      tipoAvisoPrevio: TipoAvisoPrevio.NAO_SE_APLICA,
    })
    const { valor, valorBruto, adiantamento } = calcular13Proporcional(dados)
    expect(adiantamento).toBe(750)
    expect(valor).toBeCloseTo(valorBruto - 750, 2)
  })

  it('mês com 15 dias conta como mês cheio', () => {
    const dados = makeDados({
      dataAdmissao: '2024-01-16', // 15 dias no primeiro mês
      dataDesligamento: '2024-02-01',
      tipoAvisoPrevio: TipoAvisoPrevio.NAO_SE_APLICA,
    })
    const { avos } = calcular13Proporcional(dados)
    // 16 dias no primeiro mês (de 16 jan a 1 fev = 16 dias) >= 15, conta como 1 mês
    expect(avos).toBeGreaterThanOrEqual(1)
  })
})

describe('calcularDescontoFaltas', () => {
  it('desconta um trinta avos do salário por falta', () => {
    const dados = makeDados({
      salarioBrutoMensal: 3000,
      diasTrabalhadosNoMes: 20,
      faltas: 2,
    })

    expect(calcularDescontoFaltas(dados)).toBe(200)
  })

  it('inclui o desconto e reduz as bases mensais de impostos', () => {
    const semFaltas = calcularRescisao(makeDados({
      tipoAvisoPrevio: TipoAvisoPrevio.NAO_SE_APLICA,
      diasTrabalhadosNoMes: 20,
    }))
    const comFaltas = calcularRescisao(makeDados({
      tipoAvisoPrevio: TipoAvisoPrevio.NAO_SE_APLICA,
      diasTrabalhadosNoMes: 20,
      faltas: 2,
    }))

    expect(comFaltas.verbas.some((verba) => verba.id === 'desconto_faltas')).toBe(true)
    expect(comFaltas.inss.base).toBeLessThan(semFaltas.inss.base)
    expect(comFaltas.totalLiquido).toBeLessThan(semFaltas.totalLiquido)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 7. Férias proporcionais
// ─────────────────────────────────────────────────────────────────────────────

describe('calcularFeriasProporcionais', () => {
  it('inclui 1/3 constitucional', () => {
    const dados = makeDados({
      dataAdmissao: '2024-01-01',
      dataDesligamento: '2024-07-01',
      tipoAvisoPrevio: TipoAvisoPrevio.NAO_SE_APLICA,
    })
    const { valorBase, umTerco, total } = calcularFeriasProporcionais(dados)
    expect(umTerco).toBeCloseTo(valorBase / 3, 2)
    expect(total).toBeCloseTo(valorBase + umTerco, 2)
  })

  it('avos máximos de 12', () => {
    const dados = makeDados()
    const { avos } = calcularFeriasProporcionais(dados)
    expect(avos).toBeLessThanOrEqual(12)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 8. Férias vencidas
// ─────────────────────────────────────────────────────────────────────────────

describe('calcularFeriasVencidas', () => {
  it('retorna zero quando não tem férias vencidas', () => {
    const dados = makeDados({ temFeriasVencidas: false })
    const { total } = calcularFeriasVencidas(dados)
    expect(total).toBe(0)
  })

  it('calcula 1 período vencido + 1/3', () => {
    const dados = makeDados({
      temFeriasVencidas: true,
      quantidadePeriodosVencidos: 1,
    })
    const { valorBase, umTerco, total } = calcularFeriasVencidas(dados)
    expect(valorBase).toBeCloseTo(3000, 2) // 3000 * 1
    expect(umTerco).toBeCloseTo(1000, 2)   // 3000 / 3
    expect(total).toBeCloseTo(4000, 2)
  })

  it('calcula 2 períodos vencidos + 1/3', () => {
    const dados = makeDados({
      temFeriasVencidas: true,
      quantidadePeriodosVencidos: 2,
    })
    const { total } = calcularFeriasVencidas(dados)
    expect(total).toBeCloseTo(8000, 2) // (3000*2) * 4/3
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 9. Multa FGTS
// ─────────────────────────────────────────────────────────────────────────────

describe('calcularMultaFgts', () => {
  it('sem justa causa = 40%', () => {
    const dados = makeDados({ tipoRescisao: TipoRescisao.SEM_JUSTA_CAUSA, saldoFgtsInformado: 10000 })
    const { percentual, valor } = calcularMultaFgts(dados)
    expect(percentual).toBe(0.40)
    expect(valor).toBeCloseTo(4000, 2)
  })

  it('acordo = 20%', () => {
    const dados = makeDados({ tipoRescisao: TipoRescisao.ACORDO, saldoFgtsInformado: 10000 })
    const { percentual, valor } = calcularMultaFgts(dados)
    expect(percentual).toBe(0.20)
    expect(valor).toBeCloseTo(2000, 2)
  })

  it('pedido de demissão = 0%', () => {
    const dados = makeDados({ tipoRescisao: TipoRescisao.PEDIDO_DEMISSAO, saldoFgtsInformado: 10000 })
    const { percentual, valor } = calcularMultaFgts(dados)
    expect(percentual).toBe(0)
    expect(valor).toBe(0)
  })

  it('justa causa = 0%', () => {
    const dados = makeDados({ tipoRescisao: TipoRescisao.JUSTA_CAUSA, saldoFgtsInformado: 10000 })
    const { valor } = calcularMultaFgts(dados)
    expect(valor).toBe(0)
  })

  it('percentual manual sobrescreve o padrão', () => {
    const dados = makeDados({
      tipoRescisao: TipoRescisao.SEM_JUSTA_CAUSA,
      saldoFgtsInformado: 10000,
      percentualMultaFgtsManual: 0.50,
    })
    const { percentual, valor } = calcularMultaFgts(dados)
    expect(percentual).toBe(0.50)
    expect(valor).toBeCloseTo(5000, 2)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 10. Cenários completos por tipo de rescisão
// ─────────────────────────────────────────────────────────────────────────────

describe('calcularRescisao — cenários completos', () => {
  it('sem justa causa: inclui multa de 40%', () => {
    const dados = makeDados({
      tipoRescisao: TipoRescisao.SEM_JUSTA_CAUSA,
      tipoAvisoPrevio: TipoAvisoPrevio.INDENIZADO_EMPREGADOR,
      saldoFgtsInformado: 5000,
    })
    const resultado = calcularRescisao(dados)
    expect(resultado.percentualMultaFgts).toBe(0.40)
    expect(resultado.multaFgts).toBeCloseTo(2000, 2)
    expect(resultado.totalBruto).toBeGreaterThan(0)
    expect(resultado.totalLiquido).toBeGreaterThan(0)
    expect(resultado.verbas.length).toBeGreaterThan(0)
    // Deve ter aviso prévio indenizado
    expect(resultado.verbas.some((v) => v.id === 'aviso_previo_indenizado')).toBe(true)
  })

  it('pedido de demissão: sem multa FGTS, pode ter desconto aviso', () => {
    const dados = makeDados({
      tipoRescisao: TipoRescisao.PEDIDO_DEMISSAO,
      tipoAvisoPrevio: TipoAvisoPrevio.NAO_CUMPRIDO_EMPREGADO,
      saldoFgtsInformado: 5000,
    })
    const resultado = calcularRescisao(dados)
    expect(resultado.multaFgts).toBe(0)
    expect(resultado.verbas.some((v) => v.id === 'desconto_aviso_previo')).toBe(true)
  })

  it('acordo: multa de 20%', () => {
    const dados = makeDados({
      tipoRescisao: TipoRescisao.ACORDO,
      saldoFgtsInformado: 8000,
    })
    const resultado = calcularRescisao(dados)
    expect(resultado.percentualMultaFgts).toBe(0.20)
    expect(resultado.multaFgts).toBeCloseTo(1600, 2)
  })

  it('justa causa: não tem 13º proporcional nem férias proporcionais', () => {
    const dados = makeDados({
      tipoRescisao: TipoRescisao.JUSTA_CAUSA,
      tipoAvisoPrevio: TipoAvisoPrevio.NAO_SE_APLICA,
      saldoFgtsInformado: 5000,
    })
    const resultado = calcularRescisao(dados)
    expect(resultado.verbas.some((v) => v.id === '13_proporcional')).toBe(false)
    expect(resultado.verbas.some((v) => v.id === 'ferias_proporcionais')).toBe(false)
    expect(resultado.multaFgts).toBe(0)
  })

  it('resultado tem metadados de versão e data', () => {
    const dados = makeDados()
    const resultado = calcularRescisao(dados)
    expect(resultado.versaoMotor).toBeTruthy()
    expect(resultado.dataCalculo).toBeTruthy()
    expect(new Date(resultado.dataCalculo).getTime()).toBeGreaterThan(0)
  })

  it('totais são consistentes (bruto - descontos = liquido - multa)', () => {
    const dados = makeDados({ saldoFgtsInformado: 6000 })
    const r = calcularRescisao(dados)
    expect(r.totalLiquido).toBeCloseTo(r.totalBruto - r.totalDescontos + r.multaFgts, 2)
  })
})
