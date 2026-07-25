/**
 * files.ts — Utilitários para upload e validação de arquivos
 *
 * PRIVACIDADE: arquivos são processados 100% no cliente.
 * Nenhum documento é enviado a servidores externos.
 */

import { MIME_TYPES_ACEITOS, TAMANHO_MAXIMO_ARQUIVO } from '../domain/rescisao/regras'

export interface FileValidationResult {
  valid: boolean
  error?: string
}

/**
 * Valida tipo MIME e tamanho do arquivo
 */
export function validateFile(file: File): FileValidationResult {
  if (!MIME_TYPES_ACEITOS.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de arquivo não suportado. Aceitos: PDF, JPG, PNG, WEBP.`,
    }
  }

  if (file.size > TAMANHO_MAXIMO_ARQUIVO) {
    const maxMb = TAMANHO_MAXIMO_ARQUIVO / (1024 * 1024)
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${maxMb} MB.`,
    }
  }

  return { valid: true }
}

/**
 * Remove caracteres potencialmente perigosos do nome do arquivo
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._\-\s\u00C0-\u017E]/g, '_') // permite acentos
    .replace(/\s+/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 200)
}

/**
 * Converte File para Data URL (para preview de imagens)
 * Retorna null para PDFs
 */
export function toDataUrl(file: File): Promise<string | null> {
  return new Promise((resolve, reject) => {
    if (file.type === 'application/pdf') {
      resolve(null) // PDFs não têm preview inline
      return
    }

    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Falha ao ler arquivo'))
    reader.readAsDataURL(file)
  })
}

/**
 * Formata tamanho de arquivo para exibição legível
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/**
 * Retorna ícone (emoji) baseado no tipo MIME
 */
export function getFileIcon(mimeType: string): string {
  if (mimeType === 'application/pdf') return '📄'
  if (mimeType.startsWith('image/')) return '🖼️'
  return '📎'
}

/**
 * Gera ID único para documento
 */
export function generateDocumentId(): string {
  return `doc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}
