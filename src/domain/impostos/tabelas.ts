/**
 * tabelas.ts — Tabelas e cálculo de INSS e IRRF para rescisão CLT
 *
 * Referências:
 * - INSS: Portaria Interministerial MPS/MF 13/2026
 * - IRRF: Lei 15.270/2025 — tabela vigente a partir de janeiro/2026
 *
 * IMPORTANTE: Os valores abaixo são estimativas. As alíquotas e faixas
 * são atualizadas periodicamente pelo governo federal. Verifique sempre
 * a tabela vigente na data do pagamento.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

export interface FaixaINSS {
  /** Limite superior da faixa (null = sem limite / teto) */
  ate: number | null
  aliquota: number
}

export interface FaixaIRRF {
  /** Limite superior da faixa (null = sem limite) */
  ate: number | null
  aliquota: number
  /** Parcela a deduzir (simplifica o cálculo progressivo) */
  parcelaADeduzir: number
}

export interface ResultadoINSS {
  base: number
  valor: number
  aliquotaEfetiva: number
  /** Detalhamento por faixa */
  detalheFaixas: Array<{ faixa: number; base: number; aliquota: number; valor: number }>
}

export interface ResultadoIRRF {
  base: number
  baseAposInss: number
  deducaoDependentes: number
  baseCalculo: number
  valor: number
  aliquotaEfetiva: number
  aliquotaNominal: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Tabela INSS 2026 (progressiva — Portaria Interministerial MPS/MF 13/2026)
//
// Faixa 1: até R$ 1.518,00  → 7,5%
// Faixa 2: R$ 1.518,01 a R$ 2.793,88 → 9%
// Faixa 3: R$ 2.793,89 a R$ 4.190,83 → 12%
// Faixa 4: R$ 4.190,84 a R$ 8.157,41 → 14%
// Teto máximo: R$ 908,86
// ─────────────────────────────────────────────────────────────────────────────

export const TABELA_INSS_2026: FaixaINSS[] = [
  { ate: 1621.00,  aliquota: 0.075 },
  { ate: 2902.84,  aliquota: 0.09  },
  { ate: 4354.27,  aliquota: 0.12  },
  { ate: 8475.55,  aliquota: 0.14  },
  { ate: null,     aliquota: 0.14  }, // acima do teto: alíquota máxima, mas valor limitado
]

/** Teto máximo de contribuição INSS 2026 */
export const TETO_INSS_2026 = 988.09

/** Teto salarial INSS 2026 (contribui sobre até este valor) */
export const TETO_SALARIO_INSS_2026 = 8475.55

// ─────────────────────────────────────────────────────────────────────────────
// Tabela IRRF 2026 (Lei 15.270/2025)
//
// Até R$ 2.259,20          → isento (0%)
// R$ 2.259,21 a R$ 2.826,65 → 7,5%  — parcela a deduzir: R$ 169,44
// R$ 2.826,66 a R$ 3.751,05 → 15%   — parcela a deduzir: R$ 381,44
// R$ 3.751,06 a R$ 4.664,68 → 22,5% — parcela a deduzir: R$ 662,77
// Acima de R$ 4.664,68      → 27,5% — parcela a deduzir: R$ 896,00
// ─────────────────────────────────────────────────────────────────────────────

export const TABELA_IRRF_2026: FaixaIRRF[] = [
  { ate: 2428.80,  aliquota: 0,      parcelaADeduzir: 0      },
  { ate: 2826.65,  aliquota: 0.075,  parcelaADeduzir: 182.16 },
  { ate: 3751.05,  aliquota: 0.15,   parcelaADeduzir: 394.16 },
  { ate: 4664.68,  aliquota: 0.225,  parcelaADeduzir: 675.49 },
  { ate: null,     aliquota: 0.275,  parcelaADeduzir: 908.73 },
]

/** Dedução IRRF por dependente em 2026 */
export const DEDUCAO_POR_DEPENDENTE_IRRF = 189.59

/** Desconto simplificado mensal, usado quando mais vantajoso que as deduções legais */
export const DESCONTO_SIMPLIFICADO_MENSAL_IRRF_2026 = 607.20

// ─────────────────────────────────────────────────────────────────────────────
// Funções de cálculo
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcula INSS pelo método progressivo (por faixas, como IR de pessoa física).
 * A partir de Nov/2019, o INSS passou a ser progressivo (não mais alíquota única).
 *
 * @param base - Salário/remuneração bruta sujeita ao INSS
 */
export function calcularINSS(base: number): ResultadoINSS {
  if (base <= 0) {
    return { base: 0, valor: 0, aliquotaEfetiva: 0, detalheFaixas: [] }
  }

  const baseEfetiva = Math.min(base, TETO_SALARIO_INSS_2026)
  const detalheFaixas: ResultadoINSS['detalheFaixas'] = []
  let inssTotal = 0
  let faixaAnterior = 0

  for (const faixa of TABELA_INSS_2026) {
    if (baseEfetiva <= faixaAnterior) break

    const limiteAtual = faixa.ate !== null ? Math.min(faixa.ate, baseEfetiva) : baseEfetiva
    const baseFaixa = limiteAtual - faixaAnterior
    const valorFaixa = arredondar(baseFaixa * faixa.aliquota)

    if (baseFaixa > 0) {
      detalheFaixas.push({
        faixa: faixaAnterior,
        base: baseFaixa,
        aliquota: faixa.aliquota,
        valor: valorFaixa,
      })
      inssTotal += valorFaixa
    }

    faixaAnterior = faixa.ate !== null ? faixa.ate : baseEfetiva
    if (faixa.ate === null || baseEfetiva <= faixa.ate) break
  }

  const valorFinal = arredondar(Math.min(inssTotal, TETO_INSS_2026))
  const aliquotaEfetiva = base > 0 ? valorFinal / base : 0

  return {
    base,
    valor: valorFinal,
    aliquotaEfetiva,
    detalheFaixas,
  }
}

/**
 * Calcula IRRF usando o método da parcela a deduzir (mais simples que o progressivo integral).
 * Fórmula: (base × alíquota) − parcela_a_deduzir − deduções
 *
 * @param base          - Base de cálculo bruta (verbas tributáveis)
 * @param inss          - Valor do INSS a deduzir da base
 * @param dependentes   - Quantidade de dependentes (dedução R$ 189,59 cada)
 */
export function calcularIRRF(
  base: number,
  inss: number,
  dependentes: number,
): ResultadoIRRF {
  if (base <= 0) {
    return {
      base: 0,
      baseAposInss: 0,
      deducaoDependentes: 0,
      baseCalculo: 0,
      valor: 0,
      aliquotaEfetiva: 0,
      aliquotaNominal: 0,
    }
  }

  const deducaoDependentes = arredondar(dependentes * DEDUCAO_POR_DEPENDENTE_IRRF)
  const baseAposInss = arredondar(base - inss)
  const deducoesLegais = inss + deducaoDependentes
  const deducaoAplicada = Math.max(
    deducoesLegais,
    DESCONTO_SIMPLIFICADO_MENSAL_IRRF_2026,
  )
  const baseCalculo = arredondar(Math.max(0, base - deducaoAplicada))

  // Encontra a faixa aplicável
  const faixaAplicavel = TABELA_IRRF_2026.find(
    (f) => f.ate === null || baseCalculo <= f.ate,
  ) ?? TABELA_IRRF_2026[TABELA_IRRF_2026.length - 1]

  const impostoTabela = arredondar(
    Math.max(0, baseCalculo * faixaAplicavel.aliquota - faixaAplicavel.parcelaADeduzir),
  )
  const reducao =
    base <= 5000
      ? Math.min(impostoTabela, 312.89)
      : base <= 7350
        ? Math.max(0, 978.62 - 0.133145 * base)
        : 0
  const irrf = arredondar(Math.max(0, impostoTabela - reducao))

  return {
    base,
    baseAposInss,
    deducaoDependentes,
    baseCalculo,
    valor: irrf,
    aliquotaEfetiva: base > 0 ? irrf / base : 0,
    aliquotaNominal: faixaAplicavel.aliquota,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────────────────────

function arredondar(valor: number): number {
  return Math.round((valor + 1e-9) * 100) / 100
}
