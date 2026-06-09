import { Shield, LogOut } from 'lucide-react'

interface Props {
  onLogout: () => void
}

export default function Header({ onLogout }: Props) {
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40 shadow-sm dark:shadow-gray-900/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-700">
            <Shield className="w-5 h-5 text-white" strokeWidth={1.8} />
          </div>
          <div>
            <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-none block">
              Escuderos Unidos
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 leading-none">
              Apóstol Miguel Bogaert
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400
                       px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </header>
  )
}
