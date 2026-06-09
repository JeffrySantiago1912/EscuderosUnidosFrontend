export interface SpellMatch {
  offset: number
  length: number
  message: string
  shortMessage: string
  replacements: string[]
  rule: { id: string; description: string }
}

export interface SpellCheckResult {
  originalText: string
  matches: SpellMatch[]
}

export type InputMode = 'text' | 'pdf' | 'image' | 'txt'
