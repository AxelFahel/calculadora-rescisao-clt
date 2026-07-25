/**
 * types.ts — Tipos centrais do domínio de rescisão CLT
 * Calculadora de Rescisão CLT
 */

// ─────────────────────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────────────────────

export const TipoRescisao = {
  SEM_JUSTA_CAUSA: 'SEM_JUSTA_CAUSA',
  PEDIDO_DEMISSAO: 'PEDIDO_DEMISSAO',
  ACORDO: 'ACORDO',
  TERMINO_EXPERIENCIA: 'TERMINO_EXPERIENCIA',
  JUSTA_CAUSA: 'JUSTA_CAUSA',
  RESCISAO_ANTECIPADA: 'RESCISAO_ANTECIPADA',
} as const
export type TipoRescisao = typeof TipoRescisao[keyof typeof TipoRescisao]

export const TipoAvisoPrevio = {
  TRABALHADO: 'TRABALHADO',
  INDENIZADO_EMPREGADOR: 'INDENIZADO_EMPREGADOR',
  NAO_CUMPRIDO_EMPREGADO: 'NAO_CUMPRIDO_EMPREGADO',
  DISPENSADO: 'DISPENSADO',
  NAO_SE_APLICA: 'NAO_SE_APLICA',
} as const
export type TipoAvisoPrevio = typeof TipoAvisoPrevio[keyof typeof TipoAvisoPrevio]

export const StatusDocumento = {
  PENDENTE: 'PENDENTE',
  VALIDADO: 'VALIDADO',
  ERRO: 'ERRO',
} as const
export type StatusDocumento = typeof StatusDocumento[keyof typeof StatusDocumento]

// ─────────────────────────────────────────────────────────────────────────────
// Estruturas de dados
// ─────────────────────────────────────────────────────────────────────────────

/** Informações do tempo de serviço calculado */
export interface TempoServico {
  anos: number
  meses: number
  dias: number
  totalDias: number
  anosCompletos: number
}

/** Informações do aviso prévio calculado */
export interface InfoAvisoPrevio {
  diasBase: number
  diasPorAnosServico: number
  totalDias: number
  tipo: TipoAvisoPrevio
  valorIndenizado: number
  /** Data projetada de término quando indenizado */
  dataProjecaoTermino: string | null
}

/** Uma verba (crédito ou débito) da rescisão */
export interface VerbaRescisoria {
  id: string
  nome: string
  /** Valor base sobre o qual a fórmula é aplicada */
  base: number
  /** Descrição textual da fórmula utilizada */
  formula: string
  valor: number
  /** true = crédito ao trabalhador; false = desconto */
  positivo: boolean
  observacoes?: string
  /** Indica se incide FGTS sobre esta verba */
  incideFgts?: boolean
  /** Indica se incide INSS sobre esta verba */
  incideInss?: boolean
  /** Indica se incide IRRF sobre esta verba */
  incideIrrf?: boolean
  /** Indica se esta verba é obrigatória (não pode ser removida) */
  obrigatoria?: boolean
}

/** Dados completos informados pelo usuário */
export interface DadosContrato {
  // ── Dados do trabalhador ──
  nomeTrabalhador: string
  cargo?: string
  empresa?: string
  cnpj?: string
  sindicato?: string

  // ── Datas do contrato ──
  dataAdmissao: string // ISO date: YYYY-MM-DD
  dataDesligamento: string // ISO date: YYYY-MM-DD
  ultimoDiaTrabalhado: string // ISO date: YYYY-MM-DD

  // ── Remuneração ──
  salarioBrutoMensal: number
  /** Médias de horas extras, comissões, adicionais etc. */
  mediaVariavel: number
  temMediasVariaveis: boolean

  // ── Rescisão ──
  tipoRescisao: TipoRescisao
  tipoAvisoPrevio: TipoAvisoPrevio

  // ── Férias ──
  temFeriasVencidas: boolean
  quantidadePeriodosVencidos: number

  // ── 13º salário ──
  teveAdiantamento13: boolean
  valorAdiantamento13: number

  // ── FGTS ──
  /** Saldo real informado pelo trabalhador a partir do extrato */
  saldoFgtsInformado: number
  /** Percentual da multa (sobrescreve o padrão quando diferente de -1) */
  percentualMultaFgtsManual: number // -1 = usar padrão

  // ── Dias trabalhados no mês ──
  diasTrabalhadosNoMes: number | null // null = calcular automaticamente

  // ── Descontos e créditos extras ──
  faltas: number
  dependentesIRRF: number
  descontosExtras: Array<{ descricao: string; valor: number }>
  creditosExtras: Array<{ descricao: string; valor: number }>

  // ── Opcionais ──
  dataBaseCategoria?: string
  observacoes?: string
}

/** Detalhamento de INSS calculado */
export interface DetalheINSS {
  base: number
  valor: number
  aliquotaEfetiva: number
  detalheFaixas: Array<{ faixa: number; base: number; aliquota: number; valor: number }>
}

/** Detalhamento de IRRF calculado */
export interface DetalheIRRF {
  base: number
  baseAposInss: number
  deducaoDependentes: number
  baseCalculo: number
  valor: number
  aliquotaEfetiva: number
  aliquotaNominal: number
}

/** Resultado completo do cálculo da rescisão */
export interface ResultadoRescisao {
  dadosContrato: DadosContrato
  tempoServico: TempoServico
  avisoPrevio: InfoAvisoPrevio
  verbas: VerbaRescisoria[]
  fgtsEstimadoSobreVerbas: number
  saldoFgtsInformado: number
  multaFgts: number
  percentualMultaFgts: number
  inss: DetalheINSS
  irrf: DetalheIRRF
  totalBruto: number
  totalDescontos: number
  /** Valor estimado pago diretamente no acerto rescisório */
  totalLiquido: number
  /** Soma informativa do pagamento direto com a multa do FGTS */
  totalComFgts?: number
  dataCalculo: string // ISO datetime
  /** Versão do motor de cálculo */
  versaoMotor: string
}

/** Documento enviado pelo usuário */
export interface DocumentoUpload {
  id: string
  nome: string
  nomeSanitizado: string
  tipo: string // MIME type
  tamanho: number
  /** Data URL para preview (apenas imagens) */
  dataUrl?: string
  status: StatusDocumento
  categoria: CategoriaDocumento
  /** Dados extraídos manualmente ou via OCR futuro */
  dadosExtraidos?: Partial<DadosContrato>
  erroMensagem?: string
  dataUpload: string // ISO datetime
}

export const CategoriaDocumento = {
  CARTEIRA_TRABALHO: 'CARTEIRA_TRABALHO',
  EXTRATO_FGTS: 'EXTRATO_FGTS',
  TERMO_RESCISAO: 'TERMO_RESCISAO',
  HOLERITE: 'HOLERITE',
  CONTRATO_TRABALHO: 'CONTRATO_TRABALHO',
  OUTRO: 'OUTRO',
} as const
export type CategoriaDocumento = typeof CategoriaDocumento[keyof typeof CategoriaDocumento]

/** Item salvo no histórico */
export interface HistoricoItem {
  id: string
  nomeTrabalhador: string
  empresa?: string
  tipoRescisao: TipoRescisao
  dataCalculo: string
  totalLiquido: number
  resultado: ResultadoRescisao
}

/** Labels amigáveis para os enums */
export const LABELS_TIPO_RESCISAO: Record<TipoRescisao, string> = {
  [TipoRescisao.SEM_JUSTA_CAUSA]: 'Demissão sem justa causa',
  [TipoRescisao.PEDIDO_DEMISSAO]: 'Pedido de demissão',
  [TipoRescisao.ACORDO]: 'Acordo entre empregado e empregador',
  [TipoRescisao.TERMINO_EXPERIENCIA]: 'Término de contrato de experiência',
  [TipoRescisao.JUSTA_CAUSA]: 'Rescisão por justa causa',
  [TipoRescisao.RESCISAO_ANTECIPADA]: 'Rescisão antecipada de contrato determinado',
}

export const LABELS_TIPO_AVISO: Record<TipoAvisoPrevio, string> = {
  [TipoAvisoPrevio.TRABALHADO]: 'Aviso trabalhado',
  [TipoAvisoPrevio.INDENIZADO_EMPREGADOR]: 'Indenizado pelo empregador',
  [TipoAvisoPrevio.NAO_CUMPRIDO_EMPREGADO]: 'Não cumprido pelo empregado',
  [TipoAvisoPrevio.DISPENSADO]: 'Dispensado pelo empregador',
  [TipoAvisoPrevio.NAO_SE_APLICA]: 'Não se aplica',
}

export const LABELS_CATEGORIA_DOCUMENTO: Record<CategoriaDocumento, string> = {
  [CategoriaDocumento.CARTEIRA_TRABALHO]: 'Carteira de Trabalho',
  [CategoriaDocumento.EXTRATO_FGTS]: 'Extrato do FGTS',
  [CategoriaDocumento.TERMO_RESCISAO]: 'Termo de Rescisão',
  [CategoriaDocumento.HOLERITE]: 'Holerite',
  [CategoriaDocumento.CONTRATO_TRABALHO]: 'Contrato de Trabalho',
  [CategoriaDocumento.OUTRO]: 'Outro Documento',
}
