import LoginPage from './components/LoginPage'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import { useAuth } from './hooks/useAuth'
import { useDarkMode } from './hooks/useDarkMode'

export default function App() {
  const { isAuthenticated, login, logout } = useAuth()
  useDarkMode()

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header onLogout={logout} />
      <main className="animate-fade-in">
        <Dashboard />
      </main>
    </div>
  )
}
