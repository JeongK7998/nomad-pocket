import { supabase } from '@/lib/supabase'
import type { Category, Subcategory, TransactionType } from '@/types/database'

// ─── 대분류 ───────────────────────────────────────────────────────

export async function getCategories(type?: TransactionType) {
  let query = supabase.from('categories').select('*').order('created_at')
  if (type) query = query.eq('type', type)
  const { data, error } = await query
  if (error) throw error
  return data as Category[]
}

export async function createCategory(name: string, type: TransactionType) {
  const { data, error } = await supabase
    .from('categories')
    .insert({ name, type })
    .select()
    .single()
  if (error) throw error
  return data as Category
}

export async function updateCategory(id: string, name: string) {
  const { data, error } = await supabase
    .from('categories')
    .update({ name })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Category
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}

// ─── 소분류 ───────────────────────────────────────────────────────

export async function getSubcategories(categoryId?: string) {
  let query = supabase.from('subcategories').select('*').order('created_at')
  if (categoryId) query = query.eq('category_id', categoryId)
  const { data, error } = await query
  if (error) throw error
  return data as Subcategory[]
}

export async function createSubcategory(categoryId: string, name: string) {
  const { data, error } = await supabase
    .from('subcategories')
    .insert({ category_id: categoryId, name })
    .select()
    .single()
  if (error) throw error
  return data as Subcategory
}

export async function updateSubcategory(id: string, name: string) {
  const { data, error } = await supabase
    .from('subcategories')
    .update({ name })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Subcategory
}

export async function deleteSubcategory(id: string) {
  const { error } = await supabase.from('subcategories').delete().eq('id', id)
  if (error) throw error
}
