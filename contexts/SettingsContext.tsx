"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface SettingsContextType {
  showFeesAndIncome: boolean
  toggleFeesAndIncome: () => void
  isLoading: boolean
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [showFeesAndIncome, setShowFeesAndIncome] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load settings from localStorage on mount
    const savedSetting = localStorage.getItem('showFeesAndIncome')
    if (savedSetting !== null) {
      setShowFeesAndIncome(JSON.parse(savedSetting))
    }
    setIsLoading(false)
  }, [])

  const toggleFeesAndIncome = () => {
    const newValue = !showFeesAndIncome
    setShowFeesAndIncome(newValue)
    localStorage.setItem('showFeesAndIncome', JSON.stringify(newValue))
  }

  return (
    <SettingsContext.Provider value={{ showFeesAndIncome, toggleFeesAndIncome, isLoading }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
