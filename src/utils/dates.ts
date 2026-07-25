/**
 * dates.ts — Utilitários de datas para o sistema de rescisão
 */

import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'

dayjs.locale('pt-br')

/**
 * Formata data ISO (YYYY-MM-DD) para exibição (DD/MM/YYYY)
 */
export function formatDate(isoDate: string): string {
  if (!isoDate) return '—'
  return dayjs(isoDate).format('DD/MM/YYYY')
}

/**
 * Formata data e hora ISO para exibição (DD/MM/YYYY às HH:mm)
 */
export function formatDateTime(isoDate: string): string {
  if (!isoDate) return '—'
  return dayjs(isoDate).format('DD/MM/YYYY [às] HH:mm')
}

/**
 * Converte data no formato DD/MM/YYYY para ISO (YYYY-MM-DD)
 */
export function parseDateBR(dataBR: string): string {
  if (!dataBR || dataBR.length !== 10) return ''
  const [day, month, year] = dataBR.split('/')
  if (!day || !month || !year) return ''
  const iso = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  return dayjs(iso).isValid() ? iso : ''
}

/**
 * Aplica máscara de data enquanto o usuário digita (DD/MM/YYYY)
 */
export function maskDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

/**
 * Valida se uma string ISO é uma data válida
 */
export function isValidDate(isoDate: string): boolean {
  return dayjs(isoDate).isValid()
}

/**
 * Retorna diferença em dias entre duas datas ISO
 */
export function diffDays(start: string, end: string): number {
  return dayjs(end).diff(dayjs(start), 'day')
}

/**
 * Formata tempo de serviço em texto legível
 * Ex: "3 anos, 2 meses e 15 dias"
 */
export function formatTempoServico(anos: number, meses: number, dias: number): string {
  const partes: string[] = []
  if (anos > 0) partes.push(`${anos} ${anos === 1 ? 'ano' : 'anos'}`)
  if (meses > 0) partes.push(`${meses} ${meses === 1 ? 'mês' : 'meses'}`)
  if (dias > 0) partes.push(`${dias} ${dias === 1 ? 'dia' : 'dias'}`)
  if (partes.length === 0) return 'Menos de 1 dia'
  if (partes.length === 1) return partes[0]
  if (partes.length === 2) return partes.join(' e ')
  return `${partes.slice(0, -1).join(', ')} e ${partes[partes.length - 1]}`
}

/**
 * Retorna a data atual no formato ISO (YYYY-MM-DD)
 */
export function today(): string {
  return dayjs().format('YYYY-MM-DD')
}
