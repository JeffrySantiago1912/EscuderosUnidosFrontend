import type { SpellMatch } from '../types'

const LT_API = 'https://api.languagetool.org/v2/check'

export async function checkSpelling(text: string): Promise<SpellMatch[]> {
  const body = new URLSearchParams({
    text,
    language: 'es',
    enabledOnly: 'false',
  })

  const res = await fetch(LT_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
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
