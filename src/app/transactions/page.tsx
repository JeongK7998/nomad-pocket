'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import {
  getTransactions, updateTransaction,
  getCategories, getSubcategories,
  getFixedItems,
  getRegions,
} from '@/lib/api'
import { getProfiles, type Profile } from '@/lib/api/users'
import { getAvatarColor } from '@/lib/userContext'
import { GlobalTransactionFab } from '@/app/components/layout/GlobalTransactionFab'
import { TransactionInputPopup } from '@/app/components/layout/TransactionInputPopup'
import { loadAppSettings, getMonthlyRange, getWeekRange, shiftDate } from '@/lib/appSettings'
import { formatSubcategoryLabel, splitSubcategoryLabel } from '@/lib/subcategoryEmoji'
import type { Transaction as DBTransaction, FixedItem, Region } from '@/types/database'

const FONT = "font-['Pretendard_Variable',sans-serif]"

type TabType = '전체' | '지출' | '수입'
type TxMode  = 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'CALENDAR' | 'REGION'
const TX_MODES: TxMode[] = ['MONTHLY', 'WEEKLY', 'DAILY', 'CALENDAR', 'REGION']

// ── 요일 헬퍼 ────────────────────────────────────────────────
const DOW_KO   = ['일', '월', '화', '수', '목', '금', '토']
const DOW_FULL = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

function dayColor(day: string) {
  if (day === '토요일') return '#5898FF'
  if (day === '일요일') return '#FF786B'
  return '#64748B'
}
function calDayColor(dow: number) {
  if (dow === 0) return '#FF786B'
  if (dow === 6) return '#5898FF'
  return '#18202a'
}
function fmt(n: number)      { return '₩' + n.toLocaleString('ko-KR') }
function fmtShort(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + 'M'
  if (n >= 10_000)    return Math.round(n / 10_000) + '만'
  return n.toLocaleString('ko-KR')
}

function getISOWeekNumber(date: Date) {
  const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = tmp.getUTCDay() || 7
  tmp.setUTCDate(tmp.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1))
  return Math.ceil((((tmp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

// ── 날짜 범위 계산 ────────────────────────────────────────────
function getDateRange(mode: TxMode, year: number, month: number, week: number, day: number, startDay: number, weekStartDay: 0 | 1) {
  switch (mode) {
    case 'MONTHLY':
      return getMonthlyRange(year, month, startDay)
    case 'WEEKLY': {
      const anchor = shiftDate(new Date(year, month - 1, day), (week - 1) * 7)
      return getWeekRange(anchor, weekStartDay)
    }
    case 'DAILY': {
      const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
      return { from: dateStr, to: dateStr }
    }
    case 'CALENDAR':
      return {
        from: `${year}-${String(month).padStart(2,'0')}-01`,
        to:   `${year}-${String(month).padStart(2,'0')}-${new Date(year,month,0).getDate()}`,
      }
    case 'REGION':
      return { from: '1900-01-01', to: '2100-12-31' }
  }
}

// ── UI용 거래 행 타입 ─────────────────────────────────────────
interface TxRow {
  id:          string
  date:        string       // 날짜 숫자 문자열, '' 이면 같은 날짜 継속
  dayOfWeek:   string
  typeLabel:   '고정지출' | '고정수입' | '지출' | '수입'
  mainCat:     string
  subCat:      string
  desc:        string
  memo:        string
  amount:      number
  dim:         boolean      // 고정항목 미입력 상태
  subAmount?:  number       // 외화 원본
  subCurrency?: string
  isFixed:     boolean
  fixedItemId: string | null
  fixedOccurrenceDate?: string
  authorId?:   string       // 작성자 profile id
  importSource?: DBTransaction['import_source']
  importStatus?: DBTransaction['import_status']
  importConfidence?: number | null
}

// DB Transaction → UI TxRow 변환
function toRow(
  tx: DBTransaction,
  catMap: Record<string, string>,
  subMap: Record<string, string>,
  prevDate: string,
): TxRow {
  const d = new Date(tx.date + 'T00:00:00')
  const dayNum = String(d.getDate())
  const dow    = DOW_FULL[d.getDay()]
  const isSameDay = dayNum === prevDate

  return {
    id:          tx.id,
    date:        isSameDay ? '' : dayNum,
    dayOfWeek:   isSameDay ? '' : dow,
    typeLabel:   tx.is_fixed ? (tx.type === 'expense' ? '고정지출' : '고정수입') : (tx.type === 'expense' ? '지출' : '수입'),
    mainCat:     catMap[tx.category_id]    ?? '-',
    subCat:      subMap[tx.subcategory_id] ?? '-',
    desc:        tx.description,
    memo:        tx.memo ?? '',
    amount:      tx.amount,
    dim:         false,
    subAmount:   tx.original_amount ?? undefined,
    subCurrency: tx.currency !== 'KRW' ? tx.currency : undefined,
    isFixed:     tx.is_fixed,
    fixedItemId: tx.fixed_item_id,
    authorId:    tx.user_id ?? undefined,
    importSource: tx.import_source ?? null,
    importStatus: tx.import_status ?? null,
    importConfidence: tx.import_confidence ?? null,
  }
}

// 고정항목 미입력 → dim 행으로 변환
function fixedItemToRow(item: FixedItem, catMap: Record<string, string>, subMap: Record<string, string>, occurrenceDate?: string): TxRow {
  const d = occurrenceDate ? new Date(occurrenceDate + 'T00:00:00') : null
  return {
    id:          occurrenceDate ? `${item.id}:${occurrenceDate}` : item.id,
    date:        d ? String(d.getDate()) : item.day_of_month ? String(item.day_of_month) : '-',
    dayOfWeek:   d ? DOW_FULL[d.getDay()] : '',
    typeLabel:   item.type === 'expense' ? '고정지출' : '고정수입',
    mainCat:     catMap[item.category_id]    ?? '-',
    subCat:      subMap[item.subcategory_id] ?? '-',
    desc:        item.description,
    memo:        '미입력',
    amount:      item.amount,
    dim:         true,
    isFixed:     true,
    fixedItemId: item.id,
    fixedOccurrenceDate: occurrenceDate,
  }
}

function shouldShowGroupBorder(rows: TxRow[], index: number) {
  const next = rows[index + 1]
  if (!next) return false
  return next.date !== ''
}

function toMonthKey(date: string): string {
  return date.slice(0, 7)
}

function addMonths(date: Date, months: number): Date {
  const next = new Date(date)
  next.setMonth(next.getMonth() + months)
  return next
}

function occurrenceDateForMonth(item: FixedItem, year: number, month: number): string {
  const day = item.day_of_month ?? 1
  const maxDay = new Date(year, month, 0).getDate()
  const safeDay = Math.min(day, maxDay)
  return `${year}-${String(month).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`
}

// ── 구분/금액 색상 ────────────────────────────────────────────
const TYPE_COLOR: Record<string, string> = {
  '고정지출': '#A27CDA',
  '고정수입': '#A27CDA',
  '지출':     '#5898FF',
  '수입':     '#FF786B',
}

function amountColor(row: Pick<TxRow, 'typeLabel'>) {
  return row.typeLabel.includes('수입') ? '#5898FF' : '#d40000'
}

function importBadgeLabel(source: TxRow['importSource']) {
  if (source === 'sms') return '문자 자동'
  if (source === 'image') return '사진 자동'
  if (source === 'text') return '텍스트 자동'
  return '자동'
}

// ── TableHead ─────────────────────────────────────────────────
function TableHead({ mobile = false }: { mobile?: boolean }) {
  const columns = mobile
    ? [
        { label: '일자',   w: 'w-[28px] flex-shrink-0 text-center' },
        { label: '구분',   w: 'w-[34px] flex-shrink-0 text-center' },
        { label: '대',     w: 'w-[34px] flex-shrink-0 text-center' },
        { label: '소',     w: 'w-[62px] flex-shrink-0 text-center' },
        { label: '내역',   w: 'flex-1 min-w-0 text-center' },
        { label: '금액',   w: 'w-[72px] flex-shrink-0 text-center' },
      ]
    : [
        { label: '일자',   w: 'w-[36px]  flex-shrink-0 text-center' },
        { label: '구분',   w: 'w-[40px]  flex-shrink-0 text-center' },
        { label: '대분류', w: 'w-[60px]  flex-shrink-0 text-center' },
        { label: '소분류', w: 'w-[78px]  flex-shrink-0 text-center' },
        { label: '내역',   w: 'w-[160px] flex-shrink-0 text-center' },
        { label: '메모',   w: 'flex-1 min-w-[180px] text-center' },
        { label: '금액',   w: 'w-[100px] flex-shrink-0 text-center' },
      ]

  return (
    <div className="bg-[#18202a] flex-shrink-0 rounded-t-[24px] overflow-hidden">
      <div className={`flex items-center ${mobile ? 'h-[32px] gap-[6px] px-[10px]' : 'h-[40px] gap-[12px] px-[24px]'}`}>
        {columns.map(({ label, w }) => (
          <div key={label} className={w}>
            <span className={`${FONT} font-bold text-[#e6e8f1] uppercase ${mobile ? 'text-[10px] tracking-[0.5px]' : 'text-[11px] tracking-[0.9px]'}`}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── TxRow 컴포넌트 ────────────────────────────────────────────
function TxRowItem({ row, showBorder, onEdit, onFixedClick, profileMap }: {
  row: TxRow; showBorder: boolean; onEdit: (id: string) => void
  onFixedClick?: (id: string, occurrenceDate?: string) => void
  profileMap: Record<string, Profile>
}) {
  const author = row.authorId ? profileMap[row.authorId] : undefined
  const authorColor = author ? getAvatarColor(author.id, author.color) : undefined
  const clickable = row.dim ? !!onFixedClick : true
  const showImportBadge = row.importStatus === 'pending_review'

  const typeLabelMobile = (() => {
    if (row.typeLabel === '고정지출') return '고지'
    if (row.typeLabel === '고정수입') return '고수'
    return row.typeLabel
  })()

  return (
    <div
      className={`h-[48px] flex-shrink-0 ${showBorder ? 'border-b border-[#d8e9fd]' : ''} ${row.dim ? 'bg-[#ECF5FF]' : ''} ${clickable ? (row.dim ? 'cursor-pointer hover:bg-[#ECF5FF] transition-colors' : 'cursor-pointer hover:bg-[#f8fbff] transition-colors') : ''}`}
      onClick={clickable ? () => (row.dim ? onFixedClick?.(row.fixedItemId!, row.fixedOccurrenceDate) : onEdit(row.id)) : undefined}
    >
      <div className={`hidden md:flex items-center h-full gap-[12px] px-[24px] ${row.dim ? 'opacity-40' : ''}`}>

        {/* 일자 */}
        <div className="w-[36px] flex-shrink-0 flex flex-col items-center justify-center">
          {row.date ? (
            <>
              <span className={`${FONT} font-normal text-[14px] text-[#18202A]`} style={{ lineHeight:'1.2em' }}>{row.date}</span>
              {row.dayOfWeek && (
                <span className={`${FONT} font-normal text-[10px]`} style={{ lineHeight:'1.2em', color: dayColor(row.dayOfWeek) }}>{row.dayOfWeek}</span>
              )}
            </>
          ) : null}
        </div>

        {/* 구분 */}
        <div className="w-[40px] flex-shrink-0 text-center">
          <span className={`${FONT} font-bold text-[11px]`} style={{ color: TYPE_COLOR[row.typeLabel] }}>{row.typeLabel}</span>
        </div>

        {/* 대분류 */}
        <div className="w-[60px] flex-shrink-0 text-center">
          <span className={`${FONT} block truncate text-[12px] text-[#18202a]`}>{row.mainCat}</span>
        </div>

        {/* 소분류 */}
        <div className="w-[78px] flex-shrink-0 text-left">
          <span className={`${FONT} block truncate whitespace-nowrap text-[12px] text-[#18202a]`}>{row.subCat}</span>
        </div>

        {/* 내역 */}
        <div className="w-[160px] flex-shrink-0 text-left">
          <span className={`${FONT} text-[12px] text-[#18202a] truncate block`}>{row.desc}</span>
        </div>

        {/* 메모 */}
        <div className="flex-1 min-w-[180px] text-left">
          <span className={`${FONT} text-[12px] text-[#6c7b8e] truncate block`}>{row.memo}</span>
        </div>

        {/* 금액 */}
        <div className="w-[100px] flex-shrink-0 text-right">
          <div className={`${FONT} font-bold text-[12px] leading-none`} style={{ color: amountColor(row) }}>{fmt(row.amount)}</div>
          {row.subAmount != null && (
            <div className={`${FONT} text-[10px] text-[#6c7b8e] leading-none mt-[1px]`}>{row.subCurrency} {row.subAmount.toFixed(1)}</div>
          )}
        </div>

        <div className="flex w-[58px] flex-shrink-0 flex-col items-end gap-[2px]">
          {author && authorColor && (
            <span
              style={{ borderColor: authorColor, color: authorColor }}
              className={`${FONT} max-w-full truncate rounded-[3px] border bg-transparent px-[3px] py-[1px] text-[8px] font-bold leading-none`}
            >
              {author.name}
            </span>
          )}
          {showImportBadge && (
            <span className={`${FONT} max-w-full truncate rounded-[3px] border border-[#176bda] bg-[#f2f7ff] px-[3px] py-[1px] text-[8px] font-bold leading-none text-[#176bda]`}>
              {importBadgeLabel(row.importSource)}
            </span>
          )}
        </div>
        {row.dim && <span className={`${FONT} ml-auto text-[10px] text-[#5898ff] font-semibold flex-shrink-0`}>클릭하여 입력</span>}

      </div>

      <div className={`flex md:hidden items-center h-full gap-[6px] px-[10px] ${row.dim ? 'opacity-40' : ''}`}>
        <div className="w-[28px] flex-shrink-0 flex flex-col items-center justify-center">
          {row.date ? (
            <>
              <span className={`${FONT} text-[12px] text-[#18202A] leading-none`}>{row.date}</span>
              {row.dayOfWeek && (
                <span className={`${FONT} text-[8px] leading-none mt-[2px]`} style={{ color: dayColor(row.dayOfWeek) }}>{row.dayOfWeek[0]}</span>
              )}
            </>
          ) : null}
        </div>

        <div className="w-[34px] flex-shrink-0 text-center">
          <span className={`${FONT} block text-[9px] font-bold leading-[10px]`} style={{ color: TYPE_COLOR[row.typeLabel] }}>{typeLabelMobile}</span>
        </div>

        <div className="w-[34px] flex-shrink-0 text-center">
          <span className={`${FONT} block truncate text-[10px] text-[#18202a]`}>{row.mainCat}</span>
        </div>

        <div className="w-[62px] flex-shrink-0 text-left">
          <span className={`${FONT} block truncate whitespace-nowrap text-[10px] text-[#18202a]`}>{row.subCat}</span>
        </div>

        <div className="min-w-0 flex-1 text-center">
          <span className={`${FONT} block truncate text-[10px] text-[#18202a] leading-none`}>{row.desc}</span>
          {author && authorColor ? (
            <span
              style={{ color: authorColor }}
              className={`${FONT} mt-[2px] block truncate text-[8px] font-semibold leading-none`}
            >
              {author.name}
            </span>
          ) : null}
          {showImportBadge ? (
            <span className={`${FONT} mt-[2px] block truncate text-[8px] font-bold leading-none text-[#176bda]`}>
              {importBadgeLabel(row.importSource)}
            </span>
          ) : null}
        </div>

        <div className="w-[72px] flex-shrink-0 text-center">
          <div className={`${FONT} font-bold text-[10px] leading-none`} style={{ color: amountColor(row) }}>{fmt(row.amount)}</div>
          {row.subAmount != null && (
            <div className={`${FONT} text-[8px] text-[#6c7b8e] leading-none mt-[2px] truncate`}>{row.subCurrency} {row.subAmount.toFixed(1)}</div>
          )}
        </div>
      </div>
    </div>
  )
}

function FixedTotalFooter({ rows }: { rows: TxRow[] }) {
  const executedRows = rows.filter((row) => !row.dim)
  const income = executedRows
    .filter((row) => row.typeLabel.includes('수입'))
    .reduce((sum, row) => sum + row.amount, 0)
  const expense = executedRows
    .filter((row) => row.typeLabel.includes('지출'))
    .reduce((sum, row) => sum + row.amount, 0)

  return (
    <div className="flex min-h-[48px] items-center justify-end gap-[18px] border-t border-[#d8e9fd] bg-[#fbfcff] px-[16px] py-[10px] md:px-[24px]">
      {income > 0 && (
        <div className="text-right">
          <p className={`${FONT} text-[10px] font-semibold uppercase tracking-[0.7px] text-[#6c7b8e]`}>고정 수입 실행 합계</p>
          <p className={`${FONT} text-[13px] font-bold text-[#5898FF]`}>{fmt(income)}</p>
        </div>
      )}
      {expense > 0 && (
        <div className="text-right">
          <p className={`${FONT} text-[10px] font-semibold uppercase tracking-[0.7px] text-[#6c7b8e]`}>고정 지출 실행 합계</p>
          <p className={`${FONT} text-[13px] font-bold text-[#d40000]`}>{fmt(expense)}</p>
        </div>
      )}
    </div>
  )
}

function ViewTotalBar({ rows }: { rows: TxRow[] }) {
  const income = rows
    .filter((row) => row.typeLabel.includes('수입'))
    .reduce((sum, row) => sum + row.amount, 0)
  const expense = rows
    .filter((row) => row.typeLabel.includes('지출'))
    .reduce((sum, row) => sum + row.amount, 0)
  const net = income - expense

  return (
    <div className="grid min-h-[56px] flex-shrink-0 grid-cols-3 items-center rounded-[18px] border border-[rgba(226,232,240,0.7)] bg-white px-[16px] shadow-[0px_8px_24px_0px_rgba(25,28,30,0.04)] md:px-[24px]">
      <div>
        <p className={`${FONT} text-[9px] font-semibold uppercase tracking-[0.7px] text-[#6c7b8e] md:text-[10px]`}>Income</p>
        <p className={`${FONT} truncate text-[12px] font-bold text-[#5898FF] md:text-[15px]`}>{fmt(income)}</p>
      </div>
      <div className="border-x border-[#e6e8f1] px-[12px] text-center">
        <p className={`${FONT} text-[9px] font-semibold uppercase tracking-[0.7px] text-[#6c7b8e] md:text-[10px]`}>Expenses</p>
        <p className={`${FONT} truncate text-[12px] font-bold text-[#d40000] md:text-[15px]`}>{fmt(expense)}</p>
      </div>
      <div className="text-right">
        <p className={`${FONT} text-[9px] font-semibold uppercase tracking-[0.7px] text-[#6c7b8e] md:text-[10px]`}>Net</p>
        <p className={`${FONT} truncate text-[12px] font-bold text-[#004EA7] md:text-[15px]`}>{fmt(net)}</p>
      </div>
    </div>
  )
}

// ── 캘린더 뷰 ────────────────────────────────────────────────
interface CalTxData {
  dateNum:    number
  typeLabel:  string
  mainCat:    string
  subCat:     string
  desc:       string
  amount:     number
  isIncome:   boolean
}

function buildCalendar(year: number, month: number) {
  const firstDay    = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const weeks: (number | null)[][] = []
  let week: (number | null)[] = Array(firstDay).fill(null)
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d)
    if (week.length === 7) { weeks.push(week); week = [] }
  }
  if (week.length > 0) { while (week.length < 7) week.push(null); weeks.push(week) }
  return weeks
}

function CalendarView({ year, month, tab, txs, catMap, subMap }: {
  year: number; month: number; tab: TabType
  txs: DBTransaction[]; catMap: Record<string,string>; subMap: Record<string,string>
}) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month
  const weeks = useMemo(() => buildCalendar(year, month), [year, month])

  // 날짜별 집계
  const daySummaries = useMemo(() => {
    const map: Record<number, { income: number; expense: number; items: CalTxData[] }> = {}
    txs.forEach((tx) => {
      const d = new Date(tx.date + 'T00:00:00').getDate()
      if (!map[d]) map[d] = { income: 0, expense: 0, items: [] }
      if (tx.type === 'income') map[d].income  += tx.amount
      else                      map[d].expense += tx.amount
      map[d].items.push({
        dateNum:   d,
        typeLabel: tx.is_fixed ? (tx.type === 'expense' ? '고정지출' : '고정수입') : (tx.type === 'expense' ? '지출' : '수입'),
        mainCat:   catMap[tx.category_id] ?? '-',
        subCat:    subMap[tx.subcategory_id] ?? '-',
        desc:      tx.description,
        amount:    tx.amount,
        isIncome:  tx.type === 'income',
      })
    })
    return map
  }, [txs, catMap, subMap])

  const selectedItems = selectedDay
    ? (daySummaries[selectedDay]?.items ?? []).filter((it) =>
        tab === '전체' ? true : tab === '지출' ? !it.isIncome : it.isIncome
      )
    : []

  const selectedDow = selectedDay ? new Date(year, month - 1, selectedDay).getDay() : 0

  return (
    <div className="flex h-full w-full flex-col gap-[12px] overflow-hidden md:flex-row md:gap-[16px]">
      {/* 캘린더 그리드 */}
      <div className="flex flex-shrink-0 flex-col gap-0 min-w-0 overflow-hidden md:flex-1">
        <div className="grid grid-cols-7 mb-[4px]">
          {DOW_KO.map((d, i) => (
            <div key={d} className="h-[32px] flex items-center justify-center">
              <span className={`${FONT} font-semibold text-[11px]`} style={{ color: i===0?'#FF786B':i===6?'#5898FF':'#6c7b8e' }}>{d}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-[4px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-[4px]">
              {week.map((day, di) => {
                if (!day) return <div key={di} className="aspect-square rounded-[12px]" />
                const dow      = new Date(year, month-1, day).getDay()
                const summary  = daySummaries[day]
                const isToday  = isCurrentMonth && today.getDate() === day
                const isSel    = selectedDay === day
                return (
                  <button key={di} onClick={() => setSelectedDay(isSel ? null : day)}
                    className={`aspect-square flex flex-col rounded-[12px] px-[8px] py-[6px] text-left transition-all overflow-hidden ${isSel ? 'bg-[#004ea7] shadow-[0px_4px_12px_0px_rgba(0,78,167,0.25)]' : 'bg-white hover:bg-[#f4f8ff] border border-[rgba(226,232,240,0.6)]'}`}>
                    <div className="flex items-center justify-between w-full mb-[3px]">
                      <span className={`${FONT} font-bold text-[13px] leading-none`}
                        style={{ color: isSel ? 'white' : isToday ? '#004ea7' : calDayColor(dow) }}>{day}</span>
                      {isToday && !isSel && (
                        <span className={`${FONT} text-[8px] font-bold text-[#004ea7] bg-[#eef4ff] px-[5px] py-[1px] rounded-full leading-none`}>TODAY</span>
                      )}
                    </div>
                    {summary && (
                      <div className="flex flex-col gap-[1px] w-full min-h-0">
                        {summary.income > 0 && <span className={`${FONT} font-medium text-[9px] leading-none truncate`} style={{ color: isSel?'rgba(255,255,255,0.85)':'#5898FF' }}>+{fmtShort(summary.income)}</span>}
                        {summary.expense > 0 && <span className={`${FONT} font-medium text-[9px] leading-none truncate`} style={{ color: isSel?'rgba(255,255,255,0.7)':'#FF786B' }}>-{fmtShort(summary.expense)}</span>}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 상세 패널 */}
      <div className="w-full min-h-[220px] flex-1 flex flex-col bg-white rounded-[20px] border border-[rgba(226,232,240,0.6)] shadow-[0px_8px_24px_0px_rgba(25,28,30,0.04)] overflow-hidden md:w-[320px] md:min-h-0 md:flex-shrink-0">
        {selectedDay ? (
          <>
            <div className="px-[20px] pt-[20px] pb-[14px] border-b border-[#f0f2f7] flex-shrink-0">
              <p className={`${FONT} font-bold text-[22px] leading-none`} style={{ color: calDayColor(selectedDow) }}>{month}월 {selectedDay}일</p>
              <p className={`${FONT} text-[11px] text-[#6c7b8e] mt-[4px]`}>{DOW_FULL[selectedDow]}</p>
              <div className="flex gap-[16px] mt-[12px]">
                {(daySummaries[selectedDay]?.income ?? 0) > 0 && (
                  <div>
                    <p className={`${FONT} text-[9px] text-[#6c7b8e] uppercase tracking-[0.8px]`}>수입</p>
                    <p className={`${FONT} font-bold text-[13px] text-[#5898FF]`}>+{fmt(daySummaries[selectedDay].income)}</p>
                  </div>
                )}
                {(daySummaries[selectedDay]?.expense ?? 0) > 0 && (
                  <div>
                    <p className={`${FONT} text-[9px] text-[#6c7b8e] uppercase tracking-[0.8px]`}>지출</p>
                    <p className={`${FONT} font-bold text-[13px] text-[#FF786B]`}>-{fmt(daySummaries[selectedDay].expense)}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto md:min-h-0">
              {selectedItems.length === 0 ? (
                <div className="flex items-center justify-center py-[28px] md:h-full">
                  <p className={`${FONT} text-[12px] text-[#c0c8d4]`}>거래 내역이 없습니다</p>
                </div>
              ) : selectedItems.map((it, i) => (
                <div key={i} className={`flex items-center gap-[12px] px-[20px] py-[14px] ${i < selectedItems.length-1 ? 'border-b border-[#f0f2f7]' : ''}`}>
                  {(() => {
                    const { emoji, text } = splitSubcategoryLabel(it.subCat)
                    return (
                  <div className="w-[32px] h-[32px] rounded-[10px] flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: it.isIncome ? '#EEF8E8' : '#FFF0EE' }}>
                    <span className={`${FONT} text-center font-bold leading-none ${emoji ? 'text-[17px]' : 'text-[9px]'}`}
                      style={{ color: it.isIncome ? '#99D276' : '#FF786B', maxWidth:28 }}>{emoji ?? text.slice(0,3)}</span>
                  </div>
                    )
                  })()}
                  <div className="flex-1 min-w-0">
                    <p className={`${FONT} font-semibold text-[12px] text-[#18202a] truncate leading-none`}>{it.desc}</p>
                    <p className={`${FONT} text-[10px] text-[#6c7b8e] mt-[3px] leading-none`}>{it.mainCat} · {it.subCat}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`${FONT} font-bold text-[12px] leading-none`} style={{ color: it.isIncome?'#5898FF':'#18202a' }}>
                      {it.isIncome?'+':'-'}{fmt(it.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-start gap-[8px] px-[24px] py-[24px] md:justify-center">
            <div className="w-[48px] h-[48px] rounded-full bg-[#f4f4f7] flex items-center justify-center"><span className="text-[22px]">📅</span></div>
            <p className={`${FONT} font-semibold text-[13px] text-[#18202a]`}>날짜를 선택해 주세요</p>
            <p className={`${FONT} text-[11px] text-[#6c7b8e] text-center`}>캘린더에서 날짜를 클릭하면<br />거래 내역을 확인할 수 있어요</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// ── 메인 페이지 ──────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════
export default function TransactionsPage() {
  const now   = new Date()
  const [tab,   setTab]   = useState<TabType>('지출')
  const [mode,  setMode]  = useState<TxMode>('MONTHLY')
  const [year,  setYear]  = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [week,  _setWeek]  = useState(1)
  const [day,   setDay]   = useState(now.getDate())
  const [monthStartDay, setMonthStartDay] = useState(1)
  const [weekStartDay, setWeekStartDay] = useState<0 | 1>(1)
  const [selectedRegionId, setSelectedRegionId] = useState('')

  // ── 마스터 데이터 ──────────────────────────────────────────
  const [catMap,     setCatMap]     = useState<Record<string, string>>({})
  const [subMap,     setSubMap]     = useState<Record<string, string>>({})
  const [profileMap, setProfileMap] = useState<Record<string, Profile>>({})
  const [regions,    setRegions]    = useState<Region[]>([])

  // ── 거래 데이터 ────────────────────────────────────────────
  const [dbTxs,       setDbTxs]       = useState<DBTransaction[]>([])
  const [fixedItems,  setFixedItems]  = useState<FixedItem[]>([])
  const [loading,     setLoading]     = useState(true)
  const [loadError,   setLoadError]   = useState<string | null>(null)
  const [editingTx,   setEditingTx]   = useState<DBTransaction | null>(null)

  const backfillLegacyFixedLinks = useCallback(async (txs: DBTransaction[], fixed: FixedItem[]) => {
    const fixedByKey = new Map<string, FixedItem[]>()

    for (const item of fixed) {
      const key = [
        item.type,
        item.category_id,
        item.subcategory_id,
        item.description.trim(),
        String(item.day_of_month ?? ''),
      ].join('::')

      const existing = fixedByKey.get(key) ?? []
      existing.push(item)
      fixedByKey.set(key, existing)
    }

    const patched = await Promise.all(
      txs.map(async (tx) => {
        if (!tx.is_fixed || tx.fixed_item_id) return tx

        const txDate = new Date(tx.date + 'T00:00:00')
        const key = [
          tx.type,
          tx.category_id,
          tx.subcategory_id,
          tx.description.trim(),
          String(txDate.getDate()),
        ].join('::')

        const candidates = fixedByKey.get(key) ?? []
        if (candidates.length !== 1) return tx

        const matchedFixed = candidates[0]
        try {
          const updated = await updateTransaction(tx.id, {
            fixed_item_id: matchedFixed.id,
            is_fixed: true,
          })
          return updated
        } catch (error) {
          console.error('Legacy fixed link backfill failed:', error)
          return tx
        }
      })
    )

    return patched
  }, [])

  useEffect(() => {
    const settings = loadAppSettings()
    setMonthStartDay(settings.startDay)
    setWeekStartDay(settings.weekStartDay)
  }, [])

  // ── 마스터 데이터 1회 로드 ─────────────────────────────────
  useEffect(() => {
    Promise.all([getCategories(), getSubcategories(), getProfiles(), getRegions()]).then(([cats, subs, profiles, regionRows]) => {
      const cm: Record<string,string> = {}; cats.forEach(c => cm[c.id] = c.name)
      const sm: Record<string,string> = {}; subs.forEach(s => sm[s.id] = formatSubcategoryLabel(s))
      const pm: Record<string, Profile> = {}; profiles.forEach(p => pm[p.id] = p)
      setCatMap(cm); setSubMap(sm); setProfileMap(pm)
      setRegions(regionRows)
      setSelectedRegionId((current) => current || regionRows[0]?.id || '')
    })
  }, [])

  // ── 거래 + 고정항목 로드 ──────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const dbType   = tab === '전체' ? undefined : tab === '지출' ? 'expense' : 'income'
      const { from, to } = getDateRange(mode, year, month, week, day, monthStartDay, weekStartDay)
      const regionId = mode === 'REGION' ? selectedRegionId : undefined
      const [rawTxs, fixed] = await Promise.all([
        getTransactions({
          type: dbType,
          dateFrom: mode === 'REGION' ? undefined : from,
          dateTo: mode === 'REGION' ? undefined : to,
          regionId,
        }),
        mode === 'REGION' ? Promise.resolve([]) : getFixedItems(dbType),
      ])
      const txs = mode === 'REGION' ? rawTxs : await backfillLegacyFixedLinks(rawTxs, fixed)
      setDbTxs(txs)
      setFixedItems(fixed)
    } catch (error) {
      console.error('Transactions load error:', error)
      setLoadError('거래 내역을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')
      setDbTxs([])
      setFixedItems([])
    } finally {
      setLoading(false)
    }
  }, [tab, mode, year, month, week, day, monthStartDay, weekStartDay, selectedRegionId, backfillLegacyFixedLinks])

  useEffect(() => { load() }, [load])

  const currentRange = useMemo(
    () => getDateRange(mode, year, month, week, day, monthStartDay, weekStartDay),
    [mode, year, month, week, day, monthStartDay, weekStartDay],
  )

  // ── 고정항목 중 미입력 판별 ────────────────────────────────
  // 고정항목은 월별 occurrence 단위로 비교한다.
  const registeredFixedOccurrences = useMemo(() => {
    if (mode === 'REGION') return new Set<string>()
    return new Set(dbTxs.filter(t => t.fixed_item_id).map(t => `${t.fixed_item_id!}:${toMonthKey(t.date)}`))
  }, [dbTxs, mode])
  const unregisteredFixedOccurrences = useMemo(() => {
    if (mode === 'REGION') return []

    const result: Array<{ item: FixedItem; date: string }> = []
    const from = new Date(currentRange.from + 'T00:00:00')
    const to = new Date(currentRange.to + 'T00:00:00')
    const cursor = new Date(from.getFullYear(), from.getMonth(), 1)
    const end = new Date(to.getFullYear(), to.getMonth(), 1)

    while (cursor <= end) {
      const y = cursor.getFullYear()
      const m = cursor.getMonth() + 1
      for (const item of fixedItems) {
        const occurrenceDate = occurrenceDateForMonth(item, y, m)
        if (occurrenceDate < currentRange.from || occurrenceDate > currentRange.to) continue
        if (registeredFixedOccurrences.has(`${item.id}:${occurrenceDate.slice(0, 7)}`)) continue
        result.push({ item, date: occurrenceDate })
      }
      const next = addMonths(cursor, 1)
      cursor.setFullYear(next.getFullYear(), next.getMonth(), 1)
    }

    return result
  }, [currentRange, fixedItems, mode, registeredFixedOccurrences])

  // ── UI 행 변환 ─────────────────────────────────────────────
  const rows: TxRow[] = useMemo(() => {
    const result: TxRow[] = []
    let prevDate = ''
    for (const tx of dbTxs) {
      const d = new Date(tx.date + 'T00:00:00')
      const dayNum = String(d.getDate())
      result.push(toRow(tx, catMap, subMap, prevDate))
      prevDate = dayNum
    }
    return result
  }, [dbTxs, catMap, subMap])

  const dimRows: TxRow[] = useMemo(() =>
    unregisteredFixedOccurrences.map(({ item, date }) => fixedItemToRow(item, catMap, subMap, date)),
    [unregisteredFixedOccurrences, catMap, subMap]
  )

  // ── 고정항목 팝업 상태 ─────────────────────────────────────
  const [fixedPopupItem, setFixedPopupItem] = useState<FixedItem | null>(null)
  const [fixedPopupDateOverride, setFixedPopupDateOverride] = useState<string | undefined>(undefined)

  const handleFixedClick = (fixedItemId: string, occurrenceDate?: string) => {
    const item = fixedItems.find(f => f.id === fixedItemId) ?? null
    setFixedPopupItem(item)
    setFixedPopupDateOverride(occurrenceDate)
  }

  // fixedItem의 day_of_month + 현재 뷰 년/월로 defaultDate 계산
  const fixedPopupDate = fixedPopupItem
    ? fixedPopupDateOverride ?? (() => {
        const day = fixedPopupItem.day_of_month ?? new Date().getDate()
        const maxDay = new Date(year, month, 0).getDate()
        const safeDay = Math.min(day, maxDay)
        return `${year}-${String(month).padStart(2,'0')}-${String(safeDay).padStart(2,'0')}`
      })()
    : undefined

  const handleEdit = (id: string) => {
    const target = dbTxs.find((tx) => tx.id === id) ?? null
    setEditingTx(target)
  }

  // ── 기간 네비게이션 ────────────────────────────────────────
  const navPrev = () => {
    if (mode === 'REGION') return
    if (mode === 'WEEKLY') {
      const d = shiftDate(new Date(year, month - 1, day), -7)
      setYear(d.getFullYear()); setMonth(d.getMonth()+1); setDay(d.getDate())
    }
    else if (mode === 'DAILY')  { const d = shiftDate(new Date(year,month-1,day), -1); setYear(d.getFullYear()); setMonth(d.getMonth()+1); setDay(d.getDate()) }
    else { // MONTHLY, CALENDAR
      if (month === 1) { setMonth(12); setYear(y => y-1) }
      else setMonth(m => m-1)
    }
  }
  const navNext = () => {
    if (mode === 'REGION') return
    if (mode === 'WEEKLY') {
      const d = shiftDate(new Date(year, month - 1, day), 7)
      setYear(d.getFullYear()); setMonth(d.getMonth()+1); setDay(d.getDate())
    }
    else if (mode === 'DAILY')  { const d = shiftDate(new Date(year,month-1,day), 1); setYear(d.getFullYear()); setMonth(d.getMonth()+1); setDay(d.getDate()) }
    else {
      if (month === 12) { setMonth(1); setYear(y => y+1) }
      else setMonth(m => m+1)
    }
  }

  const navLabel = () => {
    if (mode === 'WEEKLY')  {
      const current = new Date(year, month - 1, day)
      return `${getISOWeekNumber(current)}W`
    }
    if (mode === 'DAILY')   return `${month}월 ${day}일`
    return `${month}월`
  }

  const navLabelClassName = () => {
    if (mode === 'MONTHLY' || mode === 'CALENDAR') return 'text-[22px] md:text-[40px]'
    if (mode === 'DAILY') return 'text-[18px] md:text-[30px]'
    if (mode === 'WEEKLY') return 'text-[22px] md:text-[40px]'
    return 'text-[18px] md:text-[28px]'
  }

  const regionSelect = (mobile = false) => (
    <div className="relative h-full w-full">
      <select
        value={selectedRegionId}
        onChange={(event) => setSelectedRegionId(event.target.value)}
        className={`${FONT} h-full w-full appearance-none rounded-[9999px] border-0 bg-[#e6e8f1] pl-[16px] pr-[34px] text-center font-bold text-[#004EA7] outline-none ring-0 ${mobile ? 'text-[13px]' : 'text-[18px]'}`}
        disabled={regions.length === 0}
        aria-label="지역 선택"
      >
        {regions.length === 0 ? (
          <option value="">지역 없음</option>
        ) : regions.map((region) => (
          <option key={region.id} value={region.id}>{region.name}</option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        size={mobile ? 14 : 16}
        className="pointer-events-none absolute right-[14px] top-1/2 -translate-y-1/2 text-[#004EA7]"
      />
    </div>
  )

  // 고정항목 섹션 보여줄지 (미입력 있거나 등록된 고정항목이 있을 때)
  const tableRows = useMemo(() => mode === 'REGION' ? rows.slice(0, 300) : rows, [mode, rows])
  const hiddenRegionRows = mode === 'REGION' ? Math.max(0, rows.length - tableRows.length) : 0
  const showFixedSection = dimRows.length > 0 || tableRows.some(r => r.isFixed)

  const fixedRows   = tableRows.filter(r => r.isFixed)
  const regularRows = tableRows.filter(r => !r.isFixed)
  const visibleFixedRows = [...fixedRows, ...dimRows]

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">

      {/* ── 상단 컨트롤 바 ── */}
      <div className="flex-shrink-0 bg-[#f4f4f7] px-[16px] py-[12px] md:px-[32px] md:py-[8px]">

        <div className="hidden md:grid md:h-[64px] md:grid-cols-[260px_508px_220px] md:items-center md:justify-between md:gap-[20px]">
          <div className="relative flex h-[40px] items-center rounded-[9999px] p-[4px] md:w-[260px] md:justify-self-start">
            <div aria-hidden className="absolute bg-[#e6e8f1] inset-0 pointer-events-none rounded-[9999px] shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]" />
            {(['전체', '지출', '수입'] as TabType[]).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`relative flex h-[32px] w-[80px] items-center justify-center rounded-[9999px] transition-all md:w-[84px] ${tab===t?'bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]':''}`}>
                <span className={`${FONT} text-[12px]`} style={{ fontWeight:tab===t?700:500, color:tab===t?'#004EA7':'#6C7B8E' }}>{t}</span>
              </button>
            ))}
          </div>

          <div className="overflow-x-auto md:overflow-hidden md:w-[508px] md:justify-self-center">
            <div className="relative flex h-[40px] w-fit items-center rounded-[9999px] p-[4px] md:w-full">
              <div aria-hidden className="absolute bg-[#e6e8f1] inset-0 pointer-events-none rounded-[9999px] shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]" />
              {TX_MODES.map((m) => (
                <button key={m} onClick={() => setMode(m)}
                  className={`relative flex h-[32px] w-[80px] flex-shrink-0 items-center justify-center rounded-[9999px] transition-all md:w-[100px] ${mode===m?'bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]':''}`}>
                  <span className={`${FONT} text-[11px] md:text-[12px]`} style={{ fontWeight:mode===m?600:500, color:mode===m?'#004EA7':'#6C7B8E' }}>{m}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-[12px] md:h-[48px] md:w-[220px] md:gap-[12px] md:justify-self-end">
            {mode === 'REGION' ? (
              <div className="relative h-[40px] w-full md:h-[48px]">
                {regionSelect()}
              </div>
            ) : (
              <>
                <button onClick={navPrev} className="w-[36px] h-[36px] md:w-[40px] md:h-[40px] flex items-center justify-center rounded-full bg-[#e6e8f1] text-[#18202a] hover:bg-[#d8dae6] transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <span
                  className={`${FONT} ${navLabelClassName()} min-w-0 flex-1 truncate text-center font-bold text-black md:flex md:h-[48px] md:items-center md:justify-center`}
                  style={{ lineHeight:'1.15em' }}
                >
                  {navLabel()}
                </span>
                <button onClick={navNext} className="w-[36px] h-[36px] md:w-[40px] md:h-[40px] flex items-center justify-center rounded-full bg-[#e6e8f1] text-[#18202a] hover:bg-[#d8dae6] transition-colors">
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-[8px] md:hidden">
          <div className="overflow-x-auto">
            <div className="relative flex h-[40px] w-fit items-center rounded-[9999px] p-[4px]">
              <div aria-hidden className="absolute bg-[#e6e8f1] inset-0 pointer-events-none rounded-[9999px] shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]" />
              {TX_MODES.map((m) => (
                <button key={m} onClick={() => setMode(m)}
                  className={`relative flex h-[32px] w-[80px] flex-shrink-0 items-center justify-center rounded-[9999px] transition-all ${mode===m?'bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]':''}`}>
                  <span className={`${FONT} text-[11px]`} style={{ fontWeight:mode===m?600:500, color:mode===m?'#004EA7':'#6C7B8E' }}>{m}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-[8px]">
            <div className="relative flex h-[36px] items-center rounded-[9999px] p-[4px]">
              <div aria-hidden className="absolute bg-[#e6e8f1] inset-0 pointer-events-none rounded-[9999px] shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]" />
              {(['전체', '지출', '수입'] as TabType[]).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`relative flex h-[28px] w-[52px] items-center justify-center rounded-[9999px] transition-all ${tab===t?'bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]':''}`}>
                  <span className={`${FONT} text-[11px]`} style={{ fontWeight:tab===t?700:500, color:tab===t?'#004EA7':'#6C7B8E' }}>{t}</span>
                </button>
              ))}
            </div>

            <div className="flex h-[36px] min-w-0 flex-1 items-center justify-between gap-[8px]">
              {mode === 'REGION' ? (
                <div className="h-[32px] w-full">
                  {regionSelect(true)}
                </div>
              ) : (
                <>
                  <button onClick={navPrev} className="flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center rounded-full bg-[#e6e8f1] text-[#18202a] transition-colors hover:bg-[#d8dae6]">
                    <ChevronLeft size={15} />
                  </button>
                  <span
                    className={`${FONT} ${navLabelClassName()} min-w-0 flex-1 truncate text-center font-bold text-black`}
                    style={{ lineHeight:'1.1em' }}
                  >
                    {navLabel()}
                  </span>
                  <button onClick={navNext} className="flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center rounded-full bg-[#e6e8f1] text-[#18202a] transition-colors hover:bg-[#d8dae6]">
                    <ChevronRight size={15} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 컨텐츠 영역 ── */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-[#5898ff]" />
        </div>
      ) : loadError ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-[10px] px-[24px] text-center">
          <p className={`${FONT} font-semibold text-[14px] text-[#18202a]`}>{loadError}</p>
          <button
            onClick={load}
            className={`${FONT} rounded-[10px] bg-[#004ea7] px-[18px] py-[10px] text-[13px] font-semibold text-white`}
          >
            다시 불러오기
          </button>
        </div>
      ) : mode === 'CALENDAR' ? (
        <div className="flex-1 min-h-0 overflow-hidden px-[16px] pb-[16px] pt-[12px] md:px-[32px]">
          <CalendarView year={year} month={month} tab={tab} txs={dbTxs} catMap={catMap} subMap={subMap} />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-[16px] overflow-auto px-[16px] pb-[16px] pt-[0] md:px-[32px]">
          <ViewTotalBar rows={rows} />
          {hiddenRegionRows > 0 && (
            <div className={`${FONT} flex-shrink-0 px-[4px] text-right text-[11px] font-medium text-[#6c7b8e]`}>
              최근 300개 거래만 표시 중 · {hiddenRegionRows.toLocaleString('ko-KR')}개 더 있음
            </div>
          )}

          {/* 고정지출 섹션 */}
          {showFixedSection && (
            <div className="w-full flex-shrink-0 overflow-hidden rounded-[24px] border border-[rgba(226,232,240,0.6)] bg-white shadow-[0px_8px_24px_0px_rgba(25,28,30,0.04)]">
              <div className="hidden md:block min-w-[820px]">
                <TableHead />
                <div>
                  {fixedRows.map((row, i) => (
                    <TxRowItem key={row.id} row={row} showBorder={shouldShowGroupBorder(fixedRows, i)} onEdit={handleEdit} profileMap={profileMap} />
                  ))}
                  {fixedRows.length > 0 && dimRows.length > 0 && <div className="h-[1px] bg-[#d8e9fd]" />}
                  {dimRows.map((row, i) => (
                    <TxRowItem key={`dim-${i}`} row={row} showBorder={shouldShowGroupBorder(dimRows, i)} onEdit={handleEdit} onFixedClick={handleFixedClick} profileMap={profileMap} />
                  ))}
                </div>
                <FixedTotalFooter rows={visibleFixedRows} />
              </div>
              <div className="md:hidden">
                <TableHead mobile />
                <div>
                  {fixedRows.map((row, i) => (
                    <TxRowItem key={row.id} row={row} showBorder={shouldShowGroupBorder(fixedRows, i)} onEdit={handleEdit} profileMap={profileMap} />
                  ))}
                  {fixedRows.length > 0 && dimRows.length > 0 && <div className="h-[1px] bg-[#d8e9fd]" />}
                  {dimRows.map((row, i) => (
                    <TxRowItem key={`dim-${i}`} row={row} showBorder={shouldShowGroupBorder(dimRows, i)} onEdit={handleEdit} onFixedClick={handleFixedClick} profileMap={profileMap} />
                  ))}
                </div>
                <FixedTotalFooter rows={visibleFixedRows} />
              </div>
            </div>
          )}

          {/* 일반 거래 섹션 */}
          {regularRows.length === 0 && !showFixedSection ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-[8px] py-[60px]">
              <div className="w-[48px] h-[48px] rounded-full bg-[#f4f4f7] flex items-center justify-center"><span className="text-[22px]">📋</span></div>
              <p className={`${FONT} font-semibold text-[13px] text-[#18202a]`}>거래 내역이 없습니다</p>
              <p className={`${FONT} text-[11px] text-[#6c7b8e]`}>+ 버튼으로 거래를 추가해보세요</p>
            </div>
          ) : regularRows.length > 0 ? (
            <div className="w-full flex-shrink-0 overflow-hidden rounded-[24px] border border-[rgba(226,232,240,0.6)] bg-white shadow-[0px_8px_24px_0px_rgba(25,28,30,0.04)]">
              <div className="hidden md:block min-w-[820px]">
                <TableHead />
                <div>
                  {regularRows.map((row, i) => (
                    <TxRowItem key={row.id} row={row} showBorder={shouldShowGroupBorder(regularRows, i)} onEdit={handleEdit} profileMap={profileMap} />
                  ))}
                </div>
              </div>
              <div className="md:hidden">
                <TableHead mobile />
                <div>
                  {regularRows.map((row, i) => (
                    <TxRowItem key={row.id} row={row} showBorder={shouldShowGroupBorder(regularRows, i)} onEdit={handleEdit} profileMap={profileMap} />
                  ))}
                </div>
              </div>
            </div>
          ) : null}

        </div>
      )}

      <GlobalTransactionFab onSaved={load} />

      {/* 고정항목 입력 팝업 */}
      {fixedPopupItem && (
        <TransactionInputPopup
          fixedItem={fixedPopupItem}
          defaultDate={fixedPopupDate}
          onClose={() => { setFixedPopupItem(null); setFixedPopupDateOverride(undefined) }}
          onSaved={() => { setFixedPopupItem(null); setFixedPopupDateOverride(undefined); load() }}
        />
      )}

      {editingTx && (
        <TransactionInputPopup
          existingTransaction={editingTx}
          onClose={() => setEditingTx(null)}
          onSaved={() => { setEditingTx(null); load() }}
        />
      )}
    </div>
  )
}
