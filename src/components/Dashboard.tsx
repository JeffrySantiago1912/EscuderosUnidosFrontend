import { useState } from 'react'
import { Wand2, Loader2, Copy, RotateCcw, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import ModeSelector from './ModeSelector'
import FileDropZone from './FileDropZone'
import SpellCheckPanel from './SpellCheckPanel'
import AnnotatedText from './AnnotatedText'
import type { InputMode, SpellMatch } from '../types'
import { checkSpelling } from '../utils/languageTool'
import { extractTextFromPDF } from '../utils/pdfExtract'
import { extractTextFromImage } from '../utils/imageOCR'

export default function Dashboard() {
  const [mode, setMode] = useState<InputMode>('text')
  const [text, setText] = useState('')
  const [checking, setChecking] = useState(false)
  const [matches, setMatches] = useState<SpellMatch[] | null>(null)

  const handleModeChange = (m: InputMode) => {
    setMode(m)
    setText('')
    setMatches(null)
  }

  const handleCheck = async () => {
    const trimmed = text.trim()
    if (!trimmed) { toast.error('Ingresa algún texto primero'); return }
    if (trimmed.length < 2) { toast.error('El texto es muy corto'); return }

    setChecking(true)
    setMatches(null)
    try {
      const result = await checkSpelling(trimmed)
      setMatches(result)
      if (result.length === 0) toast.success('¡Texto sin errores ortográficos!')
      else toast(`Se encontraron ${result.length} sugerencia${result.length > 1 ? 's' : ''}`, {
        icon: '✏️',
      })
    } catch {
      toast.error('Error al conectar con el corrector. Verifica tu conexión a internet.')
    } finally {
      setChecking(false)
    }
  }

  const copyText = () => {
    navigator.clipboard.writeText(text)
    toast.success('Texto copiado al portapapeles')
  }

  const downloadText = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'texto-corregido.txt'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Archivo descargado')
  }

  const reset = () => {
    setText('')
    setMatches(null)
  }

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const charCount = text.length
  const hasResults = matches !== null

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Corrector ortográfico</h2>
        <p className="text-gray-500 mt-1 text-sm">
          Sube un documento o escribe el texto a revisar
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column — input */}
        <div className="lg:col-span-3 space-y-5">
          {/* Mode selector */}
          <div className="card p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Tipo de entrada
            </p>
            <ModeSelector mode={mode} onChange={handleModeChange} />
          </div>

          {/* Input area */}
          <div className="card p-5 space-y-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {mode === 'text' ? 'Texto a revisar' : mode === 'pdf' ? 'Documento PDF' : 'Imagen'}
            </p>

            {mode === 'text' && (
              <textarea
                value={text}
                onChange={(e) => { setText(e.target.value); setMatches(null) }}
                placeholder="Escribe o pega aquí el texto del Apóstol Miguel Bogaert para revisar su ortografía…"
                rows={12}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50
                           text-gray-800 text-sm leading-relaxed resize-none
                           focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                           transition-all duration-200 placeholder:text-gray-400"
              />
            )}

            {mode === 'pdf' && (
              <FileDropZone
                mode="pdf"
                extractFn={extractTextFromPDF}
                onExtracted={(t) => { setText(t); setMatches(null) }}
              />
            )}

            {mode === 'image' && (
              <FileDropZone
                mode="image"
                extractFn={extractTextFromImage}
                onExtracted={(t) => { setText(t); setMatches(null) }}
              />
            )}

            {/* Extracted text preview for file modes */}
            {(mode === 'pdf' || mode === 'image') && text && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Texto extraído (puedes editar):</p>
                <textarea
                  value={text}
                  onChange={(e) => { setText(e.target.value); setMatches(null) }}
                  rows={8}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50
                             text-gray-800 text-sm leading-relaxed resize-none
                             focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                             transition-all placeholder:text-gray-400"
                />
              </div>
            )}

            {/* Stats & actions */}
            <div className="flex items-center justify-between">
              <div className="flex gap-4 text-xs text-gray-400">
                <span>{wordCount} palabras</span>
                <span>{charCount} caracteres</span>
              </div>
              <div className="flex gap-2">
                {text && (
                  <button onClick={reset} className="btn-secondary text-xs py-2 px-3">
                    <RotateCcw className="w-3.5 h-3.5" />
                    Limpiar
                  </button>
                )}
                <button
                  onClick={handleCheck}
                  disabled={checking || !text.trim()}
                  className="btn-primary text-xs py-2"
                >
                  {checking ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Revisando…</>
                  ) : (
                    <><Wand2 className="w-3.5 h-3.5" /> Corregir</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column — results */}
        <div className="lg:col-span-2 space-y-5">
          {hasResults && (
            <>
              {/* Annotated preview */}
              {matches.length > 0 && (
                <div className="card p-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Vista con errores marcados
                  </p>
                  <div className="max-h-64 overflow-y-auto">
                    <AnnotatedText
                      text={text}
                      matches={matches}
                      onTextChange={setText}
                      onMatchesChange={setMatches}
                    />
                  </div>
                </div>
              )}

              {/* Spell check suggestions */}
              <div className="card p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Sugerencias
                </p>
                <div className="max-h-[480px] overflow-y-auto pr-1">
                  <SpellCheckPanel
                    text={text}
                    matches={matches}
                    onTextChange={setText}
                    onMatchesChange={setMatches}
                  />
                </div>
              </div>

              {/* Export actions */}
              {text && (
                <div className="flex gap-2">
                  <button onClick={copyText} className="btn-secondary flex-1 justify-center text-xs py-2">
                    <Copy className="w-3.5 h-3.5" /> Copiar texto
                  </button>
                  <button onClick={downloadText} className="btn-secondary flex-1 justify-center text-xs py-2">
                    <Download className="w-3.5 h-3.5" /> Descargar
                  </button>
                </div>
              )}
            </>
          )}

          {!hasResults && (
            <div className="card p-8 flex flex-col items-center justify-center text-center gap-4 min-h-48">
              <div className="p-4 rounded-2xl bg-brand-50">
                <Wand2 className="w-8 h-8 text-brand-400" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-semibold text-gray-700">Los resultados aparecerán aquí</p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Ingresa el texto y presiona<br />«Corregir» para comenzar
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
