export type DashboardMode = 'YEARLY' | 'MONTHLY' | 'WEEKLY' | 'REGION' | 'TAGGING'

export interface AppSettings {
  startDay: number
  weekStartDay: 0 | 1
  dashboardDefaultMode: DashboardMode
}

const SETTINGS_KEY = 'nomad_pocket_settings'

export function getDefaultSettings(): AppSettings {
  return {
    startDay: 1,
    weekStartDay: 1,
    dashboardDefaultMode: 'MONTHLY',
  }
}

export function loadAppSettings(): AppSettings {
  if (typeof window === 'undefined') return getDefaultSettings()

  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    const parsed = raw ? JSON.parse(raw) as Partial<{ startDay: string | number; weekStartDay: 'sun' | 'mon'; dashboardDefaultMode: DashboardMode }> : {}
    const startDay = Number(parsed.startDay ?? 1)

    return {
      startDay: Number.isFinite(startDay) ? Math.min(28, Math.max(1, startDay)) : 1,
      weekStartDay: parsed.weekStartDay === 'sun' ? 0 : 1,
      dashboardDefaultMode: parsed.dashboardDefaultMode ?? 'MONTHLY',
    }
  } catch {
    return getDefaultSettings()
  }
}

function fmt(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getMonthlyRange(year: number, month: number, startDay: number): { from: string; to: string } {
  const safeStartDay = Math.min(28, Math.max(1, startDay))

  if (safeStartDay === 1) {
    const lastDay = new Date(year, month, 0).getDate()
    return {
      from: `${year}-${String(month).padStart(2, '0')}-01`,
      to: `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
    }
  }

  const from = new Date(year, month - 1, safeStartDay)
  const to = new Date(year, month, safeStartDay - 1)

  return { from: fmt(from), to: fmt(to) }
}

export function getWeekRange(anchorDate: Date, weekStartDay: 0 | 1): { from: string; to: string } {
  const from = new Date(anchorDate)
  from.setHours(0, 0, 0, 0)

  const currentDay = from.getDay()
  const diff = currentDay >= weekStartDay
    ? currentDay - weekStartDay
    : 7 - (weekStartDay - currentDay)

  from.setDate(from.getDate() - diff)

  const to = new Date(from)
  to.setDate(from.getDate() + 6)

  return { from: fmt(from), to: fmt(to) }
}

export function shiftDate(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}
