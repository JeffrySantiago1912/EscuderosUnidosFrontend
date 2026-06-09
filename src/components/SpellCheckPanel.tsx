import { useState } from 'react'
import { CheckCircle2, ChevronDown, ChevronUp, Sparkles, X } from 'lucide-react'
import type { SpellMatch } from '../types'
import { applyCorrection } from '../utils/languageTool'

interface Props {
  text: string
  matches: SpellMatch[]
  onTextChange: (t: string) => void
  onMatchesChange: (m: SpellMatch[]) => void
}

export default function SpellCheckPanel({ text, matches, onTextChange, onMatchesChange }: Props) {
  const [expanded, setExpanded] = useState<number | null>(0)

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <div className="p-4 rounded-2xl bg-green-100">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-800">¡Sin errores encontrados!</p>
          <p className="text-sm text-gray-400 mt-1">El texto no presenta faltas ortográficas.</p>
        </div>
      </div>
    )
  }

  const accept = (match: SpellMatch, replacement: string) => {
    const newText = applyCorrection(text, match, replacement)
    onTextChange(newText)
    const removed = onMatchesChange(
      matches
        .filter((m) => m !== match)
        .map((m) => {
          const delta = replacement.length - match.length
          if (m.offset > match.offset) return { ...m, offset: m.offset + delta }
          return m
        }),
    )
    if (expanded !== null && expanded >= matches.length - 1) setExpanded(Math.max(0, matches.length - 2))
    return removed
  }

  const dismiss = (match: SpellMatch) => {
    onMatchesChange(matches.filter((m) => m !== match))
    if (expanded !== null && expanded >= matches.length - 1) setExpanded(Math.max(0, matches.length - 2))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-brand-600" />
        <span className="text-sm font-semibold text-gray-700">
          {matches.length} {matches.length === 1 ? 'sugerencia' : 'sugerencias'} encontradas
        </span>
      </div>

      {matches.map((match, idx) => {
        const word = text.slice(match.offset, match.offset + match.length)
        const isOpen = expanded === idx
        return (
          <div
            key={`${match.offset}-${match.rule.id}`}
            className={`rounded-2xl border transition-all duration-200 overflow-hidden
              ${isOpen ? 'border-brand-300 shadow-sm' : 'border-gray-200'}`}
          >
            <button
              onClick={() => setExpanded(isOpen ? null : idx)}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="px-2 py-0.5 rounded-lg bg-red-100 text-red-700 text-xs font-mono font-semibold shrink-0">
                {word}
              </span>
              <span className="text-sm text-gray-600 flex-1 truncate">{match.shortMessage}</span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); dismiss(match) }}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Ignorar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 pt-0 border-t border-gray-100 animate-slide-up">
                <p className="text-xs text-gray-500 mb-3 mt-3">{match.message}</p>
                {match.replacements.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-gray-400 self-center">Sugerencias:</span>
                    {match.replacements.map((r) => (
                      <button
                        key={r}
                        onClick={() => accept(match, r)}
                        className="px-3 py-1.5 rounded-xl bg-brand-700 text-white text-xs font-semibold
                                   hover:bg-brand-800 transition-colors"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">Sin sugerencias disponibles</p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
