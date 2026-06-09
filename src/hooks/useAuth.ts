import { useState, useEffect } from 'react'

const CREDENTIALS = {
  email: 'escuderos@montededios.org',
  password: 'escuderosunidos01',
}
const SESSION_KEY = 'eu_session'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(SESSION_KEY) === 'true'
  })

  useEffect(() => {
    localStorage.setItem(SESSION_KEY, String(isAuthenticated))
  }, [isAuthenticated])

  const login = (email: string, password: string): boolean => {
    if (email.trim().toLowerCase() === CREDENTIALS.email && password === CREDENTIALS.password) {
      setIsAuthenticated(true)
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem(SESSION_KEY)
  }

  return { isAuthenticated, login, logout }
}
