import { useState } from 'react'
import { Wand2, Loader2, Copy, RotateCcw, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import ModeSelector from './ModeSelector'
import FileDropZone from './FileDropZone'
import SpellCheckPanel from './SpellCheckPanel'
import AnnotatedText from './AnnotatedText'
import type { InputMode, SpellMatch } from '../types'
import { checkSpelling } from '../utils/languageTool'
import { extractTextFromPDF } from '../utils/pdfExtract'
import { extractTextFromImage } from '../utils/imageOCR'
import { extractTextFromTxt } from '../utils/txtExtract'

export default function Dashboard() {
  const [mode, setMode] = useState<InputMode>('text')
  const [text, setText] = useState('')
  const [checking, setChecking] = useState(false)
  const [progress, setProgress] = useState(0)
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
    setProgress(0)
    setMatches(null)
    try {
      const result = await checkSpelling(trimmed, setProgress)
      setMatches(result)
      if (result.length === 0) toast.success('¡Texto sin errores ortográficos!')
      else toast(`Se encontraron ${result.length} sugerencia${result.length > 1 ? 's' : ''}`, { icon: '✏️' })
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
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    const maxWidth = pageWidth - margin * 2
    let y = 22

    // Header — title
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(17)
    doc.setTextColor(109, 40, 217)
    doc.text('Escuderos Unidos', margin, y)
    y += 8

    // Subtitle
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(120, 80, 200)
    doc.text('Corrector', margin, y)
    y += 5

    // Date
    const fecha = new Date().toLocaleDateString('es-DO', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
    doc.setTextColor(150, 150, 150)
    doc.setFontSize(8)
    doc.text(`Fecha: ${fecha}`, margin, y)
    y += 6

    // Divider line
    doc.setDrawColor(200, 180, 240)
    doc.setLineWidth(0.4)
    doc.line(margin, y, pageWidth - margin, y)
    y += 8

    // Body text
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(30, 30, 30)
    const lineHeight = 6.5

    const paragraphs = text.split('\n')
    for (const para of paragraphs) {
      const wrapped = doc.splitTextToSize(para || ' ', maxWidth)
      for (const line of wrapped) {
        if (y + lineHeight > pageHeight - margin) {
          doc.addPage()
          y = margin
        }
        doc.text(line, margin, y)
        y += lineHeight
      }
      y += 2 // paragraph gap
    }

    // Footer on each page
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(180, 180, 180)
      doc.text(
        `Ministerio Monte de Dios • Página ${i} de ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' },
      )
    }

    doc.save('texto-corregido.pdf')
    toast.success('PDF descargado')
  }

  const reset = () => {
    setText('')
    setMatches(null)
  }

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const charCount = text.length
  const hasResults = matches !== null

  const inputClass = `w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600
                      bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-100
                      text-sm leading-relaxed resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500
                      focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                      transition-all duration-200`

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Corrector ortográfico</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Sube un documento o escribe el texto a revisar
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column — input */}
        <div className="lg:col-span-3 space-y-5">
          <div className="card p-5">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
              Tipo de entrada
            </p>
            <ModeSelector mode={mode} onChange={handleModeChange} />
          </div>

          <div className="card p-5 space-y-4">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {mode === 'text' ? 'Texto a revisar' : mode === 'pdf' ? 'Documento PDF' : mode === 'txt' ? 'Archivo de texto' : 'Imagen'}
            </p>

            {mode === 'text' && (
              <textarea
                value={text}
                onChange={(e) => { setText(e.target.value); setMatches(null) }}
                placeholder="Escribe o pega aquí el texto para revisar su ortografía…"
                rows={12}
                className={inputClass}
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

            {mode === 'txt' && (
              <FileDropZone
                mode="txt"
                extractFn={extractTextFromTxt}
                onExtracted={(t) => { setText(t); setMatches(null) }}
              />
            )}

            {(mode === 'pdf' || mode === 'image' || mode === 'txt') && text && (
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Texto extraído (puedes editar):</p>
                <textarea
                  value={text}
                  onChange={(e) => { setText(e.target.value); setMatches(null) }}
                  rows={8}
                  className={inputClass}
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex gap-4 text-xs text-gray-400 dark:text-gray-500">
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
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {progress > 0 && progress < 100 ? `Revisando ${progress}%…` : 'Revisando…'}</>
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
              {matches.length > 0 && (
                <div className="card p-5">
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
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

              <div className="card p-5">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
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
              <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-900/30">
                <Wand2 className="w-8 h-8 text-brand-400" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-semibold text-gray-700 dark:text-gray-300">Los resultados aparecerán aquí</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 leading-relaxed">
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
