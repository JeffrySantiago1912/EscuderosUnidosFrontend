import { FileText, Image, AlignLeft, FileType } from 'lucide-react'
import type { InputMode } from '../types'

interface Props {
  mode: InputMode
  onChange: (m: InputMode) => void
}

const modes: { id: InputMode; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>>; desc: string }[] = [
  { id: 'text',  label: 'Texto',  icon: AlignLeft, desc: 'Escribir o pegar' },
  { id: 'pdf',   label: 'PDF',    icon: FileText,  desc: 'Subir archivo PDF' },
  { id: 'txt',   label: 'TXT',    icon: FileType,  desc: 'Subir archivo .txt' },
  { id: 'image', label: 'Imagen', icon: Image,     desc: 'Subir foto o imagen' },
]

export default function ModeSelector({ mode, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {modes.map(({ id, label, icon: Icon, desc }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 text-left
            ${mode === id
              ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/30 text-brand-800 dark:text-brand-300'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50/50 dark:hover:bg-brand-900/20'
            }`}
        >
          <div className={`p-2.5 rounded-xl ${mode === id ? 'bg-brand-700 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
            <Icon className="w-5 h-5" strokeWidth={1.8} />
          </div>
          <div>
            <p className="font-semibold text-sm">{label}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-tight">{desc}</p>
          </div>
        </button>
      ))}
    </div>
  )
}
