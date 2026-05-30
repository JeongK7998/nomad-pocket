import { supabase } from '@/lib/supabase'
import type { Budget } from '@/types/database'

const MONTH_NAMES = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
type ActualRow = { amount: number | string }
type MonthlyActualRow = ActualRow & { date: string }

// ── 시스템 목표 식별 헬퍼 ────────────────────────────────────────
export function isSystemMonthlyGoal(b: Budget) {
  const legacySystemName = (b.name ?? '').startsWith('월간 지출한도')
  return b.period_type === 'monthly' && b.filter_type === 'total' && (b.is_system === true || legacySystemName)
}
export function isSystemYearlyGoal(b: Budget) {
  const legacySystemName = (b.name ?? '').startsWith('년간 지출한도')
  return b.period_type === 'yearly' && b.filter_type === 'total' && (b.is_system === true || legacySystemName)
}
export function isSystemGoal(b: Budget) {
  return isSystemMonthlyGoal(b) || isSystemYearlyGoal(b)
}

function sortSystemBudgetCandidates(rows: Budget[]): Budget[] {
  return [...rows].sort((a, b) => {
    if (a.is_system !== b.is_system) return a.is_system ? -1 : 1
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })
}

async function findSystemMonthlyBudget(year: number, month: number): Promise<Budget | null> {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('period_type', 'monthly')
    .eq('year', year)
    .eq('month', month)
    .eq('filter_type', 'total')
    .order('created_at', { ascending: true })
  if (error) throw error
  return sortSystemBudgetCandidates(((data ?? []) as Budget[]).filter(isSystemMonthlyGoal))[0] ?? null
}

async function findSystemYearlyBudget(year: number): Promise<Budget | null> {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('period_type', 'yearly')
    .eq('year', year)
    .eq('filter_type', 'total')
    .order('created_at', { ascending: true })
  if (error) throw error
  return sortSystemBudgetCandidates(((data ?? []) as Budget[]).filter(isSystemYearlyGoal))[0] ?? null
}

// ── 조회 ───────────────────────────────────────────────────────

export async function getSystemMonthlyBudgets(year: number): Promise<Budget[]> {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('period_type', 'monthly')
    .eq('year', year)
    .eq('filter_type', 'total')
    .order('month', { ascending: true })
  if (error) throw error
  return sortSystemBudgetCandidates(((data ?? []) as Budget[]).filter(isSystemMonthlyGoal))
}

export async function getSystemYearlyBudget(year: number): Promise<Budget | null> {
  return findSystemYearlyBudget(year)
}

export async function getCustomGoals(): Promise<Budget[]> {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return ((data ?? []) as Budget[]).filter((b) => !isSystemGoal(b))
}

// ── 시스템 목표 자동 생성 ────────────────────────────────────────

export async function ensureSystemMonthlyBudget(year: number, month: number): Promise<Budget> {
  const existing = await findSystemMonthlyBudget(year, month)
  if (existing) return existing

  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear  = month === 1 ? year - 1 : year
  const { data: prevRows } = await supabase
    .from('budgets')
    .select('target_amount')
    .eq('period_type', 'monthly')
    .eq('year', prevYear)
    .eq('month', prevMonth)
    .eq('filter_type', 'total')
  const prevList = (prevRows ?? []) as Budget[]
  const prev = prevList.find(isSystemMonthlyGoal)
  const defaultAmount = prev?.target_amount ?? 3_000_000

  const baseInsert: Record<string, unknown> = {
    name:          `월간 지출한도 : ${MONTH_NAMES[month - 1]}`,
    period_type:   'monthly',
    target_amount: defaultAmount,
    year, month,
    end_date:      null,
    filter_type:   'total',
    filter_id:     null,
    is_active:     true,
  }
  const { data: r1, error: e1 } = await supabase
    .from('budgets').insert({ ...baseInsert, is_system: true, start_date: null })
    .select().single()
  if (!e1) return r1 as Budget
  const afterFirstFailure = await findSystemMonthlyBudget(year, month)
  if (afterFirstFailure) return afterFirstFailure

  const { data: r2, error: e2 } = await supabase
    .from('budgets').insert({ ...baseInsert, is_system: true })
    .select().single()
  if (!e2) return r2 as Budget
  const afterSecondFailure = await findSystemMonthlyBudget(year, month)
  if (afterSecondFailure) return afterSecondFailure

  const { data: r3, error: e3 } = await supabase
    .from('budgets').insert(baseInsert)
    .select().single()
  if (e3) {
    const afterThirdFailure = await findSystemMonthlyBudget(year, month)
    if (afterThirdFailure) return afterThirdFailure
    throw e3
  }
  return r3 as Budget
}

export async function ensureSystemYearlyBudget(year: number): Promise<Budget> {
  const existing = await findSystemYearlyBudget(year)
  if (existing) return existing

  const { data: prevRows } = await supabase
    .from('budgets')
    .select('target_amount')
    .eq('period_type', 'yearly')
    .eq('year', year - 1)
    .eq('filter_type', 'total')
  const prevList = (prevRows ?? []) as Budget[]
  const prev = prevList.find(isSystemYearlyGoal)
  const defaultAmount = prev?.target_amount ?? 36_000_000

  const baseInsert: Record<string, unknown> = {
    name:          `년간 지출한도 : ${year}년`,
    period_type:   'yearly',
    target_amount: defaultAmount,
    year,
    month:         null,
    end_date:      null,
    filter_type:   'total',
    filter_id:     null,
    is_active:     true,
  }
  const { data: r1, error: e1 } = await supabase
    .from('budgets').insert({ ...baseInsert, is_system: true, start_date: null })
    .select().single()
  if (!e1) return r1 as Budget
  const afterFirstFailure = await findSystemYearlyBudget(year)
  if (afterFirstFailure) return afterFirstFailure

  const { data: r2, error: e2 } = await supabase
    .from('budgets').insert({ ...baseInsert, is_system: true })
    .select().single()
  if (!e2) return r2 as Budget
  const afterSecondFailure = await findSystemYearlyBudget(year)
  if (afterSecondFailure) return afterSecondFailure

  const { data: r3, error: e3 } = await supabase
    .from('budgets').insert(baseInsert)
    .select().single()
  if (e3) {
    const afterThirdFailure = await findSystemYearlyBudget(year)
    if (afterThirdFailure) return afterThirdFailure
    throw e3
  }
  return r3 as Budget
}

// ── CRUD ────────────────────────────────────────────────────────

export async function createBudget(data: Omit<Budget, 'id' | 'created_at'>): Promise<Budget> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { is_system, start_date, ...base } = data

  const { data: r1, error: e1 } = await supabase
    .from('budgets').insert({ ...base, start_date }).select().single()
  if (!e1) return r1 as Budget

  const { data: r2, error: e2 } = await supabase
    .from('budgets').insert(base).select().single()
  if (e2) throw e2
  return r2 as Budget
}

export async function updateBudget(id: string, data: Partial<Omit<Budget, 'id' | 'created_at'>>): Promise<Budget> {
  const { data: updated, error } = await supabase
    .from('budgets')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return updated as Budget
}

export async function deleteBudget(id: string): Promise<void> {
  const { error } = await supabase.from('budgets').delete().eq('id', id)
  if (error) throw error
}

// ── 실제 지출 계산 ──────────────────────────────────────────────

export async function getActualForBudget(budget: Budget): Promise<number> {
  let query = supabase
    .from('transactions')
    .select('amount')
    .eq('type', 'expense')

  if (budget.period_type === 'monthly' && budget.year && budget.month) {
    const mm      = String(budget.month).padStart(2, '0')
    const lastDay = new Date(budget.year, budget.month, 0).getDate()
    query = query.gte('date', `${budget.year}-${mm}-01`).lte('date', `${budget.year}-${mm}-${lastDay}`)
  } else if (budget.period_type === 'yearly' && budget.year) {
    query = query.gte('date', `${budget.year}-01-01`).lte('date', `${budget.year}-12-31`)
  } else if (budget.period_type === 'custom' && budget.start_date && budget.end_date) {
    query = query.gte('date', budget.start_date).lte('date', budget.end_date)
  }

  if (budget.filter_type === 'category'    && budget.filter_id) query = query.eq('category_id',    budget.filter_id)
  if (budget.filter_type === 'subcategory' && budget.filter_id) query = query.eq('subcategory_id', budget.filter_id)
  if (budget.filter_type === 'region'      && budget.filter_id) query = query.eq('region_id',      budget.filter_id)
  if (budget.filter_type === 'tag'         && budget.filter_id) query = query.contains('tag_ids',  [budget.filter_id])

  const { data, error } = await query
  if (error) throw error
  return ((data ?? []) as ActualRow[]).reduce((sum, r) => sum + Number(r.amount), 0)
}

export async function getMonthlyActuals(year: number): Promise<Record<number, number>> {
  const { data, error } = await supabase
    .from('transactions')
    .select('date, amount')
    .eq('type', 'expense')
    .gte('date', `${year}-01-01`)
    .lte('date', `${year}-12-31`)
  if (error) throw error

  const result: Record<number, number> = {}
  for (const tx of (data ?? []) as MonthlyActualRow[]) {
    const m = parseInt(tx.date.slice(5, 7))
    result[m] = (result[m] ?? 0) + Number(tx.amount)
  }
  return result
}
