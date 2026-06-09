import type { SpellMatch } from '../types'

const LT_API = 'https://api.languagetool.org/v2/check'
const CHUNK_SIZE = 15000 // safely under LT free-tier limit (~20 000 chars)

function splitIntoChunks(text: string): Array<{ text: string; offset: number }> {
  const chunks: Array<{ text: string; offset: number }> = []
  let start = 0

  while (start < text.length) {
    if (start + CHUNK_SIZE >= text.length) {
      chunks.push({ text: text.slice(start), offset: start })
      break
    }

    // Prefer splitting at a newline or space to avoid cutting mid-word
    let end = start + CHUNK_SIZE
    const nl = text.lastIndexOf('\n', end)
    if (nl > start + CHUNK_SIZE / 2) {
      end = nl + 1
    } else {
      const sp = text.lastIndexOf(' ', end)
      if (sp > start + CHUNK_SIZE / 2) end = sp + 1
    }

    chunks.push({ text: text.slice(start, end), offset: start })
    start = end
  }

  return chunks
}

async function checkChunk(chunkText: string): Promise<SpellMatch[]> {
  const body = new URLSearchParams({
    text: chunkText,
    language: 'es',
    enabledOnly: 'false',
  })

  const res = await fetch(LT_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    signal: AbortSignal.timeout(60000),
  })

  if (!res.ok) throw new Error('Error al conectar con el corrector ortográfico')

  const data = await res.json()

  return (data.matches ?? []).map((m: Record<string, unknown>) => ({
    offset: m.offset as number,
    length: m.length as number,
    message: m.message as string,
    shortMessage: (m.shortMessage as string) || (m.message as string),
    replacements: ((m.replacements as Array<{ value: string }>) ?? [])
      .slice(0, 5)
      .map((r) => r.value),
    rule: {
      id: (m.rule as { id: string }).id,
      description: (m.rule as { description: string }).description,
    },
  }))
}

export async function checkSpelling(
  text: string,
  onProgress?: (pct: number) => void,
): Promise<SpellMatch[]> {
  const chunks = splitIntoChunks(text)
  const allMatches: SpellMatch[] = []

  for (let i = 0; i < chunks.length; i++) {
    const { text: chunkText, offset } = chunks[i]
    const matches = await checkChunk(chunkText)

    for (const m of matches) {
      allMatches.push({ ...m, offset: m.offset + offset })
    }

    onProgress?.(Math.round(((i + 1) / chunks.length) * 100))
  }

  return allMatches
}

export function applyCorrection(text: string, match: SpellMatch, replacement: string): string {
  return text.slice(0, match.offset) + replacement + text.slice(match.offset + match.length)
}

export function buildCorrectedText(text: string, accepted: Map<number, string>): string {
  let result = text
  let offset = 0
  const sorted = [...accepted.entries()].sort((a, b) => a[0] - b[0])

  for (const [origOffset, replacement] of sorted) {
    const adjustedOffset = origOffset + offset
    const match = result.slice(adjustedOffset)
    const wordEnd = match.search(/\s|$/)
    const oldWord = match.slice(0, wordEnd === -1 ? match.length : wordEnd)
    result = result.slice(0, adjustedOffset) + replacement + result.slice(adjustedOffset + oldWord.length)
    offset += replacement.length - oldWord.length
  }
  return result
}
