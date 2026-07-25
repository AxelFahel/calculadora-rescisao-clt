/**
 * calculos.ts — Motor de cálculo de rescisão CLT
 *
 * IMPORTANTE: Este arquivo contém funções puras (sem dependências Vue/Pinia).
 * Os cálculos são estimativas e podem variar por convenção coletiva,
 * descontos, faltas, adicionais, verbas variáveis e decisões judiciais.
 *
 * Referências legais:
 * - CLT Arts. 129-153 (férias), 457-468 (salário), 477-487 (rescisão)
 * - Lei 8.036/1990 (FGTS)
 * - Lei 12.506/2011 (aviso prévio proporcional)
 * - INSS: Portaria Interministerial MPS/MF 13/2026
 * - IRRF: Lei 15.270/2025
 */

import dayjs from 'dayjs'
import type {
  DadosContrato,
  TempoServico,
  InfoAvisoPrevio,
  VerbaRescisoria,
  ResultadoRescisao,
} from './types'
import { TipoRescisao, TipoAvisoPrevio } from './types'
import {
  AVISO_BASE_DIAS,
  AVISO_INCREMENTO_DIAS_POR_ANO,
  AVISO_MAXIMO_DIAS,
  DIAS_MINIMOS_MES_CHEIO,
  DIVISOR_SALARIO_MENSAL,
  MESES_ANO,
  PERCENTUAL_FGTS,
  REGRAS_POR_RESCISAO,
  VERSAO_MOTOR,
} from './regras'
import { calcularINSS, calcularIRRF } from '../impostos/tabelas'

// ─────────────────────────────────────────────────────────────────────────────
// 1. Tempo de serviço
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcula o tempo de serviço entre admissão e desligamento.
 * Quando o aviso prévio é indenizado pelo empregador, a data de término
 * deve ser a data projetada (desligamento + dias de aviso).
 */
export function calcularTempoServico(
  dataAdmissao: string,
  dataReferencia: string,
): TempoServico {
  const admissao = dayjs(dataAdmissao)
  const referencia = dayjs(dataReferencia)

  const totalDias = referencia.diff(admissao, 'day')
  const anos = referencia.diff(admissao, 'year')
  const anosCompletos = anos

  // Avança a data de admissão pelos anos completos para calcular meses restantes
  const aposAnos = admissao.add(anos, 'year')
  const meses = referencia.diff(aposAnos, 'month')

  // Avança pelos meses para calcular dias restantes
  const aposMeses = aposAnos.add(meses, 'month')
  const dias = referencia.diff(aposMeses, 'day')

  return { anos, meses, dias, totalDias, anosCompletos }
}

/**
 * Retorna apenas o número de anos completos — usado para aviso proporcional.
 */
export function calcularAnosCompletos(
  dataAdmissao: string,
  dataReferencia: string,
): number {
  return dayjs(dataReferencia).diff(dayjs(dataAdmissao), 'year')
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Aviso prévio (Lei 12.506/2011)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcula o aviso prévio proporcional.
 * Fórmula: 30 dias + (3 dias × anos completos de serviço), máx. 90 dias.
 */
export function calcularDiasAvisoPrevio(anosCompletos: number): number {
  const dias = AVISO_BASE_DIAS + anosCompletos * AVISO_INCREMENTO_DIAS_POR_ANO
  return Math.min(dias, AVISO_MAXIMO_DIAS)
}

/**
 * Calcula o valor indenizado do aviso prévio.
 * Base = salário + médias variáveis (se habitual).
 */
export function calcularValorAvisoPrevioIndenizado(
  salarioBase: number,
  diasAviso: number,
): number {
  // O aviso indenizado corresponde ao valor dos dias de aviso
  // Fórmula: (salário / 30) * dias_aviso
  return arredondar((salarioBase / DIVISOR_SALARIO_MENSAL) * diasAviso)
}

/**
 * Monta o objeto completo de informações do aviso prévio.
 * Quando o aviso é indenizado pelo empregador, projeta a data de término
 * e esse período integra o tempo de serviço para férias, 13º e FGTS.
 */
export function calcularInfoAvisoPrevio(dados: DadosContrato): InfoAvisoPrevio {
  const anosCompletos = calcularAnosCompletos(dados.dataAdmissao, dados.dataDesligamento)
  const diasAviso = calcularDiasAvisoPrevio(anosCompletos)

  let valorIndenizado = 0
  let dataProjecaoTermino: string | null = null

  const salarioBase = dados.salarioBrutoMensal + (dados.temMediasVariaveis ? dados.mediaVariavel : 0)

  if (dados.tipoAvisoPrevio === TipoAvisoPrevio.INDENIZADO_EMPREGADOR) {
    valorIndenizado = calcularValorAvisoPrevioIndenizado(salarioBase, diasAviso)
    dataProjecaoTermino = dayjs(dados.dataDesligamento).add(diasAviso, 'day').format('YYYY-MM-DD')
  } else if (dados.tipoAvisoPrevio === TipoAvisoPrevio.NAO_CUMPRIDO_EMPREGADO) {
    // Valor que será descontado do trabalhador
    valorIndenizado = calcularValorAvisoPrevioIndenizado(salarioBase, diasAviso)
  }

  return {
    diasBase: AVISO_BASE_DIAS,
    diasPorAnosServico: anosCompletos * AVISO_INCREMENTO_DIAS_POR_ANO,
    totalDias: diasAviso,
    tipo: dados.tipoAvisoPrevio,
    valorIndenizado,
    dataProjecaoTermino,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Data de referência para cálculos (considera projeção do aviso)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Quando o aviso é indenizado pelo empregador, a data de término projetada
 * deve ser usada para cálculo de férias, 13º e estimativa de FGTS.
 */
function calcularDataReferencia(dados: DadosContrato): string {
  if (dados.tipoAvisoPrevio === TipoAvisoPrevio.INDENIZADO_EMPREGADOR) {
    const anosCompletos = calcularAnosCompletos(dados.dataAdmissao, dados.dataDesligamento)
    const diasAviso = calcularDiasAvisoPrevio(anosCompletos)
    return dayjs(dados.dataDesligamento).add(diasAviso, 'day').format('YYYY-MM-DD')
  }
  return dados.dataDesligamento
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Saldo de salário
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcula o saldo de salário do mês da rescisão.
 * Fórmula: (salário / 30) × dias trabalhados no mês
 *
 * Os dias trabalhados podem ser informados pelo usuário ou calculados
 * automaticamente como o dia do desligamento (último dia trabalhado).
 */
export function calcularSaldoSalario(dados: DadosContrato): number {
  const diasTrabalhados =
    dados.diasTrabalhadosNoMes !== null && dados.diasTrabalhadosNoMes !== undefined
      ? dados.diasTrabalhadosNoMes
      : dayjs(dados.ultimoDiaTrabalhado).date() // dia do mês

  const salarioBase = dados.salarioBrutoMensal + (dados.temMediasVariaveis ? dados.mediaVariavel : 0)
  return arredondar((salarioBase / DIVISOR_SALARIO_MENSAL) * diasTrabalhados)
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. 13º proporcional
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcula os avos de 13º proporcional.
 * Regra: meses com >= 15 dias trabalhados contam como mês cheio.
 */
export function calcularAvos13(dataAdmissao: string, dataReferencia: string): number {
  const admissao = dayjs(dataAdmissao)
  const referencia = dayjs(dataReferencia)

  // Meses completos
  let avos = referencia.diff(admissao, 'month')

  // Verifica os dias restantes do último mês parcial
  const aposAvos = admissao.add(avos, 'month')
  const diasRestantes = referencia.diff(aposAvos, 'day')

  if (diasRestantes >= DIAS_MINIMOS_MES_CHEIO) {
    avos += 1
  }

  // Máximo 12 avos
  return Math.min(avos, MESES_ANO)
}

/**
 * Calcula o 13º proporcional bruto.
 * Fórmula: (salário_base / 12) × avos
 * Desconta o adiantamento já recebido.
 */
export function calcular13Proporcional(dados: DadosContrato): {
  valor: number
  avos: number
  valorBruto: number
  adiantamento: number
} {
  const dataReferencia = calcularDataReferencia(dados)
  const avos = calcularAvos13(dados.dataAdmissao, dataReferencia)
  const salarioBase = dados.salarioBrutoMensal + (dados.temMediasVariaveis ? dados.mediaVariavel : 0)

  const valorBruto = arredondar((salarioBase / MESES_ANO) * avos)
  const adiantamento = dados.teveAdiantamento13 ? dados.valorAdiantamento13 : 0
  const valor = arredondar(valorBruto - adiantamento)

  return { valor: Math.max(0, valor), avos, valorBruto, adiantamento }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Férias
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcula os avos de férias proporcionais.
 * Regra: meses com >= 15 dias contam como mês cheio (mesma do 13º).
 */
export function calcularAvosFeriasProporcionais(
  dataAdmissao: string,
  dataReferencia: string,
): number {
  const admissao = dayjs(dataAdmissao)
  const referencia = dayjs(dataReferencia)

  // Início do período aquisitivo atual
  const anosCompletos = referencia.diff(admissao, 'year')
  const inicioAquisitivo = admissao.add(anosCompletos, 'year')

  let avos = referencia.diff(inicioAquisitivo, 'month')
  const aposAvos = inicioAquisitivo.add(avos, 'month')
  const diasRestantes = referencia.diff(aposAvos, 'day')

  if (diasRestantes >= DIAS_MINIMOS_MES_CHEIO) {
    avos += 1
  }

  return Math.min(avos, MESES_ANO)
}

/**
 * Calcula férias proporcionais + 1/3 constitucional.
 * Fórmula: (salário_base / 12 × avos) + 1/3 do resultado
 */
export function calcularFeriasProporcionais(dados: DadosContrato): {
  valorBase: number
  umTerco: number
  total: number
  avos: number
} {
  const dataReferencia = calcularDataReferencia(dados)
  const avos = calcularAvosFeriasProporcionais(dados.dataAdmissao, dataReferencia)
  const salarioBase = dados.salarioBrutoMensal + (dados.temMediasVariaveis ? dados.mediaVariavel : 0)

  const valorBase = arredondar((salarioBase / MESES_ANO) * avos)
  const umTerco = arredondar(valorBase / 3)
  const total = arredondar(valorBase + umTerco)

  return { valorBase, umTerco, total, avos }
}

/**
 * Calcula férias vencidas (períodos já adquiridos mas não gozados) + 1/3.
 * Fórmula: salário_base × períodos_vencidos + 1/3
 */
export function calcularFeriasVencidas(dados: DadosContrato): {
  valorBase: number
  umTerco: number
  total: number
  periodos: number
} {
  if (!dados.temFeriasVencidas || dados.quantidadePeriodosVencidos <= 0) {
    return { valorBase: 0, umTerco: 0, total: 0, periodos: 0 }
  }

  const salarioBase = dados.salarioBrutoMensal + (dados.temMediasVariaveis ? dados.mediaVariavel : 0)
  const valorBase = arredondar(salarioBase * dados.quantidadePeriodosVencidos)
  const umTerco = arredondar(valorBase / 3)
  const total = arredondar(valorBase + umTerco)

  return { valorBase, umTerco, total, periodos: dados.quantidadePeriodosVencidos }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. FGTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Estima o FGTS depositado sobre as verbas rescisórias incidentes.
 * (Saldo de salário, aviso indenizado, 13º proporcional)
 * Nota: este é um cálculo estimativo; o saldo real deve ser consultado
 * no extrato do FGTS Digital.
 */
export function calcularFgtsEstimadoSobreVerbas(
  verbas: Array<{ valor: number; incideFgts?: boolean }>,
): number {
  const baseIncidente = verbas
    .filter((v) => v.incideFgts && v.valor > 0)
    .reduce((acc, v) => acc + v.valor, 0)

  return arredondar(baseIncidente * PERCENTUAL_FGTS)
}

/**
 * Calcula a multa rescisória sobre o saldo de FGTS.
 * Usa o percentual padrão por tipo de rescisão, ou o percentual
 * manual informado pelo usuário (quando > -1).
 */
export function calcularMultaFgts(dados: DadosContrato): {
  valor: number
  percentual: number
  base: number
} {
  const regras = REGRAS_POR_RESCISAO[dados.tipoRescisao]
  const percentual =
    dados.percentualMultaFgtsManual >= 0
      ? dados.percentualMultaFgtsManual
      : regras.percentualMultaFgts

  const base = dados.saldoFgtsInformado
  const valor = arredondar(base * percentual)

  return { valor, percentual, base }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Orquestrador principal
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcula a rescisão completa e retorna ResultadoRescisao.
 * Esta é a função de entrada principal do motor de cálculo.
 */
export function calcularRescisao(dados: DadosContrato): ResultadoRescisao {
  const regras = REGRAS_POR_RESCISAO[dados.tipoRescisao]
  const dataReferencia = calcularDataReferencia(dados)
  const tempoServico = calcularTempoServico(dados.dataAdmissao, dataReferencia)
  const avisoPrevio = calcularInfoAvisoPrevio(dados)

  const verbas: VerbaRescisoria[] = []

  // ── Saldo de salário ──
  if (regras.temSaldoSalario) {
    const valor = calcularSaldoSalario(dados)
    const diasTrabalhados =
      dados.diasTrabalhadosNoMes !== null && dados.diasTrabalhadosNoMes !== undefined
        ? dados.diasTrabalhadosNoMes
        : dayjs(dados.ultimoDiaTrabalhado).date()

    verbas.push({
      id: 'saldo_salario',
      nome: 'Saldo de Salário',
      base: dados.salarioBrutoMensal,
      formula: `R$ ${fmt(dados.salarioBrutoMensal)} / 30 × ${diasTrabalhados} dias`,
      valor,
      positivo: true,
      incideFgts: true,
      incideInss: true,
      incideIrrf: true,
      obrigatoria: true,
      observacoes: `${diasTrabalhados} dias trabalhados no mês da rescisão`,
    })
  }

  // ── Aviso prévio indenizado ──
  if (
    regras.temAvisoPrevio &&
    dados.tipoAvisoPrevio === TipoAvisoPrevio.INDENIZADO_EMPREGADOR &&
    avisoPrevio.valorIndenizado > 0
  ) {
    verbas.push({
      id: 'aviso_previo_indenizado',
      nome: 'Aviso Prévio Indenizado',
      base: dados.salarioBrutoMensal,
      formula: `R$ ${fmt(dados.salarioBrutoMensal)} / 30 × ${avisoPrevio.totalDias} dias`,
      valor: avisoPrevio.valorIndenizado,
      positivo: true,
      incideFgts: true,
      incideInss: false,
      incideIrrf: false,
      obrigatoria: false,
      observacoes: `${avisoPrevio.totalDias} dias (${AVISO_BASE_DIAS} base + ${avisoPrevio.diasPorAnosServico} proporcional)`,
    })
  }

  // ── Desconto aviso não cumprido pelo empregado ──
  if (
    dados.tipoAvisoPrevio === TipoAvisoPrevio.NAO_CUMPRIDO_EMPREGADO &&
    regras.podeTerDescontoAviso
  ) {
    verbas.push({
      id: 'desconto_aviso_previo',
      nome: 'Desconto Aviso Prévio (não cumprido)',
      base: dados.salarioBrutoMensal,
      formula: `R$ ${fmt(dados.salarioBrutoMensal)} / 30 × ${avisoPrevio.totalDias} dias`,
      valor: avisoPrevio.valorIndenizado,
      positivo: false,
      incideFgts: false,
      obrigatoria: false,
      observacoes: 'Desconto pelo não cumprimento do aviso pelo empregado',
    })
  }

  // ── 13º proporcional ──
  if (regras.tem13Proporcional) {
    const { valor, avos, valorBruto, adiantamento } = calcular13Proporcional(dados)
    const salarioBase =
      dados.salarioBrutoMensal + (dados.temMediasVariaveis ? dados.mediaVariavel : 0)

    verbas.push({
      id: '13_proporcional',
      nome: '13º Salário Proporcional',
      base: salarioBase,
      formula: `R$ ${fmt(salarioBase)} / 12 × ${avos} avos${adiantamento > 0 ? ` − R$ ${fmt(adiantamento)} (adiantado)` : ''}`,
      valor,
      positivo: true,
      incideFgts: true,
      incideInss: true,
      incideIrrf: true,  // IRRF sobre 13º complementar é retido na fonte
      obrigatoria: false,
      observacoes: `${avos}/12 avos (bruto R$ ${fmt(valorBruto)})`,
    })
  }

  // ── Férias proporcionais ──
  if (regras.temFeriasProporcionais) {
    const { valorBase, umTerco, total, avos } = calcularFeriasProporcionais(dados)
    const salarioBase =
      dados.salarioBrutoMensal + (dados.temMediasVariaveis ? dados.mediaVariavel : 0)

    if (avos > 0) {
      verbas.push({
        id: 'ferias_proporcionais',
        nome: 'Férias Proporcionais + 1/3',
        base: salarioBase,
        formula: `(R$ ${fmt(salarioBase)} / 12 × ${avos}) + 1/3`,
        valor: total,
        positivo: true,
        incideFgts: false,
        incideInss: false,  // Natureza indenizatória na rescisão (Art. 146, CLT)
        incideIrrf: false,  // Isentas quando pagas como indenização rescisória
        obrigatoria: false,
        observacoes: `${avos}/12 avos · Base: R$ ${fmt(valorBase)} · 1/3: R$ ${fmt(umTerco)}`,
      })
    }
  }

  // ── Férias vencidas ──
  if (regras.temFeriasVencidas && dados.temFeriasVencidas) {
    const { valorBase, umTerco, total, periodos } = calcularFeriasVencidas(dados)
    const salarioBase =
      dados.salarioBrutoMensal + (dados.temMediasVariaveis ? dados.mediaVariavel : 0)

    if (total > 0) {
      verbas.push({
        id: 'ferias_vencidas',
        nome: `Férias Vencidas + 1/3 (${periodos} período${periodos > 1 ? 's' : ''})`,
        base: salarioBase,
        formula: `R$ ${fmt(salarioBase)} × ${periodos} + 1/3`,
        valor: total,
        positivo: true,
        incideFgts: false,
        incideInss: false,  // Férias vencidas são indenizatórias (Art. 146, CLT)
        incideIrrf: false,  // Isentas de IRRF quando pagas por rescisão (Súm. 386 STJ)
        obrigatoria: false,
        observacoes: `Base: R$ ${fmt(valorBase)} · 1/3: R$ ${fmt(umTerco)}`,
      })
    }
  }

  // ── Créditos extras informados ──
  dados.creditosExtras.forEach((credito, index) => {
    if (credito.valor > 0) {
      verbas.push({
        id: `credito_extra_${index}`,
        nome: credito.descricao || `Crédito Extra ${index + 1}`,
        base: credito.valor,
        formula: 'Informado manualmente',
        valor: credito.valor,
        positivo: true,
        incideFgts: false,
        observacoes: 'Valor informado pelo usuário',
      })
    }
  })

  // ── Descontos extras informados ──
  dados.descontosExtras.forEach((desconto, index) => {
    if (desconto.valor > 0) {
      verbas.push({
        id: `desconto_extra_${index}`,
        nome: desconto.descricao || `Desconto Extra ${index + 1}`,
        base: desconto.valor,
        formula: 'Informado manualmente',
        valor: desconto.valor,
        positivo: false,
        incideFgts: false,
        observacoes: 'Valor informado pelo usuário',
      })
    }
  })

  // ── FGTS estimado sobre verbas ──
  const fgtsEstimadoSobreVerbas = calcularFgtsEstimadoSobreVerbas(verbas)

  // ── Multa FGTS ──
  const { valor: multaFgts, percentual: percentualMultaFgts } = calcularMultaFgts(dados)

  // ── INSS ──
  // A remuneração mensal e o 13º usam bases separadas para fins previdenciários.
  const baseINSSMensal = arredondar(
    verbas
      .filter((v) => v.positivo && v.incideInss && v.id !== '13_proporcional')
      .reduce((acc, v) => acc + v.valor, 0),
  )
  const baseINSS13 = arredondar(
    verbas
      .filter((v) => v.positivo && v.incideInss && v.id === '13_proporcional')
      .reduce((acc, v) => acc + v.valor, 0),
  )
  const inssMensal = calcularINSS(baseINSSMensal)
  const inss13 = calcularINSS(baseINSS13)
  const inss = {
    base: arredondar(baseINSSMensal + baseINSS13),
    valor: arredondar(inssMensal.valor + inss13.valor),
    aliquotaEfetiva: 0,
    detalheFaixas: [...inssMensal.detalheFaixas, ...inss13.detalheFaixas],
  }
  inss.aliquotaEfetiva = inss.base > 0 ? inss.valor / inss.base : 0

  const adicionarDescontoInss = (id: string, nome: string, base: number, valor: number) => {
    if (valor <= 0) return
    verbas.push({
      id,
      nome,
      base,
      formula: `Tabela progressiva sobre R$ ${fmt(base)}`,
      valor,
      positivo: false,
      incideFgts: false,
      incideInss: false,
      incideIrrf: false,
      obrigatoria: false,
      observacoes: 'Tabela progressiva INSS 2026 — estimativa',
    })
  }
  adicionarDescontoInss('desconto_inss', 'INSS sobre remuneração', baseINSSMensal, inssMensal.valor)
  adicionarDescontoInss('desconto_inss_13', 'INSS sobre 13º salário', baseINSS13, inss13.valor)

  // ── IRRF ──
  // O 13º também é tributado exclusivamente na fonte, separado da remuneração mensal.
  const baseIRRFMensal = arredondar(
    verbas
      .filter((v) => v.positivo && v.incideIrrf && v.id !== '13_proporcional')
      .reduce((acc, v) => acc + v.valor, 0),
  )
  const baseIRRF13 = arredondar(
    verbas
      .filter((v) => v.positivo && v.incideIrrf && v.id === '13_proporcional')
      .reduce((acc, v) => acc + v.valor, 0),
  )
  const irrfMensal = calcularIRRF(baseIRRFMensal, inssMensal.valor, dados.dependentesIRRF)
  const irrf13 = calcularIRRF(baseIRRF13, inss13.valor, dados.dependentesIRRF)
  const irrf = {
    base: arredondar(baseIRRFMensal + baseIRRF13),
    baseAposInss: arredondar(irrfMensal.baseAposInss + irrf13.baseAposInss),
    deducaoDependentes: arredondar(irrfMensal.deducaoDependentes + irrf13.deducaoDependentes),
    baseCalculo: arredondar(irrfMensal.baseCalculo + irrf13.baseCalculo),
    valor: arredondar(irrfMensal.valor + irrf13.valor),
    aliquotaEfetiva: 0,
    aliquotaNominal: Math.max(irrfMensal.aliquotaNominal, irrf13.aliquotaNominal),
  }
  irrf.aliquotaEfetiva = irrf.base > 0 ? irrf.valor / irrf.base : 0

  const adicionarDescontoIrrf = (
    id: string,
    nome: string,
    detalhe: ReturnType<typeof calcularIRRF>,
    inssDeduzido: number,
  ) => {
    if (detalhe.valor <= 0) return
    verbas.push({
      id,
      nome,
      base: detalhe.baseCalculo,
      formula: `R$ ${fmt(detalhe.baseCalculo)} × ${(detalhe.aliquotaNominal * 100).toFixed(1)}% − deduções`,
      valor: detalhe.valor,
      positivo: false,
      incideFgts: false,
      incideInss: false,
      incideIrrf: false,
      obrigatoria: false,
      observacoes: `Base: R$ ${fmt(detalhe.base)} · INSS: R$ ${fmt(inssDeduzido)} · dependentes: R$ ${fmt(detalhe.deducaoDependentes)} · aplicada a dedução mais vantajosa — IRRF 2026`,
    })
  }
  adicionarDescontoIrrf('desconto_irrf', 'IRRF sobre remuneração', irrfMensal, inssMensal.valor)
  adicionarDescontoIrrf('desconto_irrf_13', 'IRRF sobre 13º salário', irrf13, inss13.valor)

  // ── Totais ──
  const totalBruto = arredondar(
    verbas.filter((v) => v.positivo).reduce((acc, v) => acc + v.valor, 0),
  )
  const totalDescontos = arredondar(
    verbas.filter((v) => !v.positivo).reduce((acc, v) => acc + v.valor, 0),
  )
  const totalLiquido = arredondar(totalBruto - totalDescontos + multaFgts)

  return {
    dadosContrato: dados,
    tempoServico,
    avisoPrevio,
    verbas,
    fgtsEstimadoSobreVerbas,
    saldoFgtsInformado: dados.saldoFgtsInformado,
    multaFgts,
    percentualMultaFgts,
    inss,
    irrf,
    totalBruto,
    totalDescontos,
    totalLiquido,
    dataCalculo: new Date().toISOString(),
    versaoMotor: VERSAO_MOTOR,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers internos
// ─────────────────────────────────────────────────────────────────────────────

/** Arredonda para 2 casas decimais (evita erros de ponto flutuante) */
function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100
}

/** Formata número como string monetária para uso nas fórmulas */
function fmt(valor: number): string {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
