/**
 * validacoes.ts — Schemas Zod para validação dos formulários de rescisão
 * Compatível com Zod v4
 */

import { z } from 'zod'
import { TipoRescisao, TipoAvisoPrevio } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const dataISO = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use YYYY-MM-DD)')

const valorPositivo = z
  .number()
  .min(0, 'Valor não pode ser negativo')

// ─────────────────────────────────────────────────────────────────────────────
// Etapa 1 — Dados do contrato
// ─────────────────────────────────────────────────────────────────────────────

export const schemaDadosContrato = z.object({
  nomeTrabalhador: z
    .string()
    .min(3, 'Nome deve ter ao menos 3 caracteres')
    .max(150, 'Nome muito longo'),
  cargo: z.string().max(100).optional(),
  empresa: z.string().max(150).optional(),
  cnpj: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(val),
      'CNPJ inválido (use XX.XXX.XXX/XXXX-XX)',
    ),
  sindicato: z.string().max(150).optional(),
  dataAdmissao: dataISO,
  dataDesligamento: dataISO,
  ultimoDiaTrabalhado: dataISO,
  salarioBrutoMensal: z
    .number()
    .positive('Salário deve ser positivo'),
}).refine(
  (data) => new Date(data.dataDesligamento) > new Date(data.dataAdmissao),
  {
    message: 'Data de desligamento deve ser após a admissão',
    path: ['dataDesligamento'],
  },
).refine(
  (data) => new Date(data.ultimoDiaTrabalhado) <= new Date(data.dataDesligamento),
  {
    message: 'Último dia trabalhado não pode ser após o desligamento',
    path: ['ultimoDiaTrabalhado'],
  },
)

// ─────────────────────────────────────────────────────────────────────────────
// Etapa 2 — Tipo de desligamento
// ─────────────────────────────────────────────────────────────────────────────

export const schemaTipoDesligamento = z.object({
  tipoRescisao: z.enum([
    TipoRescisao.SEM_JUSTA_CAUSA,
    TipoRescisao.PEDIDO_DEMISSAO,
    TipoRescisao.ACORDO,
    TipoRescisao.TERMINO_EXPERIENCIA,
    TipoRescisao.JUSTA_CAUSA,
    TipoRescisao.RESCISAO_ANTECIPADA,
  ]),
  tipoAvisoPrevio: z.enum([
    TipoAvisoPrevio.TRABALHADO,
    TipoAvisoPrevio.INDENIZADO_EMPREGADOR,
    TipoAvisoPrevio.NAO_CUMPRIDO_EMPREGADO,
    TipoAvisoPrevio.DISPENSADO,
    TipoAvisoPrevio.NAO_SE_APLICA,
  ]),
})

// ─────────────────────────────────────────────────────────────────────────────
// Etapa 3 — Verbas e FGTS
// ─────────────────────────────────────────────────────────────────────────────

export const schemaCreditoDesconto = z.object({
  descricao: z.string().max(100, 'Descrição muito longa'),
  valor: valorPositivo,
})

export const schemaVerbasFgts = z.object({
  temFeriasVencidas: z.boolean(),
  quantidadePeriodosVencidos: z
    .number()
    .int()
    .min(0, 'Deve ser 0 ou mais'),
  teveAdiantamento13: z.boolean(),
  valorAdiantamento13: valorPositivo,
  temMediasVariaveis: z.boolean(),
  mediaVariavel: valorPositivo,
  saldoFgtsInformado: valorPositivo,
  percentualMultaFgtsManual: z.number().min(-1).max(1),
  diasTrabalhadosNoMes: z.number().int().min(1).max(31).nullable(),
  faltas: z.number().int().min(0),
  dependentesIRRF: z.number().int().min(0).max(10),
  descontosExtras: z.array(schemaCreditoDesconto),
  creditosExtras: z.array(schemaCreditoDesconto),
  observacoes: z.string().max(1000).optional(),
})

// ─────────────────────────────────────────────────────────────────────────────
// Schema completo (todas as etapas)
// ─────────────────────────────────────────────────────────────────────────────

export const schemaDadosContratoCompleto = schemaDadosContrato
  .and(schemaTipoDesligamento)
  .and(schemaVerbasFgts)

export type DadosContratoForm = z.infer<typeof schemaDadosContratoCompleto>
