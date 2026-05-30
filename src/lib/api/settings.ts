import { supabase } from '../supabase'
import type { Category, PaymentMethod, Region, Subcategory, Transaction } from '@/types/database'

type ExcelValue = string | number
type ExcelColumn = { header: string; key: string; width?: number }
type ExcelSheet = { name: string; columns: ExcelColumn[]; rows: Record<string, ExcelValue>[] }

function xmlEscape(value: ExcelValue): string {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function columnName(index: number): string {
  let name = ''
  let n = index + 1
  while (n > 0) {
    const remainder = (n - 1) % 26
    name = String.fromCharCode(65 + remainder) + name
    n = Math.floor((n - 1) / 26)
  }
  return name
}

function cellXml(value: ExcelValue, ref: string, styleId?: number): string {
  const style = styleId ? ` s="${styleId}"` : ''
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `<c r="${ref}"${style}><v>${value}</v></c>`
  }
  return `<c r="${ref}" t="inlineStr"${style}><is><t>${xmlEscape(value)}</t></is></c>`
}

function worksheetXml(sheet: ExcelSheet): string {
  const cols = sheet.columns
    .map((column, index) => {
      const width = column.width ?? 16
      const col = index + 1
      return `<col min="${col}" max="${col}" width="${width}" customWidth="1"/>`
    })
    .join('')

  const headerCells = sheet.columns
    .map((column, index) => cellXml(column.header, `${columnName(index)}1`, 1))
    .join('')

  const bodyRows = sheet.rows
    .map((row, rowIndex) => {
      const excelRow = rowIndex + 2
      const cells = sheet.columns
        .map((column, columnIndex) => cellXml(row[column.key] ?? '', `${columnName(columnIndex)}${excelRow}`))
        .join('')
      return `<row r="${excelRow}">${cells}</row>`
    })
    .join('')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <cols>${cols}</cols>
  <sheetData><row r="1">${headerCells}</row>${bodyRows}</sheetData>
</worksheet>`
}

const encoder = new TextEncoder()

function encodeText(value: string): Uint8Array {
  return encoder.encode(value)
}

const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let crc = index
  for (let bit = 0; bit < 8; bit += 1) {
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1
  }
  return crc >>> 0
})

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff
  for (const byte of data) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function dosTimestamp(date = new Date()): { time: number; date: number } {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2)
  const packedDate = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
  return { time, date: packedDate }
}

function writeU16(target: Uint8Array, offset: number, value: number): void {
  target[offset] = value & 0xff
  target[offset + 1] = (value >>> 8) & 0xff
}

function writeU32(target: Uint8Array, offset: number, value: number): void {
  target[offset] = value & 0xff
  target[offset + 1] = (value >>> 8) & 0xff
  target[offset + 2] = (value >>> 16) & 0xff
  target[offset + 3] = (value >>> 24) & 0xff
}

function createZip(files: Record<string, Uint8Array>): Uint8Array {
  const entries = Object.entries(files).map(([path, data]) => ({
    path,
    name: encodeText(path),
    data,
    crc: crc32(data),
  }))
  const { time, date } = dosTimestamp()
  const localSize = entries.reduce((sum, entry) => sum + 30 + entry.name.length + entry.data.length, 0)
  const centralSize = entries.reduce((sum, entry) => sum + 46 + entry.name.length, 0)
  const output = new Uint8Array(localSize + centralSize + 22)
  const centralRecords: { entry: (typeof entries)[number]; offset: number }[] = []

  let offset = 0
  for (const entry of entries) {
    const localOffset = offset
    writeU32(output, offset, 0x04034b50); offset += 4
    writeU16(output, offset, 20); offset += 2
    writeU16(output, offset, 0x0800); offset += 2
    writeU16(output, offset, 0); offset += 2
    writeU16(output, offset, time); offset += 2
    writeU16(output, offset, date); offset += 2
    writeU32(output, offset, entry.crc); offset += 4
    writeU32(output, offset, entry.data.length); offset += 4
    writeU32(output, offset, entry.data.length); offset += 4
    writeU16(output, offset, entry.name.length); offset += 2
    writeU16(output, offset, 0); offset += 2
    output.set(entry.name, offset); offset += entry.name.length
    output.set(entry.data, offset); offset += entry.data.length
    centralRecords.push({ entry, offset: localOffset })
  }

  const centralOffset = offset
  for (const { entry, offset: localOffset } of centralRecords) {
    writeU32(output, offset, 0x02014b50); offset += 4
    writeU16(output, offset, 20); offset += 2
    writeU16(output, offset, 20); offset += 2
    writeU16(output, offset, 0x0800); offset += 2
    writeU16(output, offset, 0); offset += 2
    writeU16(output, offset, time); offset += 2
    writeU16(output, offset, date); offset += 2
    writeU32(output, offset, entry.crc); offset += 4
    writeU32(output, offset, entry.data.length); offset += 4
    writeU32(output, offset, entry.data.length); offset += 4
    writeU16(output, offset, entry.name.length); offset += 2
    writeU16(output, offset, 0); offset += 2
    writeU16(output, offset, 0); offset += 2
    writeU16(output, offset, 0); offset += 2
    writeU16(output, offset, 0); offset += 2
    writeU32(output, offset, 0); offset += 4
    writeU32(output, offset, localOffset); offset += 4
    output.set(entry.name, offset); offset += entry.name.length
  }

  const centralDirectorySize = offset - centralOffset
  writeU32(output, offset, 0x06054b50); offset += 4
  writeU16(output, offset, 0); offset += 2
  writeU16(output, offset, 0); offset += 2
  writeU16(output, offset, entries.length); offset += 2
  writeU16(output, offset, entries.length); offset += 2
  writeU32(output, offset, centralDirectorySize); offset += 4
  writeU32(output, offset, centralOffset); offset += 4
  writeU16(output, offset, 0)

  return output
}

async function createWorkbookBlob(sheets: ExcelSheet[]): Promise<Blob> {

  const workbookSheets = sheets
    .map((sheet, index) => `<sheet name="${xmlEscape(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`)
    .join('')

  const workbookRelationships = sheets
    .map((_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`)
    .join('')

  const worksheetOverrides = sheets
    .map((_, index) => `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`)
    .join('')

  const files: Record<string, Uint8Array> = {
    '[Content_Types].xml': encodeText(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  ${worksheetOverrides}
</Types>`),
    '_rels/.rels': encodeText(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`),
    'xl/workbook.xml': encodeText(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>${workbookSheets}</sheets>
</workbook>`),
    'xl/_rels/workbook.xml.rels': encodeText(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${workbookRelationships}
  <Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`),
    'xl/styles.xml': encodeText(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2"><font/><font><b/></font></fonts>
  <fills count="1"><fill><patternFill patternType="none"/></fill></fills>
  <borders count="1"><border/></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>
</styleSheet>`),
  }

  for (const [index, sheet] of sheets.entries()) {
    files[`xl/worksheets/sheet${index + 1}.xml`] = encodeText(worksheetXml(sheet))
  }

  const zip = createZip(files)
  const buffer = new ArrayBuffer(zip.byteLength)
  new Uint8Array(buffer).set(zip)
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

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

  const categoryRows = (categories ?? []) as Category[]
  const subcategoryRows = (subcategories ?? []) as Subcategory[]
  const paymentMethodRows = (payment_methods ?? []) as PaymentMethod[]
  const regionRows = (regions ?? []) as Region[]
  const transactionRows = (transactions ?? []) as Transaction[]

  const catMap = Object.fromEntries(categoryRows.map(c => [c.id, c.name]))
  const subMap = Object.fromEntries(subcategoryRows.map(s => [s.id, s.name]))
  const pmMap  = Object.fromEntries(paymentMethodRows.map(p => [p.id, p.name]))
  const regMap = Object.fromEntries(regionRows.map(r => [r.id, r.name]))

  return createWorkbookBlob([
    {
      name: '거래내역',
      columns: [
        { header: '날짜', key: 'date', width: 14 },
        { header: '구분', key: 'type', width: 10 },
        { header: '대분류', key: 'category', width: 16 },
        { header: '소분류', key: 'subcategory', width: 16 },
        { header: '내역', key: 'description', width: 24 },
        { header: '메모', key: 'memo', width: 32 },
        { header: '금액', key: 'amount', width: 14 },
        { header: '통화', key: 'currency', width: 10 },
        { header: '원래금액', key: 'originalAmount', width: 14 },
        { header: '지출방식', key: 'paymentMethod', width: 16 },
        { header: '지역', key: 'region', width: 16 },
        { header: '고정항목', key: 'isFixed', width: 10 },
      ],
      rows: transactionRows.map(t => ({
        date: t.date,
        type: t.type === 'expense' ? '지출' : '수입',
        category: catMap[t.category_id] ?? '',
        subcategory: subMap[t.subcategory_id] ?? '',
        description: t.description,
        memo: t.memo ?? '',
        amount: Number(t.amount),
        currency: t.currency,
        originalAmount: t.original_amount === null ? '' : Number(t.original_amount),
        paymentMethod: t.payment_method_id ? (pmMap[t.payment_method_id] ?? '') : '',
        region: t.region_id ? (regMap[t.region_id] ?? '') : '',
        isFixed: t.is_fixed ? 'Y' : 'N',
      })),
    },
    {
      name: '대분류',
      columns: [
        { header: '대분류명', key: 'name', width: 20 },
        { header: '구분', key: 'type', width: 10 },
      ],
      rows: categoryRows.map(c => ({ name: c.name, type: c.type === 'expense' ? '지출' : '수입' })),
    },
    {
      name: '소분류',
      columns: [
        { header: '소분류명', key: 'name', width: 20 },
        { header: '대분류', key: 'category', width: 20 },
      ],
      rows: subcategoryRows.map(s => ({ name: s.name, category: catMap[s.category_id] ?? '' })),
    },
    {
      name: '지출방식',
      columns: [
        { header: '지출방식', key: 'name', width: 20 },
        { header: '소유주', key: 'owner', width: 16 },
        { header: '색상', key: 'color', width: 12 },
        { header: '이니셜', key: 'initial', width: 10 },
      ],
      rows: paymentMethodRows.map(p => ({
        name: p.name,
        owner: p.owner ?? '',
        color: p.color,
        initial: p.initial,
      })),
    },
  ])
}

// ── JSON 데이터 가져오기 ────────────────────────────────────────
export interface ImportResult {
  success: boolean
  message: string
  counts?: Record<string, number>
}

type ImportTable =
  | 'categories'
  | 'subcategories'
  | 'payment_methods'
  | 'regions'
  | 'tags'
  | 'currencies'
  | 'fixed_items'
  | 'budgets'
  | 'transactions'

const IMPORT_TABLES: ImportTable[] = [
  'categories', 'subcategories', 'payment_methods', 'regions',
  'tags', 'currencies', 'fixed_items', 'budgets', 'transactions',
]

const REQUIRED_IMPORT_FIELDS: Record<ImportTable, string[]> = {
  categories: ['id', 'name', 'type'],
  subcategories: ['id', 'category_id', 'name'],
  payment_methods: ['id', 'name', 'color', 'initial'],
  regions: ['id', 'name'],
  tags: ['id', 'name'],
  currencies: ['code', 'name', 'symbol'],
  fixed_items: ['id', 'type', 'category_id', 'subcategory_id', 'description', 'amount'],
  budgets: ['id', 'name', 'target_amount', 'period_type', 'filter_type'],
  transactions: ['id', 'type', 'date', 'category_id', 'subcategory_id', 'description', 'amount', 'currency'],
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasRequiredFields(row: Record<string, unknown>, fields: string[]): boolean {
  return fields.every(field => row[field] !== undefined && row[field] !== null)
}

function parseImportJSON(jsonText: string): ImportResult & { data?: Record<ImportTable, Record<string, unknown>[]> } {
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    return { success: false, message: '올바른 JSON 형식이 아닙니다.' }
  }

  if (!isRecord(parsed) || !isRecord(parsed.data)) {
    return { success: false, message: 'Nomad Pocket 내보내기 파일이 아닙니다.' }
  }

  const importData = {} as Record<ImportTable, Record<string, unknown>[]>

  for (const table of IMPORT_TABLES) {
    const rows = parsed.data[table]
    if (rows === undefined) {
      importData[table] = []
      continue
    }

    if (!Array.isArray(rows)) {
      return { success: false, message: `${table} 데이터는 배열이어야 합니다.` }
    }

    for (const [index, row] of rows.entries()) {
      if (!isRecord(row)) {
        return { success: false, message: `${table} ${index + 1}번째 행 형식이 올바르지 않습니다.` }
      }
      if (!hasRequiredFields(row, REQUIRED_IMPORT_FIELDS[table])) {
        return { success: false, message: `${table} ${index + 1}번째 행에 필수 필드가 없습니다.` }
      }
    }

    importData[table] = rows
  }

  return { success: true, message: '가져오기 파일 검증이 완료되었습니다.', data: importData }
}

export function validateImportJSON(jsonText: string): ImportResult {
  const { data: _data, ...result } = parseImportJSON(jsonText)
  return result
}

export async function importFromJSON(jsonText: string): Promise<ImportResult> {
  const parsed = parseImportJSON(jsonText)
  if (!parsed.success || !parsed.data) return parsed

  const counts: Record<string, number> = {}

  for (const table of IMPORT_TABLES) {
    const rows = parsed.data[table]
    if (!rows || rows.length === 0) continue
    const { error } = await supabase.from(table).upsert(rows as never[], { onConflict: 'id' })
    if (error) {
      return { success: false, message: `${table} 가져오기 실패: ${error.message}` }
    }
    counts[table] = rows.length
  }

  return { success: true, message: '데이터를 성공적으로 가져왔습니다.', counts }
}

async function deleteTables(tables: string[], successMessage: string): Promise<{ success: boolean; message: string }> {
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (error) {
      return { success: false, message: `${table} 삭제 실패: ${error.message}` }
    }
  }

  return { success: true, message: successMessage }
}

// ── 거래 데이터 전체 삭제 ─────────────────────────────────────
export async function deleteAllTransactionData(): Promise<{ success: boolean; message: string }> {
  return deleteTables(
    ['transactions', 'budgets', 'fixed_items'],
    '공유 거래 내역과 예산/고정항목 데이터가 삭제되었습니다.'
  )
}

// ── 설정/마스터 데이터 전체 삭제 ─────────────────────────────
export async function deleteAllConfigurationData(): Promise<{ success: boolean; message: string }> {
  return deleteTables(
    ['subcategories', 'categories', 'payment_methods', 'regions', 'tags'],
    '공유 분류 및 설정 데이터가 삭제되었습니다.'
  )
}
