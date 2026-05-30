import { supabase } from '@/lib/supabase'
import { formatSubcategoryLabel } from '@/lib/subcategoryEmoji'
import { getCategoryColorOverride, getSubcategoryEmojiOverride } from '@/lib/categoryOverrides'
import type { Transaction, Category, Subcategory, PaymentMethod, Region, Tag } from '@/types/database'

// ── 색상 팔레트 ─────────────────────────────────────────────────
const EP = ['#62B0FE','#3582DF','#A27CDA','#FB91D1','#F6728E','#E96554','#FE9E59','#FFDD48','#75CD10','#D6D6D6']
const IP = ['#B2D5FF','#FFD7AA','#CADE9F','#DFC3F7','#F9C6C6','#C4E9E1','#EBEBEB']

// ── 타입 ──────────────────────────────────────────────────────────
export interface DashBar { label: string; income: number | null; expense: number | null }
export interface BD { name: string; value: number; color: string }
export interface P5 { id: string | null; initial: string; name: string; person?: string | null; amount: number; color: string }
export interface SP { rank: string; name: string; amount: number }
export interface PaymentDetailItem {
  id: string
  date: string
  categoryName: string
  subcategoryName: string
  description: string
  memo: string | null
  amount: number
  currency: string
  originalAmount: number | null
}

export interface DashDataset {
  income: number
  expense: number
  net: number
  expBD: BD[]
  incBD: BD[]
  top5: P5[]
  spending: SP[]
}

export interface MasterData {
  categories: Category[]
  subcategories: Subcategory[]
  paymentMethods: PaymentMethod[]
  regions: Region[]
  tags: Tag[]
}

// ── ISO 주차 계산 ─────────────────────────────────────────────────
export function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

// ── 주차 → 날짜 범위 ──────────────────────────────────────────────
export function weekToDateRange(year: number, week: number): { from: string; to: string } {
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const dayOfWeek = jan4.getUTCDay() || 7
  const weekStart = new Date(Date.UTC(year, 0, 4 - dayOfWeek + 1 + (week - 1) * 7))
  const weekEnd = new Date(weekStart)
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6)
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  return { from: fmt(weekStart), to: fmt(weekEnd) }
}

// ── 마스터 데이터 조회 ────────────────────────────────────────────
export async function fetchMasterData(): Promise<MasterData> {
  const [cats, subs, payments, regions, tags] = await Promise.all([
    supabase.from('categories').select('*'),
    supabase.from('subcategories').select('*'),
    supabase.from('payment_methods').select('*'),
    supabase.from('regions').select('*').eq('is_active', true).order('created_at'),
    supabase.from('tags').select('*').eq('is_active', true).order('created_at'),
  ])
  return {
    categories: ((cats.data ?? []) as Category[]).map((category) => ({
      ...category,
      color: category.color ?? getCategoryColorOverride(category.id),
    })),
    subcategories: ((subs.data ?? []) as Subcategory[]).map((subcategory) => ({
      ...subcategory,
      emoji: subcategory.emoji ?? getSubcategoryEmojiOverride(subcategory.id),
    })),
    paymentMethods: (payments.data ?? []) as PaymentMethod[],
    regions:        (regions.data  ?? []) as Region[],
    tags:           (tags.data     ?? []) as Tag[],
  }
}

// ── 집계: 거래 배열 → DashDataset ────────────────────────────────
function aggregateDataset(
  txs: Transaction[],
  master: Pick<MasterData, 'categories' | 'subcategories' | 'paymentMethods'>
): DashDataset {
  const income  = txs.filter(t => t.type === 'income') .reduce((s, t) => s + Number(t.amount), 0)
  const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

  const expBycat: Record<string, number> = {}
  for (const t of txs.filter(t => t.type === 'expense')) {
    expBycat[t.category_id] = (expBycat[t.category_id] ?? 0) + Number(t.amount)
  }
  const expBD: BD[] = Object.entries(expBycat)
    .sort((a, b) => b[1] - a[1]).slice(0, 10)
    .map(([catId, amt], i) => ({
      name:  master.categories.find(c => c.id === catId)?.name ?? '기타',
      value: expense > 0 ? Math.round(amt / expense * 100) : 0,
      color: EP[i] ?? EP[EP.length - 1],
    }))

  const incBycat: Record<string, number> = {}
  for (const t of txs.filter(t => t.type === 'income')) {
    incBycat[t.category_id] = (incBycat[t.category_id] ?? 0) + Number(t.amount)
  }
  const incBD: BD[] = Object.entries(incBycat)
    .sort((a, b) => b[1] - a[1]).slice(0, 7)
    .map(([catId, amt], i) => ({
      name:  master.categories.find(c => c.id === catId)?.name ?? '기타',
      value: income > 0 ? Math.round(amt / income * 100) : 0,
      color: IP[i] ?? IP[IP.length - 1],
    }))

  const expByPay: Record<string, number> = {}
  for (const t of txs.filter(t => t.type === 'expense' && t.payment_method_id)) {
    expByPay[t.payment_method_id!] = (expByPay[t.payment_method_id!] ?? 0) + Number(t.amount)
  }
  const top5: P5[] = Object.entries(expByPay)
    .sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([pmId, amt]) => {
      const pm = master.paymentMethods.find(p => p.id === pmId)
      return { id: pmId, initial: pm?.initial ?? '?', name: pm?.name ?? '기타', person: pm?.owner ?? null, amount: amt, color: pm?.color ?? '#AEAFAF' }
    })

  const expBySub: Record<string, number> = {}
  for (const t of txs.filter(t => t.type === 'expense')) {
    expBySub[t.subcategory_id] = (expBySub[t.subcategory_id] ?? 0) + Number(t.amount)
  }
  const spending: SP[] = Object.entries(expBySub)
    .sort((a, b) => b[1] - a[1]).slice(0, 12)
    .map(([subId, amt], i) => ({
      rank:   String(i + 1).padStart(2, '0'),
      name:   formatSubcategoryLabel(master.subcategories.find(s => s.id === subId)) ?? '기타',
      amount: amt,
    }))

  return { income, expense, net: income - expense, expBD, incBD, top5, spending }
}

// ── 메인: mode별 데이터 페치 + 집계 ──────────────────────────────
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function fmtDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function dashboardMonthlyRange(year: number, month: number, startDay = 1): { from: string; to: string } {
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
  return { from: fmtDate(from), to: fmtDate(to) }
}

function dashboardWeekRange(year: number, week: number, weekStartDay: 0 | 1 = 1): { from: string; to: string } {
  const isoRange = weekToDateRange(year, week)
  const anchor = new Date(isoRange.from + 'T00:00:00')
  const currentDay = anchor.getDay()
  const diff = currentDay >= weekStartDay
    ? currentDay - weekStartDay
    : 7 - (weekStartDay - currentDay)
  anchor.setDate(anchor.getDate() - diff)
  const end = new Date(anchor)
  end.setDate(anchor.getDate() + 6)
  return { from: fmtDate(anchor), to: fmtDate(end) }
}

function buildDashboardQuery(params: {
  mode: 'YEARLY' | 'MONTHLY' | 'WEEKLY' | 'REGION' | 'TAGGING'
  year: number
  week: number
  weekPage: number
  monthStartDay?: number
  weekStartDay?: 0 | 1
  regionId: string | null
  tagId: string | null
}) {
  const { mode, year, week, weekPage, monthStartDay = 1, weekStartDay = 1, regionId, tagId } = params

  let query = supabase.from('transactions').select('*')

  if (mode === 'MONTHLY' || mode === 'REGION' || mode === 'TAGGING') {
    const firstRange = dashboardMonthlyRange(year, 1, monthStartDay)
    const lastRange = dashboardMonthlyRange(year, 12, monthStartDay)
    query = query.gte('date', firstRange.from).lte('date', lastRange.to)
  } else if (mode === 'YEARLY') {
    const decadeStart = Math.floor((year - 1) / 10) * 10 + 1
    query = query.gte('date', `${decadeStart}-01-01`).lte('date', `${year}-12-31`)
  } else if (mode === 'WEEKLY') {
    const endWeek = week - weekPage * 12
    const startWeek = endWeek - 11
    const startRange = dashboardWeekRange(year, Math.max(1, startWeek), weekStartDay)
    const endRange   = dashboardWeekRange(year, endWeek, weekStartDay)
    query = query.gte('date', startRange.from).lte('date', endRange.to)
  }

  if (mode === 'REGION'  && regionId) query = query.eq('region_id', regionId)
  if (mode === 'TAGGING' && tagId)    query = query.contains('tag_ids', [tagId])

  return query
}

export async function fetchDashboardData(params: {
  mode: 'YEARLY' | 'MONTHLY' | 'WEEKLY' | 'REGION' | 'TAGGING'
  year: number
  month: number
  week: number
  weekPage: number
  monthStartDay?: number
  weekStartDay?: 0 | 1
  regionId: string | null
  tagId: string | null
  master: Pick<MasterData, 'categories' | 'subcategories' | 'paymentMethods'>
}): Promise<{ dataset: DashDataset; bars: DashBar[] }> {
  const { mode, year, month, week, weekPage, monthStartDay = 1, weekStartDay = 1, regionId, tagId, master } = params

  const query = buildDashboardQuery({ mode, year, week, weekPage, monthStartDay, weekStartDay, regionId, tagId })
  const { data, error } = await query
  if (error) throw error
  const txs = (data ?? []) as Transaction[]

  let bars: DashBar[]
  let summaryTxs: Transaction[]

  if (mode === 'MONTHLY') {
    bars = MONTH_LABELS.map((label, i) => {
      const range = dashboardMonthlyRange(year, i + 1, monthStartDay)
      const mt = txs.filter(t => t.date >= range.from && t.date <= range.to)
      if (!mt.length) return { label, income: null, expense: null }
      return {
        label,
        income:  mt.filter(t => t.type === 'income') .reduce((s, t) => s + Number(t.amount), 0) || null,
        expense: mt.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0) || null,
      }
    })
    const summaryRange = dashboardMonthlyRange(year, month, monthStartDay)
    summaryTxs = txs.filter(t => t.date >= summaryRange.from && t.date <= summaryRange.to)

  } else if (mode === 'YEARLY') {
    const decadeStart = Math.floor((year - 1) / 10) * 10 + 1
    bars = Array.from({ length: 10 }, (_, i) => {
      const y  = decadeStart + i
      const yt = txs.filter(t => parseInt(t.date.slice(0, 4)) === y)
      if (!yt.length) return { label: String(y), income: null, expense: null }
      return {
        label: String(y),
        income:  yt.filter(t => t.type === 'income') .reduce((s, t) => s + Number(t.amount), 0) || null,
        expense: yt.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0) || null,
      }
    })
    summaryTxs = txs.filter(t => parseInt(t.date.slice(0, 4)) === year)

  } else if (mode === 'WEEKLY') {
    const endWeek = week - weekPage * 12
    bars = Array.from({ length: 12 }, (_, i) => {
      const w = endWeek - 11 + i
      const label = w > 0 ? `W${String(w).padStart(2, '0')}` : `W${String(w + 52).padStart(2, '0')}`
      if (w <= 0) return { label, income: null, expense: null }
      const { from, to } = dashboardWeekRange(year, w, weekStartDay)
      const wt = txs.filter(t => t.date >= from && t.date <= to)
      if (!wt.length) return { label, income: null, expense: null }
      return {
        label,
        income:  wt.filter(t => t.type === 'income') .reduce((s, t) => s + Number(t.amount), 0) || null,
        expense: wt.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0) || null,
      }
    })
    const { from, to } = dashboardWeekRange(year, endWeek, weekStartDay)
    summaryTxs = txs.filter(t => t.date >= from && t.date <= to)

  } else {
    bars = MONTH_LABELS.map((label, i) => {
      const mt = txs.filter(t => parseInt(t.date.slice(5, 7)) === i + 1)
      if (!mt.length) return { label, income: null, expense: null }
      return {
        label,
        income:  mt.filter(t => t.type === 'income') .reduce((s, t) => s + Number(t.amount), 0) || null,
        expense: mt.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0) || null,
      }
    })
    summaryTxs = txs
  }

  return { dataset: aggregateDataset(summaryTxs, master), bars }
}

export async function fetchDashboardPaymentDetails(params: {
  mode: 'YEARLY' | 'MONTHLY' | 'WEEKLY' | 'REGION' | 'TAGGING'
  year: number
  month: number
  week: number
  weekPage: number
  monthStartDay?: number
  weekStartDay?: 0 | 1
  regionId: string | null
  tagId: string | null
  paymentMethodId: string
  master: Pick<MasterData, 'categories' | 'subcategories'>
}): Promise<PaymentDetailItem[]> {
  const { mode, year, month, week, weekPage, monthStartDay = 1, weekStartDay = 1, regionId, tagId, paymentMethodId, master } = params

  const query = buildDashboardQuery({ mode, year, week, weekPage, monthStartDay, weekStartDay, regionId, tagId }).eq('payment_method_id', paymentMethodId)
  const { data, error } = await query
  if (error) throw error

  let txs = (data ?? []) as Transaction[]

  if (mode === 'MONTHLY') {
    const range = dashboardMonthlyRange(year, month, monthStartDay)
    txs = txs.filter((tx) => tx.date >= range.from && tx.date <= range.to)
  } else if (mode === 'YEARLY') {
    txs = txs.filter((tx) => parseInt(tx.date.slice(0, 4)) === year)
  } else if (mode === 'WEEKLY') {
    const endWeek = week - weekPage * 12
    const { from, to } = dashboardWeekRange(year, endWeek, weekStartDay)
    txs = txs.filter((tx) => tx.date >= from && tx.date <= to)
  }

  return txs
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at))
    .map((tx) => ({
      id: tx.id,
      date: tx.date,
      categoryName: master.categories.find((category) => category.id === tx.category_id)?.name ?? '-',
      subcategoryName: formatSubcategoryLabel(master.subcategories.find((subcategory) => subcategory.id === tx.subcategory_id)) ?? '-',
      description: tx.description,
      memo: tx.memo ?? null,
      amount: Number(tx.amount),
      currency: tx.currency,
      originalAmount: tx.original_amount ?? null,
    }))
}
