import { supabase } from '@/lib/supabase'
import type { Category, Subcategory, TransactionType } from '@/types/database'
import {
  getCategoryColorOverride,
  getSubcategoryEmojiOverride,
  setCategoryColorOverride,
  setSubcategoryEmojiOverride,
} from '@/lib/categoryOverrides'

function isMissingColumnError(error: unknown, column: string) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message?: unknown }).message ?? '')
        : String(error)
  return message.includes(column) || message.includes(`Could not find the '${column}' column`) || message.includes(`column "${column}"`)
}

// ─── 대분류 ───────────────────────────────────────────────────────

export async function getCategories(type?: TransactionType) {
  let query = supabase.from('categories').select('*').order('created_at')
  if (type) query = query.eq('type', type)
  const { data, error } = await query
  if (error) throw error
  return (data as Category[]).map((category) => ({
    ...category,
    color: category.color ?? getCategoryColorOverride(category.id),
  }))
}

export async function createCategory(payload: { name: string; type: TransactionType; color?: string | null }) {
  const { data, error } = await supabase
    .from('categories')
    .insert({ name: payload.name, type: payload.type, color: payload.color ?? null })
    .select()
    .single()
  if (error) {
    if (isMissingColumnError(error, 'color')) {
      const fallback = await supabase
        .from('categories')
        .insert({ name: payload.name, type: payload.type })
        .select()
        .single()
      if (fallback.error) throw fallback.error
      setCategoryColorOverride(fallback.data.id, payload.color ?? null)
      return fallback.data as Category
    }
    throw error
  }
  setCategoryColorOverride(data.id, payload.color ?? null)
  return data as Category
}

export async function updateCategory(id: string, payload: { name: string; color?: string | null }) {
  const { data, error } = await supabase
    .from('categories')
    .update({ name: payload.name, color: payload.color ?? null })
    .eq('id', id)
    .select()
    .single()
  if (error) {
    if (isMissingColumnError(error, 'color')) {
      const fallback = await supabase
        .from('categories')
        .update({ name: payload.name })
        .eq('id', id)
        .select()
        .single()
      if (fallback.error) throw fallback.error
      setCategoryColorOverride(id, payload.color ?? null)
      return fallback.data as Category
    }
    throw error
  }
  setCategoryColorOverride(id, payload.color ?? null)
  return data as Category
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
  setCategoryColorOverride(id, null)
}

// ─── 소분류 ───────────────────────────────────────────────────────

export async function getSubcategories(categoryId?: string) {
  let query = supabase.from('subcategories').select('*').order('created_at')
  if (categoryId) query = query.eq('category_id', categoryId)
  const { data, error } = await query
  if (error) throw error
  return (data as Subcategory[]).map((subcategory) => ({
    ...subcategory,
    emoji: subcategory.emoji ?? getSubcategoryEmojiOverride(subcategory.id),
  }))
}

export async function createSubcategory(categoryId: string, name: string, emoji?: string | null) {
  const { data, error } = await supabase
    .from('subcategories')
    .insert({ category_id: categoryId, name, emoji: emoji ?? null })
    .select()
    .single()
  if (error) {
    if (isMissingColumnError(error, 'emoji')) {
      const fallback = await supabase
        .from('subcategories')
        .insert({ category_id: categoryId, name })
        .select()
        .single()
      if (fallback.error) throw fallback.error
      setSubcategoryEmojiOverride(fallback.data.id, emoji ?? null)
      return fallback.data as Subcategory
    }
    throw error
  }
  setSubcategoryEmojiOverride(data.id, emoji ?? null)
  return data as Subcategory
}

export async function updateSubcategory(id: string, name: string, emoji?: string | null) {
  const { data, error } = await supabase
    .from('subcategories')
    .update({ name, emoji: emoji ?? null })
    .eq('id', id)
    .select()
    .single()
  if (error) {
    if (isMissingColumnError(error, 'emoji')) {
      const fallback = await supabase
        .from('subcategories')
        .update({ name })
        .eq('id', id)
        .select()
        .single()
      if (fallback.error) throw fallback.error
      setSubcategoryEmojiOverride(id, emoji ?? null)
      return fallback.data as Subcategory
    }
    throw error
  }
  setSubcategoryEmojiOverride(id, emoji ?? null)
  return data as Subcategory
}

export async function deleteSubcategory(id: string) {
  const { error } = await supabase.from('subcategories').delete().eq('id', id)
  if (error) throw error
  setSubcategoryEmojiOverride(id, null)
}

export async function countCategoryUsages(id: string) {
  const [
    transactions,
    fixedItems,
    budgets,
  ] = await Promise.all([
    supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('category_id', id),
    supabase.from('fixed_items').select('id', { count: 'exact', head: true }).eq('category_id', id),
    supabase.from('budgets').select('id', { count: 'exact', head: true }).eq('filter_type', 'category').eq('filter_id', id),
  ])

  if (transactions.error) throw transactions.error
  if (fixedItems.error) throw fixedItems.error
  if (budgets.error) throw budgets.error

  return {
    transactions: transactions.count ?? 0,
    fixedItems: fixedItems.count ?? 0,
    budgets: budgets.count ?? 0,
    total: (transactions.count ?? 0) + (fixedItems.count ?? 0) + (budgets.count ?? 0),
  }
}

export async function countSubcategoryUsages(id: string) {
  const [
    transactions,
    fixedItems,
    budgets,
  ] = await Promise.all([
    supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('subcategory_id', id),
    supabase.from('fixed_items').select('id', { count: 'exact', head: true }).eq('subcategory_id', id),
    supabase.from('budgets').select('id', { count: 'exact', head: true }).eq('filter_type', 'subcategory').eq('filter_id', id),
  ])

  if (transactions.error) throw transactions.error
  if (fixedItems.error) throw fixedItems.error
  if (budgets.error) throw budgets.error

  return {
    transactions: transactions.count ?? 0,
    fixedItems: fixedItems.count ?? 0,
    budgets: budgets.count ?? 0,
    total: (transactions.count ?? 0) + (fixedItems.count ?? 0) + (budgets.count ?? 0),
  }
}

export async function replaceSubcategoryReferencesAndDelete(id: string, replacement: { categoryId: string; subcategoryId: string }) {
  const txUpdate = await supabase
    .from('transactions')
    .update({ category_id: replacement.categoryId, subcategory_id: replacement.subcategoryId })
    .eq('subcategory_id', id)
  if (txUpdate.error) throw txUpdate.error

  const fixedUpdate = await supabase
    .from('fixed_items')
    .update({ category_id: replacement.categoryId, subcategory_id: replacement.subcategoryId })
    .eq('subcategory_id', id)
  if (fixedUpdate.error) throw fixedUpdate.error

  const budgetUpdate = await supabase
    .from('budgets')
    .update({ filter_id: replacement.subcategoryId })
    .eq('filter_type', 'subcategory')
    .eq('filter_id', id)
  if (budgetUpdate.error) throw budgetUpdate.error

  await deleteSubcategory(id)
}
