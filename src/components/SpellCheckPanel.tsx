import { useState } from 'react'
import { CheckCircle2, ChevronDown, ChevronUp, Sparkles, X, CheckCheck } from 'lucide-react'
import toast from 'react-hot-toast'
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
        <div className="p-4 rounded-2xl bg-green-100 dark:bg-green-900/30">
          <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-200">¡Sin errores encontrados!</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">El texto no presenta faltas ortográficas.</p>
        </div>
      </div>
    )
  }

  const accept = (match: SpellMatch, replacement: string) => {
    const newText = applyCorrection(text, match, replacement)
    onTextChange(newText)
    onMatchesChange(
      matches
        .filter((m) => m !== match)
        .map((m) => {
          const delta = replacement.length - match.length
          if (m.offset > match.offset) return { ...m, offset: m.offset + delta }
          return m
        }),
    )
    if (expanded !== null && expanded >= matches.length - 1) setExpanded(Math.max(0, matches.length - 2))
  }

  const dismiss = (match: SpellMatch) => {
    onMatchesChange(matches.filter((m) => m !== match))
    if (expanded !== null && expanded >= matches.length - 1) setExpanded(Math.max(0, matches.length - 2))
  }

  const acceptAll = () => {
    const correctable = matches.filter((m) => m.replacements.length > 0)
    if (correctable.length === 0) {
      toast('No hay sugerencias automáticas disponibles', { icon: 'ℹ️' })
      return
    }
    // Apply from right to left to avoid offset drift
    let newText = text
    const sorted = [...correctable].sort((a, b) => b.offset - a.offset)
    for (const match of sorted) {
      newText = applyCorrection(newText, match, match.replacements[0])
    }
    onTextChange(newText)
    onMatchesChange(matches.filter((m) => m.replacements.length === 0))
    toast.success(
      `${correctable.length} corrección${correctable.length > 1 ? 'es aplicadas' : ' aplicada'} automáticamente`,
    )
  }

  const correctableCount = matches.filter((m) => m.replacements.length > 0).length

  return (
    <div className="space-y-2">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {matches.length} {matches.length === 1 ? 'sugerencia' : 'sugerencias'} encontradas
          </span>
        </div>

        {/* Corregir todo button */}
        {correctableCount > 0 && (
          <button
            onClick={acceptAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                       bg-green-600 hover:bg-green-700 active:bg-green-800
                       dark:bg-green-700 dark:hover:bg-green-600
                       text-white shadow-sm transition-all duration-200"
            title={`Aplicar la primera sugerencia a las ${correctableCount} correcciones`}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Corregir todo
          </button>
        )}
      </div>

      {matches.map((match, idx) => {
        const word = text.slice(match.offset, match.offset + match.length)
        const isOpen = expanded === idx
        return (
          <div
            key={`${match.offset}-${match.rule.id}`}
            className={`rounded-2xl border transition-all duration-200 overflow-hidden
              ${isOpen
                ? 'border-brand-300 dark:border-brand-600 shadow-sm'
                : 'border-gray-200 dark:border-gray-700'
              }`}
          >
            <button
              onClick={() => setExpanded(isOpen ? null : idx)}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <span className="px-2 py-0.5 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-mono font-semibold shrink-0">
                {word}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-300 flex-1 truncate">{match.shortMessage}</span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); dismiss(match) }}
                  className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Ignorar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                {isOpen
                  ? <ChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  : <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                }
              </div>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 pt-0 border-t border-gray-100 dark:border-gray-700 animate-slide-up">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 mt-3">{match.message}</p>
                {match.replacements.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-gray-400 dark:text-gray-500 self-center">Sugerencias:</span>
                    {match.replacements.map((r) => (
                      <button
                        key={r}
                        onClick={() => accept(match, r)}
                        className="px-3 py-1.5 rounded-xl bg-brand-700 dark:bg-brand-600 text-white text-xs font-semibold
                                   hover:bg-brand-800 dark:hover:bg-brand-500 transition-colors"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 dark:text-gray-500 italic">Sin sugerencias disponibles</p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
