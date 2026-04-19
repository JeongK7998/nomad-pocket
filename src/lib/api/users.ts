import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/database'

export type { Profile }

export async function getProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at')
  if (error) throw error
  return (data ?? []) as Profile[]
}

export async function createProfile(name: string, pinHash?: string, color?: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .insert({ name, pin_hash: pinHash ?? null, color: color ?? null })
    .select()
    .single()
  if (error) throw error
  return data as Profile
}

export async function updateProfile(id: string, updates: { name?: string; pin_hash?: string | null; color?: string | null }): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Profile
}

export async function deleteProfile(id: string): Promise<void> {
  const { error } = await supabase.from('profiles').delete().eq('id', id)
  if (error) throw error
}

// 기존 데이터(user_id = NULL)를 특정 사용자에게 귀속 (최초 사용자 생성 시 마이그레이션용)
export async function migrateExistingData(userId: string): Promise<void> {
  const tables = ['transactions', 'fixed_items', 'budgets', 'categories', 'subcategories', 'payment_methods', 'regions', 'tags']
  for (const table of tables) {
    await supabase.from(table).update({ user_id: userId }).is('user_id', null)
  }
}
