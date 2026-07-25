import { describe, expect, it } from 'vitest'
import {
  schemaDadosContrato,
  schemaVerbasFgts,
} from '../../../src/domain/rescisao/validacoes'

describe('validação das etapas', () => {
  it('bloqueia a etapa inicial sem os dados obrigatórios', () => {
    const resultado = schemaDadosContrato.safeParse({
      nomeTrabalhador: '',
      dataAdmissao: '',
      dataDesligamento: '2026-07-25',
      ultimoDiaTrabalhado: '2026-07-25',
      salarioBrutoMensal: 0,
    })

    expect(resultado.success).toBe(false)
  })

  it('exige valores quando as opções condicionais estão habilitadas', () => {
    const resultado = schemaVerbasFgts.safeParse({
      temFeriasVencidas: true,
      quantidadePeriodosVencidos: 0,
      teveAdiantamento13: true,
      valorAdiantamento13: 0,
      temMediasVariaveis: true,
      mediaVariavel: 0,
      saldoFgtsInformado: 0,
      percentualMultaFgtsManual: -1,
      diasTrabalhadosNoMes: 10,
      faltas: 11,
      dependentesIRRF: 0,
      descontosExtras: [],
      creditosExtras: [],
      observacoes: '',
    })

    expect(resultado.success).toBe(false)
    if (!resultado.success) {
      expect(resultado.error.issues.map((issue) => issue.path[0])).toEqual(
        expect.arrayContaining([
          'quantidadePeriodosVencidos',
          'valorAdiantamento13',
          'mediaVariavel',
          'faltas',
        ]),
      )
    }
  })
})
