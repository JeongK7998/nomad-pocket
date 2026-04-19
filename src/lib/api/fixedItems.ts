import { supabase } from '@/lib/supabase'
import type { FixedItem, TransactionType } from '@/types/database'

export async function getFixedItems(type?: TransactionType, activeOnly = true) {
  let query = supabase.from('fixed_items').select('*').order('created_at')
  if (type)       query = query.eq('type', type)
  if (activeOnly) query = query.eq('is_active', true)
  const { data, error } = await query
  if (error) throw error
  return data as FixedItem[]
}

export async function createFixedItem(payload: Omit<FixedItem, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('fixed_items')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data as FixedItem
}

export async function updateFixedItem(id: string, payload: Partial<Omit<FixedItem, 'id' | 'created_at'>>) {
  const { data, error } = await supabase
    .from('fixed_items')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as FixedItem
}

export async function deactivateFixedItem(id: string) {
  const { error } = await supabase
    .from('fixed_items')
    .update({ is_active: false })
    .eq('id', id)
  if (error) throw error
}
