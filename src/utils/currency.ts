/**
 * currency.ts — Utilitários de formatação e parse de moeda (BRL)
 */

/**
 * Formata um número como moeda brasileira (R$ 1.234,56)
 */
export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Formata como moeda sem o símbolo "R$" (1.234,56)
 */
export function formatCurrencyNoSymbol(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Converte string de moeda BRL ("1.234,56" ou "R$ 1.234,56") para número
 */
export function parseCurrency(value: string): number {
  if (!value) return 0
  const cleaned = value
    .replace(/[R$\s]/g, '')  // Remove R$, espaços
    .replace(/\./g, '')       // Remove separadores de milhar
    .replace(',', '.')        // Converte decimal
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Aplica máscara de moeda enquanto o usuário digita
 * Ex: "12345" → "123,45"
 */
export function maskCurrency(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  const num = parseInt(digits, 10) / 100
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Formata percentual (0.40 → "40,00%")
 */
export function formatPercent(value: number): string {
  return `${(value * 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}%`
}
