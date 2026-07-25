import { describe, expect, it } from 'vitest'
import {
  calcularINSS,
  calcularIRRF,
  TETO_INSS_2026,
} from '../../../src/domain/impostos/tabelas'

describe('tabelas de impostos de 2026', () => {
  it('calcula o INSS progressivo na primeira faixa', () => {
    expect(calcularINSS(1621).valor).toBe(121.58)
  })

  it('limita o INSS ao teto de contribuição', () => {
    expect(calcularINSS(20_000).valor).toBe(TETO_INSS_2026)
  })

  it('zera o IRRF para rendimentos de até R$ 5 mil após a redução', () => {
    expect(calcularIRRF(5000, 0, 0).valor).toBe(0)
  })

  it('aplica a redução decrescente do IRRF entre R$ 5 mil e R$ 7.350', () => {
    expect(calcularIRRF(6000, 0, 0).valor).toBeCloseTo(394.54, 2)
  })
})
