import { supabase } from '@/lib/supabase'
import type { PaymentMethod, Region, Tag, Currency } from '@/types/database'

// ─── 지출방식 ──────────────────────────────────────────────────

function isMissingOwnerColumnError(error: unknown) {
  if (!error || typeof error !== 'object') return false
  const maybeError = error as { code?: string; message?: string }
  return maybeError.code === 'PGRST204' && (maybeError.message ?? '').includes("'owner'")
}

function withoutOwner<T extends { owner?: string | null }>(payload: T) {
  const { owner: _owner, ...rest } = payload
  return rest
}

export async function getPaymentMethods() {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .order('created_at')
  if (error) throw error
  return data as PaymentMethod[]
}

export async function createPaymentMethod(payload: { name: string; color: string; initial: string; owner?: string | null }) {
  const normalizedPayload = { ...payload, owner: payload.owner?.trim() || null }
  let { data, error } = await supabase
    .from('payment_methods')
    .insert(normalizedPayload)
    .select()
    .single()

  if (error && isMissingOwnerColumnError(error)) {
    const fallback = await supabase
      .from('payment_methods')
      .insert(withoutOwner(normalizedPayload))
      .select()
      .single()
    data = fallback.data
    error = fallback.error
  }

  if (error) throw error
  return data as PaymentMethod
}

export async function updatePaymentMethod(id: string, payload: Partial<{ name: string; color: string; initial: string; owner: string | null }>) {
  const nextPayload = {
    ...payload,
    ...(payload.owner !== undefined ? { owner: payload.owner?.trim() || null } : {}),
  }
  let { data, error } = await supabase
    .from('payment_methods')
    .update(nextPayload)
    .eq('id', id)
    .select()
    .single()

  if (error && isMissingOwnerColumnError(error)) {
    const fallback = await supabase
      .from('payment_methods')
      .update(withoutOwner(nextPayload))
      .eq('id', id)
      .select()
      .single()
    data = fallback.data
    error = fallback.error
  }

  if (error) throw error
  return data as PaymentMethod
}

export async function deletePaymentMethod(id: string) {
  const { error } = await supabase.from('payment_methods').delete().eq('id', id)
  if (error) throw error
}

// ─── 지역 ─────────────────────────────────────────────────────

export async function getRegions(activeOnly = true) {
  let query = supabase.from('regions').select('*').order('created_at')
  if (activeOnly) query = query.eq('is_active', true)
  const { data, error } = await query
  if (error) throw error
  return data as Region[]
}

export async function createRegion(name: string) {
  const { data, error } = await supabase
    .from('regions')
    .insert({ name, is_active: true })
    .select()
    .single()
  if (error) throw error
  return data as Region
}

export async function updateRegion(id: string, name: string) {
  const { data, error } = await supabase
    .from('regions')
    .update({ name })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Region
}

export async function deleteRegion(id: string) {
  const { error } = await supabase.from('regions').update({ is_active: false }).eq('id', id)
  if (error) throw error
}

export async function restoreRegion(id: string) {
  const { error } = await supabase.from('regions').update({ is_active: true }).eq('id', id)
  if (error) throw error
}

// ─── 태그 ─────────────────────────────────────────────────────

export async function getTags(activeOnly = true) {
  let query = supabase.from('tags').select('*').order('created_at')
  if (activeOnly) query = query.eq('is_active', true)
  const { data, error } = await query
  if (error) throw error
  return data as Tag[]
}

export async function createTag(name: string) {
  const { data, error } = await supabase
    .from('tags')
    .insert({ name, is_active: true })
    .select()
    .single()
  if (error) throw error
  return data as Tag
}

export async function updateTag(id: string, name: string) {
  const { data, error } = await supabase
    .from('tags')
    .update({ name })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Tag
}

export async function deleteTag(id: string) {
  const { error } = await supabase.from('tags').update({ is_active: false }).eq('id', id)
  if (error) throw error
}

export async function restoreTag(id: string) {
  const { error } = await supabase.from('tags').update({ is_active: true }).eq('id', id)
  if (error) throw error
}

// ─── 통화 (공용 — user_id 없음) ───────────────────────────────

export async function getCurrencies(activeOnly = false) {
  let query = supabase.from('currencies').select('*').order('code')
  if (activeOnly) query = query.eq('is_active', true)
  const { data, error } = await query
  if (error) throw error
  return data as Currency[]
}

export async function toggleCurrency(code: string, isActive: boolean) {
  const { data, error } = await supabase
    .from('currencies')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('code', code)
    .select()
    .single()
  if (error) throw error
  return data as Currency
}

export async function createCurrency(payload: { code: string; name: string; symbol: string }) {
  const { data, error } = await supabase
    .from('currencies')
    .insert({ ...payload, is_active: true, updated_at: new Date().toISOString() })
    .select()
    .single()
  if (error) throw error
  return data as Currency
}

export async function deleteCurrency(code: string) {
  const { error } = await supabase.from('currencies').delete().eq('code', code)
  if (error) throw error
}
