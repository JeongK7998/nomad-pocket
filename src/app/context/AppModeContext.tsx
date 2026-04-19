'use client'

import React, { createContext, useContext, useState } from 'react'

export type AppMode = 'YEARLY' | 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'CALENDAR'

interface AppModeContextValue {
  mode: AppMode
  setMode: (mode: AppMode) => void
}

const AppModeContext = createContext<AppModeContextValue | null>(null)

export function AppModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AppMode>('MONTHLY')

  return (
    <AppModeContext.Provider value={{ mode, setMode }}>
      {children}
    </AppModeContext.Provider>
  )
}

export function useAppMode() {
  const ctx = useContext(AppModeContext)
  if (!ctx) throw new Error('useAppMode must be used within AppModeProvider')
  return ctx
}
