'use client'

import { useState, useEffect, useCallback } from 'react'
import { Menu } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { IndicatorBar, type ExchangeRateItem } from './IndicatorBar'
import { FAB } from './FAB'
import { TransactionInputPopup } from './TransactionInputPopup'
import { UserSelectScreen } from './UserSelectScreen'
import { getCurrencies } from '@/lib/api'
import { getProfiles } from '@/lib/api/users'
import { fetchKrwRates } from '@/lib/exchangeRate'
import {
  getCurrentUser,
  hasAuthenticatedAccess,
  clearAccessSession,
  setCurrentUser as persistCurrentUser,
  type UserSession,
} from '@/lib/userContext'

const FONT = "font-['Pretendard_Variable',sans-serif]"

function toHHMM(isoOrNull: string | null): string {
  const d = isoOrNull ? new Date(isoOrNull) : new Date()
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [popupOpen,   setPopupOpen]   = useState(false)
  const [drawerOpen,  setDrawerOpen]  = useState(false)
  const [rateItems,   setRateItems]   = useState<ExchangeRateItem[]>([])
  const [lastUpdated, setLastUpdated] = useState<string | undefined>(undefined)
  const [availableUsers, setAvailableUsers] = useState<UserSession[]>([])

  // 사용자 상태: 'loading' | null(미설정) | UserSession
  const [currentUser, setCurrentUser] = useState<UserSession | null | 'loading'>('loading')
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | 'loading'>('loading')

  // 마운트 시 localStorage에서 현재 사용자 로드
  useEffect(() => {
    setCurrentUser(getCurrentUser())
    setIsAuthenticated(hasAuthenticatedAccess())
  }, [])

  const handleUserSelect = useCallback((user: UserSession) => {
    setCurrentUser(user)
    setIsAuthenticated(true)
  }, [])

  useEffect(() => {
    if (!currentUser || currentUser === 'loading' || !isAuthenticated || isAuthenticated === 'loading') return
    getProfiles()
      .then((profiles) => {
        setAvailableUsers(
          profiles.map((profile) => ({
            id: profile.id,
            name: profile.name,
            color: profile.color ?? undefined,
          })),
        )
      })
      .catch(() => setAvailableUsers([]))
  }, [currentUser, isAuthenticated])

  useEffect(() => {
    if (!currentUser || currentUser === 'loading') return
    async function loadRates() {
      try {
        const currencies   = await getCurrencies(true)
        const foreignCodes = currencies.map((c) => c.code).filter((c) => c !== 'KRW')
        if (foreignCodes.length === 0) return
        const { rates, updatedAt } = await fetchKrwRates(foreignCodes)
        const items = foreignCodes
          .filter((code) => rates[code] !== undefined)
          .map((code) => ({ code, rate: rates[code] }))
        setRateItems(items)
        setLastUpdated(toHHMM(updatedAt))
      } catch { /* 환율 조회 실패 시 무표시 */ }
    }
    loadRates()
  }, [currentUser])

  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 768) setDrawerOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // 로딩 중 (hydration 전 blank)
  if (currentUser === 'loading' || isAuthenticated === 'loading') {
    return <div className="bg-[#f4f4f7] w-full h-dvh" />
  }

  // 사용자 미설정 → 사용자 선택 화면
  if (!currentUser || !isAuthenticated) {
    return <UserSelectScreen onSelect={handleUserSelect} />
  }

  function handleCycleUser() {
    if (availableUsers.length <= 1) return
    const currentIndex = availableUsers.findIndex((user) => user.id === currentUser.id)
    const nextUser = availableUsers[(currentIndex + 1) % availableUsers.length] ?? availableUsers[0]
    persistCurrentUser(nextUser)
    setCurrentUser(nextUser)
    window.location.reload()
  }

  function handleLogout() {
    clearAccessSession()
    setCurrentUser(null)
    setIsAuthenticated(false)
  }

  return (
    <div className="bg-[#f4f4f7] relative w-full h-dvh overflow-hidden">

      <Sidebar
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        currentUser={currentUser}
        canCycleUser={availableUsers.length > 1}
        onCycleUser={handleCycleUser}
        onLogout={handleLogout}
      />

      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      <div className="absolute inset-0 md:left-[256px] flex flex-col overflow-hidden">

        <div className="flex md:hidden h-[52px] flex-shrink-0 items-center justify-between px-[16px] bg-[#f4f4f7] z-20">
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-[36px] h-[36px] flex items-center justify-center rounded-[8px] hover:bg-black/5 active:bg-black/10 transition-colors"
          >
            <Menu size={22} className="text-[#18202a]" />
          </button>
          <span className={`${FONT} font-extrabold text-[16px] text-[#004ea7] tracking-[-0.5px]`}>
            NOMAD_POCKET
          </span>
          <div className="w-[36px]" />
        </div>

        <div className="hidden md:block">
          <IndicatorBar rates={rateItems} lastUpdated={lastUpdated} />
        </div>

        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>

      <FAB onClick={() => setPopupOpen(true)} />
      {popupOpen && <TransactionInputPopup onClose={() => setPopupOpen(false)} />}
    </div>
  )
}
