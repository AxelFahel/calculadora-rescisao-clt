/**
 * regras.ts — Constantes e regras-base do cálculo de rescisão CLT
 *
 * Fontes:
 * - CLT (Consolidação das Leis do Trabalho), Arts. 477-487
 * - Lei 8.036/1990 (FGTS)
 * - Lei 12.506/2011 (aviso prévio proporcional)
 * - FGTS Digital: recolhimentos rescisórios a partir de 01/03/2024
 */

import { TipoRescisao, TipoAvisoPrevio } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// FGTS
// ─────────────────────────────────────────────────────────────────────────────

/** Alíquota mensal de depósito FGTS (Art. 15, Lei 8.036/1990) */
export const PERCENTUAL_FGTS = 0.08

/** Multa FGTS na demissão sem justa causa (Art. 18, §1º, Lei 8.036/1990) */
export const PERCENTUAL_MULTA_SEM_JUSTA_CAUSA = 0.40

/** Multa FGTS no acordo empregado/empregador (Art. 484-A CLT) */
export const PERCENTUAL_MULTA_ACORDO = 0.20

/** Multa FGTS na rescisão antecipada de contrato a termo pelo empregador */
export const PERCENTUAL_MULTA_RESCISAO_ANTECIPADA = 0.40

/** Multa FGTS quando não há incidência (justa causa, pedido de demissão) */
export const PERCENTUAL_MULTA_ZERO = 0.00

// ─────────────────────────────────────────────────────────────────────────────
// Aviso prévio (Lei 12.506/2011)
// ─────────────────────────────────────────────────────────────────────────────

/** Dias base do aviso prévio */
export const AVISO_BASE_DIAS = 30

/** Dias acrescidos por ano completo de serviço */
export const AVISO_INCREMENTO_DIAS_POR_ANO = 3

/** Limite máximo do aviso proporcional */
export const AVISO_MAXIMO_DIAS = 90

// ─────────────────────────────────────────────────────────────────────────────
// Calendário
// ─────────────────────────────────────────────────────────────────────────────

export const MESES_ANO = 12

/** Divisor padrão para cálculo de diária (CLT, Art. 64) */
export const DIVISOR_SALARIO_MENSAL = 30

/** Mínimo de dias no mês para contar como mês cheio (férias e 13º) */
export const DIAS_MINIMOS_MES_CHEIO = 15

// ─────────────────────────────────────────────────────────────────────────────
// Versão do motor
// ─────────────────────────────────────────────────────────────────────────────

export const VERSAO_MOTOR = '1.0.0'

// ─────────────────────────────────────────────────────────────────────────────
// Regras por tipo de rescisão
// ─────────────────────────────────────────────────────────────────────────────

interface RegrasRescisao {
  /** Percentual padrão da multa FGTS */
  percentualMultaFgts: number
  /** Tem direito a saldo de salário */
  temSaldoSalario: boolean
  /** Tem direito a aviso prévio */
  temAvisoPrevio: boolean
  /** Tem direito a 13º proporcional */
  tem13Proporcional: boolean
  /** Tem direito a férias proporcionais + 1/3 */
  temFeriasProporcionais: boolean
  /** Tem direito a férias vencidas + 1/3 */
  temFeriasVencidas: boolean
  /** Aviso pode ser descontado (quando empregado não cumpre) */
  podeTerDescontoAviso: boolean
  /** Descrição dos direitos */
  descricao: string
}

export const REGRAS_POR_RESCISAO: Record<TipoRescisao, RegrasRescisao> = {
  [TipoRescisao.SEM_JUSTA_CAUSA]: {
    percentualMultaFgts: PERCENTUAL_MULTA_SEM_JUSTA_CAUSA,
    temSaldoSalario: true,
    temAvisoPrevio: true,
    tem13Proporcional: true,
    temFeriasProporcionais: true,
    temFeriasVencidas: true,
    podeTerDescontoAviso: false,
    descricao: 'Demissão sem justa causa pelo empregador',
  },
  [TipoRescisao.PEDIDO_DEMISSAO]: {
    percentualMultaFgts: PERCENTUAL_MULTA_ZERO,
    temSaldoSalario: true,
    temAvisoPrevio: true,
    tem13Proporcional: true,
    temFeriasProporcionais: true,
    temFeriasVencidas: true,
    podeTerDescontoAviso: true,
    descricao: 'Pedido de demissão pelo empregado',
  },
  [TipoRescisao.ACORDO]: {
    percentualMultaFgts: PERCENTUAL_MULTA_ACORDO,
    temSaldoSalario: true,
    temAvisoPrevio: true,
    tem13Proporcional: true,
    temFeriasProporcionais: true,
    temFeriasVencidas: true,
    podeTerDescontoAviso: false,
    descricao: 'Rescisão por acordo entre empregado e empregador (Art. 484-A CLT)',
  },
  [TipoRescisao.TERMINO_EXPERIENCIA]: {
    percentualMultaFgts: PERCENTUAL_MULTA_ZERO,
    temSaldoSalario: true,
    temAvisoPrevio: false,
    tem13Proporcional: true,
    temFeriasProporcionais: true,
    temFeriasVencidas: true,
    podeTerDescontoAviso: false,
    descricao: 'Término natural do contrato de experiência',
  },
  [TipoRescisao.JUSTA_CAUSA]: {
    percentualMultaFgts: PERCENTUAL_MULTA_ZERO,
    temSaldoSalario: true,
    temAvisoPrevio: false,
    tem13Proporcional: false,
    temFeriasProporcionais: false,
    temFeriasVencidas: true,
    podeTerDescontoAviso: false,
    descricao: 'Rescisão por justa causa do empregado (Art. 482 CLT)',
  },
  [TipoRescisao.RESCISAO_ANTECIPADA]: {
    percentualMultaFgts: PERCENTUAL_MULTA_RESCISAO_ANTECIPADA,
    temSaldoSalario: true,
    temAvisoPrevio: true,
    tem13Proporcional: true,
    temFeriasProporcionais: true,
    temFeriasVencidas: true,
    podeTerDescontoAviso: false,
    descricao: 'Rescisão antecipada de contrato por prazo determinado',
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Regras de aviso por tipo
// ─────────────────────────────────────────────────────────────────────────────

export const AVISO_INTEGRA_PERIODO: Record<TipoAvisoPrevio, boolean> = {
  [TipoAvisoPrevio.TRABALHADO]: false,        // já foi trabalhado
  [TipoAvisoPrevio.INDENIZADO_EMPREGADOR]: true,  // projeta data e integra
  [TipoAvisoPrevio.NAO_CUMPRIDO_EMPREGADO]: false, // desconto, não projeta
  [TipoAvisoPrevio.DISPENSADO]: false,
  [TipoAvisoPrevio.NAO_SE_APLICA]: false,
}

// ─────────────────────────────────────────────────────────────────────────────
// Upload de documentos
// ─────────────────────────────────────────────────────────────────────────────

/** Tipos MIME aceitos para upload */
export const MIME_TYPES_ACEITOS = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]

/** Tamanho máximo de arquivo em bytes (10 MB) */
export const TAMANHO_MAXIMO_ARQUIVO = 10 * 1024 * 1024
