import { useState } from 'react'
import type { SpellMatch } from '../types'
import { applyCorrection } from '../utils/languageTool'

interface Props {
  text: string
  matches: SpellMatch[]
  onTextChange: (t: string) => void
  onMatchesChange: (m: SpellMatch[]) => void
}

interface Popup {
  matchIdx: number
  x: number
  y: number
}

export default function AnnotatedText({ text, matches, onTextChange, onMatchesChange }: Props) {
  const [popup, setPopup] = useState<Popup | null>(null)

  if (!matches.length) return null

  // Build segments
  const segments: { text: string; matchIdx: number | null }[] = []
  let cursor = 0
  const sorted = [...matches].map((m, i) => ({ ...m, _idx: i })).sort((a, b) => a.offset - b.offset)

  for (const m of sorted) {
    if (m.offset > cursor) segments.push({ text: text.slice(cursor, m.offset), matchIdx: null })
    segments.push({ text: text.slice(m.offset, m.offset + m.length), matchIdx: m._idx })
    cursor = m.offset + m.length
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), matchIdx: null })

  const handleClick = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setPopup(popup?.matchIdx === idx ? null : { matchIdx: idx, x: rect.left, y: rect.bottom + window.scrollY + 4 })
  }

  const accept = (match: SpellMatch, replacement: string) => {
    const newText = applyCorrection(text, match, replacement)
    onTextChange(newText)
    onMatchesChange(
      matches.filter((m) => m !== match).map((m) => {
        const delta = replacement.length - match.length
        return m.offset > match.offset ? { ...m, offset: m.offset + delta } : m
      }),
    )
    setPopup(null)
  }

  return (
    <div className="relative">
      <div
        className="p-4 rounded-2xl border border-gray-200 bg-white leading-relaxed text-sm text-gray-800 whitespace-pre-wrap"
        onClick={() => setPopup(null)}
      >
        {segments.map((seg, i) => {
          if (seg.matchIdx === null) return <span key={i}>{seg.text}</span>
          const match = matches[seg.matchIdx]
          if (!match) return <span key={i}>{seg.text}</span>
          return (
            <span
              key={i}
              className="error-highlight"
              onClick={(e) => handleClick(seg.matchIdx!, e)}
            >
              {seg.text}
            </span>
          )
        })}
      </div>

      {popup !== null && (() => {
        const match = matches[popup.matchIdx]
        if (!match) return null
        return (
          <div
            className="fixed z-50 bg-white rounded-2xl shadow-xl border border-gray-200 p-3 min-w-48 max-w-64 animate-slide-up"
            style={{ top: popup.y, left: Math.min(popup.x, window.innerWidth - 260) }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs text-gray-500 mb-2 px-1">{match.shortMessage}</p>
            {match.replacements.length > 0 ? (
              <div className="flex flex-col gap-1">
                {match.replacements.map((r) => (
                  <button
                    key={r}
                    onClick={() => accept(match, r)}
                    className="text-left px-3 py-1.5 rounded-xl text-sm font-medium text-brand-800 hover:bg-brand-50 transition-colors"
                  >
                    {r}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic px-1">Sin sugerencias</p>
            )}
          </div>
        )
      })()}
    </div>
  )
}
