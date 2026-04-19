import { supabase } from '@/lib/supabase'
import { requireUserId } from '@/lib/userContext'
import type { Transaction, TransactionType } from '@/types/database'

export interface TransactionFilter {
  type?: TransactionType
  dateFrom?: string
  dateTo?: string
  categoryId?: string
  regionId?: string
  tagId?: string
}

export async function getTransactions(filter: TransactionFilter = {}) {
  let query = supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (filter.type)       query = query.eq('type', filter.type)
  if (filter.dateFrom)   query = query.gte('date', filter.dateFrom)
  if (filter.dateTo)     query = query.lte('date', filter.dateTo)
  if (filter.categoryId) query = query.eq('category_id', filter.categoryId)
  if (filter.regionId)   query = query.eq('region_id', filter.regionId)
  if (filter.tagId)      query = query.contains('tag_ids', [filter.tagId])

  const { data, error } = await query
  if (error) throw error
  return data as Transaction[]
}

export async function getTransactionSummary(dateFrom: string, dateTo: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select('type, amount, category_id, subcategory_id, payment_method_id, region_id, tag_ids')
    .gte('date', dateFrom)
    .lte('date', dateTo)

  if (error) throw error
  const rows = data as Pick<Transaction, 'type' | 'amount' | 'category_id' | 'subcategory_id' | 'payment_method_id' | 'region_id' | 'tag_ids'>[]

  const income   = rows.filter(r => r.type === 'income').reduce((s, r) => s + Number(r.amount), 0)
  const expenses = rows.filter(r => r.type === 'expense').reduce((s, r) => s + Number(r.amount), 0)

  return { income, expenses, net: income - expenses, rows }
}

export async function createTransaction(payload: Omit<Transaction, 'id' | 'created_at'>) {
  const uid = requireUserId()
  const { data, error } = await supabase
    .from('transactions')
    .insert({ ...payload, user_id: uid })
    .select()
    .single()
  if (error) throw error
  return data as Transaction
}

export async function updateTransaction(id: string, payload: Partial<Omit<Transaction, 'id' | 'created_at'>>) {
  const { data, error } = await supabase
    .from('transactions')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Transaction
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) throw error
}
