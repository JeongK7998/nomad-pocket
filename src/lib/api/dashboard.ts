import { supabase } from '@/lib/supabase'
import type { Transaction, Category, Subcategory, PaymentMethod, Region, Tag } from '@/types/database'

// ── 색상 팔레트 ─────────────────────────────────────────────────
const EP = ['#62B0FE','#3582DF','#A27CDA','#FB91D1','#F6728E','#E96554','#FE9E59','#FFDD48','#75CD10','#D6D6D6']
const IP = ['#B2D5FF','#FFD7AA','#CADE9F','#DFC3F7','#F9C6C6','#C4E9E1','#EBEBEB']

// ── 타입 ──────────────────────────────────────────────────────────
export interface DashBar { label: string; income: number | null; expense: number | null }
export interface BD { name: string; value: number; color: string }
export interface P5 { initial: string; name: string; person?: string | null; amount: number; color: string }
export interface SP { rank: string; name: string; amount: number }

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
    supabase.from('regions').select('*'),
    supabase.from('tags').select('*'),
  ])
  return {
    categories:     (cats.data     ?? []) as Category[],
    subcategories:  (subs.data     ?? []) as Subcategory[],
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
      return { initial: pm?.initial ?? '?', name: pm?.name ?? '기타', amount: amt, color: pm?.color ?? '#AEAFAF' }
    })

  const expBySub: Record<string, number> = {}
  for (const t of txs.filter(t => t.type === 'expense')) {
    expBySub[t.subcategory_id] = (expBySub[t.subcategory_id] ?? 0) + Number(t.amount)
  }
  const spending: SP[] = Object.entries(expBySub)
    .sort((a, b) => b[1] - a[1]).slice(0, 11)
    .map(([subId, amt], i) => ({
      rank:   String(i + 1).padStart(2, '0'),
      name:   master.subcategories.find(s => s.id === subId)?.name ?? '기타',
      amount: amt,
    }))

  return { income, expense, net: income - expense, expBD, incBD, top5, spending }
}

// ── 메인: mode별 데이터 페치 + 집계 ──────────────────────────────
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export async function fetchDashboardData(params: {
  mode: 'YEARLY' | 'MONTHLY' | 'WEEKLY' | 'REGION' | 'TAGGING'
  year: number
  month: number
  week: number
  weekPage: number
  regionId: string | null
  tagId: string | null
  master: Pick<MasterData, 'categories' | 'subcategories' | 'paymentMethods'>
}): Promise<{ dataset: DashDataset; bars: DashBar[] }> {
  const { mode, year, month, week, weekPage, regionId, tagId, master } = params

  let query = supabase.from('transactions').select('*')

  if (mode === 'MONTHLY' || mode === 'REGION' || mode === 'TAGGING') {
    query = query.gte('date', `${year}-01-01`).lte('date', `${year}-12-31`)
  } else if (mode === 'YEARLY') {
    const decadeStart = Math.floor((year - 1) / 10) * 10 + 1
    query = query.gte('date', `${decadeStart}-01-01`).lte('date', `${year}-12-31`)
  } else if (mode === 'WEEKLY') {
    const endWeek = week - weekPage * 12
    const startWeek = endWeek - 11
    const startRange = weekToDateRange(year, Math.max(1, startWeek))
    const endRange   = weekToDateRange(year, endWeek)
    query = query.gte('date', startRange.from).lte('date', endRange.to)
  }

  if (mode === 'REGION'  && regionId) query = query.eq('region_id', regionId)
  if (mode === 'TAGGING' && tagId)    query = query.contains('tag_ids', [tagId])

  const { data, error } = await query
  if (error) throw error
  const txs = (data ?? []) as Transaction[]

  let bars: DashBar[]
  let summaryTxs: Transaction[]

  if (mode === 'MONTHLY') {
    bars = MONTH_LABELS.map((label, i) => {
      const mt = txs.filter(t => parseInt(t.date.slice(5, 7)) === i + 1)
      if (!mt.length) return { label, income: null, expense: null }
      return {
        label,
        income:  mt.filter(t => t.type === 'income') .reduce((s, t) => s + Number(t.amount), 0) || null,
        expense: mt.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0) || null,
      }
    })
    summaryTxs = txs.filter(t => parseInt(t.date.slice(5, 7)) === month)

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
      const { from, to } = weekToDateRange(year, w)
      const wt = txs.filter(t => t.date >= from && t.date <= to)
      if (!wt.length) return { label, income: null, expense: null }
      return {
        label,
        income:  wt.filter(t => t.type === 'income') .reduce((s, t) => s + Number(t.amount), 0) || null,
        expense: wt.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0) || null,
      }
    })
    const { from, to } = weekToDateRange(year, endWeek)
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
    }).filter(b => b.income !== null || b.expense !== null)
    summaryTxs = txs
  }

  return { dataset: aggregateDataset(summaryTxs, master), bars }
}
