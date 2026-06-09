import { FileText, Image, AlignLeft } from 'lucide-react'
import type { InputMode } from '../types'

interface Props {
  mode: InputMode
  onChange: (m: InputMode) => void
}

const modes: { id: InputMode; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>>; desc: string }[] = [
  { id: 'text',  label: 'Texto',  icon: AlignLeft, desc: 'Escribir o pegar texto' },
  { id: 'pdf',   label: 'PDF',    icon: FileText,  desc: 'Subir un documento PDF' },
  { id: 'image', label: 'Imagen', icon: Image,     desc: 'Subir foto o imagen' },
]

export default function ModeSelector({ mode, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {modes.map(({ id, label, icon: Icon, desc }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 text-left
            ${mode === id
              ? 'border-brand-600 bg-brand-50 text-brand-800'
              : 'border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:bg-brand-50/50'
            }`}
        >
          <div className={`p-2.5 rounded-xl ${mode === id ? 'bg-brand-700 text-white' : 'bg-gray-100 text-gray-500'}`}>
            <Icon className="w-5 h-5" strokeWidth={1.8} />
          </div>
          <div>
            <p className="font-semibold text-sm">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5 leading-tight">{desc}</p>
          </div>
        </button>
      ))}
    </div>
  )
}
