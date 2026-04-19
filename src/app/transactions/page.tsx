'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Pencil, Trash2, Loader2 } from 'lucide-react'
import {
  getTransactions, deleteTransaction, updateTransaction,
  getCategories, getSubcategories,
  getFixedItems,
} from '@/lib/api'
import { getProfiles, type Profile } from '@/lib/api/users'
import { getAvatarColor } from '@/lib/userContext'
import { GlobalTransactionFab } from '@/app/components/layout/GlobalTransactionFab'
import { TransactionInputPopup } from '@/app/components/layout/TransactionInputPopup'
import { formatLocalDate } from '@/lib/date'
import type { Transaction as DBTransaction, Category, Subcategory, FixedItem } from '@/types/database'

const FONT = "font-['Pretendard_Variable',sans-serif]"

type TabType = '지출' | '수입'
type TxMode  = 'YEARLY' | 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'CALENDAR'
const TX_MODES: TxMode[] = ['YEARLY', 'MONTHLY', 'WEEKLY', 'DAILY', 'CALENDAR']

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

// ── 날짜 범위 계산 ────────────────────────────────────────────
function getDateRange(mode: TxMode, year: number, month: number, week: number, day: number) {
  switch (mode) {
    case 'MONTHLY':
      return {
        from: `${year}-${String(month).padStart(2,'0')}-01`,
        to:   `${year}-${String(month).padStart(2,'0')}-${new Date(year,month,0).getDate()}`,
      }
    case 'YEARLY':
      return { from: `${year}-01-01`, to: `${year}-12-31` }
    case 'WEEKLY': {
      const d = new Date(year, month-1, 1)
      d.setDate(d.getDate() + (week-1)*7 - d.getDay())
      const end = new Date(d); end.setDate(d.getDate()+6)
      const iso = (dt: Date) => formatLocalDate(dt)
      return { from: iso(d), to: iso(end) }
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
  authorId?:   string       // 작성자 profile id
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
  }
}

// 고정항목 미입력 → dim 행으로 변환
function fixedItemToRow(item: FixedItem, catMap: Record<string, string>, subMap: Record<string, string>): TxRow {
  return {
    id:          item.id,
    date:        item.day_of_month ? String(item.day_of_month) : '-',
    dayOfWeek:   '',
    typeLabel:   item.type === 'expense' ? '고정지출' : '고정수입',
    mainCat:     catMap[item.category_id]    ?? '-',
    subCat:      subMap[item.subcategory_id] ?? '-',
    desc:        item.description,
    memo:        '미입력',
    amount:      item.amount,
    dim:         true,
    isFixed:     true,
    fixedItemId: item.id,
  }
}

// ── 구분/금액 색상 ────────────────────────────────────────────
const TYPE_COLOR: Record<string, string> = {
  '고정지출': '#A27CDA',
  '고정수입': '#A27CDA',
  '지출':     '#5898FF',
  '수입':     '#FF786B',
}

// ── TableHead ─────────────────────────────────────────────────
function TableHead() {
  return (
    <div className="bg-[#18202a] flex-shrink-0">
      <div className="flex items-center h-[40px] gap-[12px] px-[24px]">
        {[
          { label: '일자',   w: 'w-[36px]  flex-shrink-0 text-center' },
          { label: '구분',   w: 'w-[40px]  flex-shrink-0 text-center' },
          { label: '대분류', w: 'w-[60px]  flex-shrink-0 text-center' },
          { label: '소분류', w: 'w-[60px]  flex-shrink-0 text-center' },
          { label: '내역',   w: 'w-[160px] flex-shrink-0 text-center' },
          { label: '메모',   w: 'flex-1 min-w-0 text-center' },
          { label: '금액',   w: 'w-[100px] flex-shrink-0 text-center' },
          { label: '',       w: 'w-[56px]  flex-shrink-0' },
        ].map(({ label, w }) => (
          <div key={label} className={w}>
            <span className={`${FONT} font-bold text-[10px] text-[#e6e8f1] tracking-[0.9px] uppercase`}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── TxRow 컴포넌트 ────────────────────────────────────────────
function TxRowItem({ row, showBorder, onDelete, onFixedClick, profileMap }: {
  row: TxRow; showBorder: boolean; onDelete: (id: string) => void
  onFixedClick?: (id: string) => void
  profileMap: Record<string, Profile>
}) {
  const author = row.authorId ? profileMap[row.authorId] : undefined
  const authorColor = author ? getAvatarColor(author.id, author.color) : undefined
  const clickable = row.dim && !!onFixedClick
  return (
    <div
      className={`h-[48px] flex-shrink-0 ${showBorder ? 'border-b border-[#d8e9fd]' : ''} ${row.dim ? 'opacity-40' : ''} ${clickable ? 'cursor-pointer hover:opacity-60 transition-opacity' : ''}`}
      onClick={clickable ? () => onFixedClick!(row.fixedItemId!) : undefined}
    >
      <div className="flex items-center h-full gap-[12px] px-[24px] group">

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
          <span className={`${FONT} font-bold text-[10px]`} style={{ color: TYPE_COLOR[row.typeLabel] }}>{row.typeLabel}</span>
        </div>

        {/* 대분류 */}
        <div className="w-[60px] flex-shrink-0 text-center">
          <span className={`${FONT} text-[11px] text-[#18202a]`}>{row.mainCat}</span>
        </div>

        {/* 소분류 */}
        <div className="w-[60px] flex-shrink-0 text-center">
          <span className={`${FONT} text-[11px] text-[#18202a]`}>{row.subCat}</span>
        </div>

        {/* 내역 */}
        <div className="w-[160px] flex-shrink-0 text-center">
          <span className={`${FONT} text-[11px] text-[#18202a] truncate block`}>{row.desc}</span>
        </div>

        {/* 메모 */}
        <div className="flex-1 min-w-0 text-center">
          <span className={`${FONT} text-[11px] text-[#6c7b8e] truncate block`}>{row.memo}</span>
        </div>

        {/* 금액 */}
        <div className="w-[100px] flex-shrink-0 text-right">
          <div className={`${FONT} font-bold text-[12px] text-[#18202a] leading-none`}>{fmt(row.amount)}</div>
          {row.subAmount != null && (
            <div className={`${FONT} text-[10px] text-[#6c7b8e] leading-none mt-[1px]`}>{row.subCurrency} {row.subAmount.toFixed(1)}</div>
          )}
        </div>

        {/* 작성자 뱃지 */}
        {author && authorColor && (
          <span
            style={{ borderColor: authorColor, color: authorColor }}
            className={`${FONT} font-bold text-[8px] border rounded-[3px] px-[3px] py-[1px] bg-transparent leading-none whitespace-nowrap flex-shrink-0`}
          >
            {author.name}
          </span>
        )}

        {/* 수정/삭제 */}
        <div className={`flex items-center gap-[10px] flex-shrink-0 ml-auto ${row.dim ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
          {row.dim ? (
            <span className={`${FONT} text-[10px] text-[#5898ff] font-semibold`}>클릭하여 입력</span>
          ) : (
            <>
              <button className="text-[#c0c8d4] hover:text-[#5898ff] transition-colors p-[2px]"><Pencil size={12} /></button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(row.id) }} className="text-[#c0c8d4] hover:text-[#ff786b] transition-colors p-[2px]"><Trash2 size={12} /></button>
            </>
          )}
        </div>

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
        tab === '지출' ? !it.isIncome : it.isIncome
      )
    : []

  const selectedDow = selectedDay ? new Date(year, month - 1, selectedDay).getDay() : 0

  return (
    <div className="flex gap-[16px] h-full overflow-hidden px-[32px] pb-[16px]">
      {/* 캘린더 그리드 */}
      <div className="flex-1 flex flex-col gap-0 min-w-0 overflow-hidden">
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
      <div className="w-[320px] flex-shrink-0 flex flex-col bg-white rounded-[20px] border border-[rgba(226,232,240,0.6)] shadow-[0px_8px_24px_0px_rgba(25,28,30,0.04)] overflow-hidden">
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
            <div className="flex-1 overflow-y-auto">
              {selectedItems.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className={`${FONT} text-[12px] text-[#c0c8d4]`}>거래 내역이 없습니다</p>
                </div>
              ) : selectedItems.map((it, i) => (
                <div key={i} className={`flex items-center gap-[12px] px-[20px] py-[14px] ${i < selectedItems.length-1 ? 'border-b border-[#f0f2f7]' : ''}`}>
                  <div className="w-[32px] h-[32px] rounded-[10px] flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: it.isIncome ? '#EEF8E8' : '#FFF0EE' }}>
                    <span className={`${FONT} text-[9px] font-bold px-[2px] text-center leading-none`}
                      style={{ color: it.isIncome ? '#99D276' : '#FF786B', maxWidth:28 }}>{it.subCat.slice(0,3)}</span>
                  </div>
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
          <div className="flex-1 flex flex-col items-center justify-center gap-[8px]">
            <div className="w-[48px] h-[48px] rounded-full bg-[#f4f4f7] flex items-center justify-center"><span className="text-[22px]">📅</span></div>
            <p className={`${FONT} font-semibold text-[13px] text-[#18202a]`}>날짜를 선택하세요</p>
            <p className={`${FONT} text-[11px] text-[#6c7b8e] text-center px-[24px]`}>캘린더에서 날짜를 클릭하면<br />거래 내역을 확인할 수 있어요</p>
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
  const [week,  setWeek]  = useState(1)
  const [day,   setDay]   = useState(now.getDate())

  // ── 마스터 데이터 ──────────────────────────────────────────
  const [catMap,     setCatMap]     = useState<Record<string, string>>({})
  const [subMap,     setSubMap]     = useState<Record<string, string>>({})
  const [profileMap, setProfileMap] = useState<Record<string, Profile>>({})

  // ── 거래 데이터 ────────────────────────────────────────────
  const [dbTxs,       setDbTxs]       = useState<DBTransaction[]>([])
  const [fixedItems,  setFixedItems]  = useState<FixedItem[]>([])
  const [loading,     setLoading]     = useState(true)

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

  // ── 마스터 데이터 1회 로드 ─────────────────────────────────
  useEffect(() => {
    Promise.all([getCategories(), getSubcategories(), getProfiles()]).then(([cats, subs, profiles]) => {
      const cm: Record<string,string> = {}; cats.forEach(c => cm[c.id] = c.name)
      const sm: Record<string,string> = {}; subs.forEach(s => sm[s.id] = s.name)
      const pm: Record<string, Profile> = {}; profiles.forEach(p => pm[p.id] = p)
      setCatMap(cm); setSubMap(sm); setProfileMap(pm)
    })
  }, [])

  // ── 거래 + 고정항목 로드 ──────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    const dbType   = tab === '지출' ? 'expense' : 'income'
    const { from, to } = getDateRange(mode, year, month, week, day)
    const [rawTxs, fixed] = await Promise.all([
      getTransactions({ type: dbType, dateFrom: from, dateTo: to }),
      getFixedItems(dbType),
    ])
    const txs = await backfillLegacyFixedLinks(rawTxs, fixed)
    setDbTxs(txs)
    setFixedItems(fixed)
    setLoading(false)
  }, [tab, mode, year, month, week, day, backfillLegacyFixedLinks])

  useEffect(() => { load() }, [load])

  // ── 고정항목 중 미입력 판별 ────────────────────────────────
  // 이번 기간 내에 fixed_item_id로 등록된 거래가 없으면 미입력
  const registeredFixedIds = useMemo(() =>
    new Set(dbTxs.filter(t => t.fixed_item_id).map(t => t.fixed_item_id!)),
    [dbTxs]
  )
  const unregisteredFixed = useMemo(() =>
    fixedItems.filter(f => !registeredFixedIds.has(f.id)),
    [fixedItems, registeredFixedIds]
  )

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
    unregisteredFixed.map(f => fixedItemToRow(f, catMap, subMap)),
    [unregisteredFixed, catMap, subMap]
  )

  // ── 고정항목 팝업 상태 ─────────────────────────────────────
  const [fixedPopupItem, setFixedPopupItem] = useState<FixedItem | null>(null)

  const handleFixedClick = (fixedItemId: string) => {
    const item = fixedItems.find(f => f.id === fixedItemId) ?? null
    setFixedPopupItem(item)
  }

  // fixedItem의 day_of_month + 현재 뷰 년/월로 defaultDate 계산
  const fixedPopupDate = fixedPopupItem
    ? (() => {
        const day = fixedPopupItem.day_of_month ?? new Date().getDate()
        const maxDay = new Date(year, month, 0).getDate()
        const safeDay = Math.min(day, maxDay)
        return `${year}-${String(month).padStart(2,'0')}-${String(safeDay).padStart(2,'0')}`
      })()
    : undefined

  // ── 삭제 ───────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm('이 거래를 삭제하시겠습니까?')) return
    await deleteTransaction(id)
    load()
  }

  // ── 기간 네비게이션 ────────────────────────────────────────
  const navPrev = () => {
    if (mode === 'YEARLY')  { setYear(y => y-1) }
    else if (mode === 'WEEKLY') { setWeek(w => Math.max(1, w-1)) }
    else if (mode === 'DAILY')  { const d = new Date(year,month-1,day-1); setYear(d.getFullYear()); setMonth(d.getMonth()+1); setDay(d.getDate()) }
    else { // MONTHLY, CALENDAR
      if (month === 1) { setMonth(12); setYear(y => y-1) }
      else setMonth(m => m-1)
    }
  }
  const navNext = () => {
    if (mode === 'YEARLY')  { setYear(y => y+1) }
    else if (mode === 'WEEKLY') { setWeek(w => w+1) }
    else if (mode === 'DAILY')  { const d = new Date(year,month-1,day+1); setYear(d.getFullYear()); setMonth(d.getMonth()+1); setDay(d.getDate()) }
    else {
      if (month === 12) { setMonth(1); setYear(y => y+1) }
      else setMonth(m => m+1)
    }
  }

  const navLabel = () => {
    if (mode === 'YEARLY')  return `${year}년`
    if (mode === 'WEEKLY')  return `${year}년 ${week}주차`
    if (mode === 'DAILY')   return `${month}월 ${day}일`
    return `${month}월`
  }

  // 고정항목 섹션 보여줄지 (미입력 있거나 등록된 고정항목이 있을 때)
  const showFixedSection = dimRows.length > 0 || rows.some(r => r.isFixed)

  const fixedRows   = rows.filter(r => r.isFixed)
  const regularRows = rows.filter(r => !r.isFixed)

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* ── 상단 컨트롤 바 ── */}
      <div className="flex-shrink-0 bg-[#f4f4f7] flex flex-col md:flex-row md:items-center md:justify-between px-[16px] md:px-[32px] py-[12px] gap-[8px]">

        {/* 첫 행: 탭 + 기간 네비 */}
        <div className="flex items-center justify-between gap-[12px]">
          {/* 지출/수입 탭 */}
          <div className="relative flex items-center p-[4px] rounded-[9999px]">
            <div aria-hidden className="absolute bg-[#e6e8f1] inset-0 pointer-events-none rounded-[9999px] shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]" />
            {(['지출', '수입'] as TabType[]).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`relative w-[80px] md:w-[100px] flex items-center justify-center py-[8px] rounded-[9999px] transition-all ${tab===t?'bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]':''}`}>
                <span className={`${FONT} text-[12px]`} style={{ fontWeight:tab===t?700:500, color:tab===t?'#004EA7':'#6C7B8E' }}>{t}</span>
              </button>
            ))}
          </div>

          {/* 기간 네비게이션 */}
          <div className="flex items-center gap-[12px] md:gap-[54px]">
            <button onClick={navPrev} className="w-[36px] h-[36px] md:w-[40px] md:h-[40px] flex items-center justify-center rounded-full bg-[#e6e8f1] text-[#18202a] hover:bg-[#d8dae6] transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className={`${FONT} font-bold text-[24px] md:text-[40px] text-black`} style={{ lineHeight:'1.2em' }}>{navLabel()}</span>
            <button onClick={navNext} className="w-[36px] h-[36px] md:w-[40px] md:h-[40px] flex items-center justify-center rounded-full bg-[#e6e8f1] text-[#18202a] hover:bg-[#d8dae6] transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* 모드 토글 (가로 스크롤) */}
        <div className="overflow-x-auto">
          <div className="relative flex items-center p-[4px] rounded-[9999px] w-fit">
            <div aria-hidden className="absolute bg-[#e6e8f1] inset-0 pointer-events-none rounded-[9999px] shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]" />
            {TX_MODES.map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`relative flex-shrink-0 w-[80px] md:w-[100px] flex items-center justify-center py-[8px] rounded-[9999px] transition-all ${mode===m?'bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]':''}`}>
                <span className={`${FONT} text-[11px] md:text-[12px]`} style={{ fontWeight:mode===m?600:500, color:mode===m?'#004EA7':'#6C7B8E' }}>{m}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 컨텐츠 영역 ── */}
      {mode === 'CALENDAR' ? (
        <div className="flex-1 overflow-hidden pt-[12px]">
          <CalendarView year={year} month={month} tab={tab} txs={dbTxs} catMap={catMap} subMap={subMap} />
        </div>
      ) : loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-[#5898ff]" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-[16px] md:px-[32px] pt-[0] pb-[16px] flex flex-col gap-[16px]">

          {/* 고정지출 섹션 */}
          {showFixedSection && (
            <div className="bg-white rounded-[24px] shadow-[0px_8px_24px_0px_rgba(25,28,30,0.04)] border border-[rgba(226,232,240,0.6)] overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-[640px]">
                  <TableHead />
                  <div>
                    {dimRows.map((row, i) => (
                      <TxRowItem key={`dim-${i}`} row={row} showBorder={i < dimRows.length + fixedRows.length - 1} onDelete={handleDelete} onFixedClick={handleFixedClick} profileMap={profileMap} />
                    ))}
                    {fixedRows.map((row, i) => (
                      <TxRowItem key={row.id} row={row} showBorder={i < fixedRows.length - 1} onDelete={handleDelete} profileMap={profileMap} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 일반 거래 섹션 */}
          {regularRows.length === 0 && !showFixedSection ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-[8px] py-[60px]">
              <div className="w-[48px] h-[48px] rounded-full bg-[#f4f4f7] flex items-center justify-center"><span className="text-[22px]">📋</span></div>
              <p className={`${FONT} font-semibold text-[13px] text-[#18202a]`}>거래 내역이 없습니다</p>
              <p className={`${FONT} text-[11px] text-[#6c7b8e]`}>+ 버튼으로 거래를 추가해보세요</p>
            </div>
          ) : regularRows.length > 0 ? (
            <div className="bg-white rounded-[24px] shadow-[0px_8px_24px_0px_rgba(25,28,30,0.04)] border border-[rgba(226,232,240,0.6)] overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-[640px]">
                  <TableHead />
                  <div>
                    {regularRows.map((row, i) => (
                      <TxRowItem key={row.id} row={row} showBorder={i < regularRows.length - 1} onDelete={handleDelete} profileMap={profileMap} />
                    ))}
                  </div>
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
          onClose={() => setFixedPopupItem(null)}
          onSaved={() => { setFixedPopupItem(null); load() }}
        />
      )}
    </div>
  )
}
