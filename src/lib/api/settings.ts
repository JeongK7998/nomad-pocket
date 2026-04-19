import { supabase } from '../supabase'

// ── 전체 데이터 내보내기 (JSON) ────────────────────────────────
export async function exportAllDataAsJSON(): Promise<string> {
  const [
    { data: categories },
    { data: subcategories },
    { data: payment_methods },
    { data: regions },
    { data: tags },
    { data: currencies },
    { data: transactions },
    { data: fixed_items },
    { data: budgets },
  ] = await Promise.all([
    supabase.from('categories').select('*').order('created_at'),
    supabase.from('subcategories').select('*').order('created_at'),
    supabase.from('payment_methods').select('*').order('created_at'),
    supabase.from('regions').select('*').order('created_at'),
    supabase.from('tags').select('*').order('created_at'),
    supabase.from('currencies').select('*'),
    supabase.from('transactions').select('*').order('date', { ascending: false }),
    supabase.from('fixed_items').select('*').order('created_at'),
    supabase.from('budgets').select('*').order('created_at'),
  ])

  const exportData = {
    version: '1.0.4',
    exportedAt: new Date().toISOString(),
    data: {
      categories: categories ?? [],
      subcategories: subcategories ?? [],
      payment_methods: payment_methods ?? [],
      regions: regions ?? [],
      tags: tags ?? [],
      currencies: currencies ?? [],
      transactions: transactions ?? [],
      fixed_items: fixed_items ?? [],
      budgets: budgets ?? [],
    },
  }

  return JSON.stringify(exportData, null, 2)
}

// ── 전체 데이터 내보내기 (Excel) ───────────────────────────────
export async function exportAllDataAsExcel(): Promise<Blob> {
  const XLSX = await import('xlsx')

  const [
    { data: categories },
    { data: subcategories },
    { data: payment_methods },
    { data: regions },
    { data: transactions },
  ] = await Promise.all([
    supabase.from('categories').select('*').order('created_at'),
    supabase.from('subcategories').select('*').order('created_at'),
    supabase.from('payment_methods').select('*').order('created_at'),
    supabase.from('regions').select('*').order('created_at'),
    supabase.from('transactions').select('*').order('date', { ascending: false }),
  ])

  const catMap = Object.fromEntries((categories ?? []).map((c: { id: string; name: string }) => [c.id, c.name]))
  const subMap = Object.fromEntries((subcategories ?? []).map((s: { id: string; name: string }) => [s.id, s.name]))
  const pmMap  = Object.fromEntries((payment_methods ?? []).map((p: { id: string; name: string }) => [p.id, p.name]))
  const regMap = Object.fromEntries((regions ?? []).map((r: { id: string; name: string }) => [r.id, r.name]))

  const txRows = (transactions ?? []).map((t: {
    date: string; type: string; category_id: string; subcategory_id: string;
    description: string; memo: string | null; amount: number; currency: string;
    original_amount: number | null; payment_method_id: string | null; region_id: string | null;
    is_fixed: boolean;
  }) => ({
    날짜: t.date,
    구분: t.type === 'expense' ? '지출' : '수입',
    대분류: catMap[t.category_id] ?? '',
    소분류: subMap[t.subcategory_id] ?? '',
    내역: t.description,
    메모: t.memo ?? '',
    금액: t.amount,
    통화: t.currency,
    원래금액: t.original_amount ?? '',
    지출방식: t.payment_method_id ? (pmMap[t.payment_method_id] ?? '') : '',
    지역: t.region_id ? (regMap[t.region_id] ?? '') : '',
    고정항목: t.is_fixed ? 'Y' : 'N',
  }))

  const wb = XLSX.utils.book_new()
  const wsTx = XLSX.utils.json_to_sheet(txRows.length > 0 ? txRows : [{}])
  XLSX.utils.book_append_sheet(wb, wsTx, '거래내역')
  const wsCat = XLSX.utils.json_to_sheet(
    (categories ?? []).map((c: { name: string; type: string }) => ({ 대분류명: c.name, 구분: c.type === 'expense' ? '지출' : '수입' }))
  )
  XLSX.utils.book_append_sheet(wb, wsCat, '대분류')
  const wsSub = XLSX.utils.json_to_sheet(
    (subcategories ?? []).map((s: { name: string; category_id: string }) => ({ 소분류명: s.name, 대분류: catMap[s.category_id] ?? '' }))
  )
  XLSX.utils.book_append_sheet(wb, wsSub, '소분류')
  const wsPm = XLSX.utils.json_to_sheet(
    (payment_methods ?? []).map((p: { name: string; color: string; initial: string }) => ({ 지출방식: p.name, 색상: p.color, 이니셜: p.initial }))
  )
  XLSX.utils.book_append_sheet(wb, wsPm, '지출방식')

  const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
  return new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

// ── JSON 데이터 가져오기 ────────────────────────────────────────
export interface ImportResult {
  success: boolean
  message: string
  counts?: Record<string, number>
}

export async function importFromJSON(jsonText: string): Promise<ImportResult> {
  let parsed: { version?: string; data?: Record<string, unknown[]> }
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    return { success: false, message: '올바른 JSON 형식이 아닙니다.' }
  }

  if (!parsed.data) {
    return { success: false, message: 'Nomad Pocket 내보내기 파일이 아닙니다.' }
  }

  const { data } = parsed
  const counts: Record<string, number> = {}

  const tables = [
    'categories', 'subcategories', 'payment_methods', 'regions',
    'tags', 'currencies', 'fixed_items', 'budgets', 'transactions',
  ]

  for (const table of tables) {
    const rows = data[table]
    if (!rows || rows.length === 0) continue
    const { error } = await supabase.from(table).upsert(rows as never[], { onConflict: 'id' })
    if (error) {
      return { success: false, message: `${table} 가져오기 실패: ${error.message}` }
    }
    counts[table] = rows.length
  }

  return { success: true, message: '데이터를 성공적으로 가져왔습니다.', counts }
}

// ── 전체 데이터 삭제 ───────────────────────────────────────────
export async function deleteAllData(): Promise<{ success: boolean; message: string }> {
  const tables = ['transactions', 'budgets', 'fixed_items', 'subcategories', 'categories', 'payment_methods', 'regions', 'tags']

  for (const table of tables) {
    // neq('id', zero-uuid)는 사실상 전체 삭제 (RLS 없는 환경)
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (error) {
      return { success: false, message: `${table} 삭제 실패: ${error.message}` }
    }
  }

  return { success: true, message: '모든 데이터가 삭제되었습니다.' }
}
