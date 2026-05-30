'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { ChevronDown, X, Loader2 } from 'lucide-react'
import IncomeBreakdown from '@/app/components/dashboard/IncomeBreakdown'
import { GlobalTransactionFab } from '@/app/components/layout/GlobalTransactionFab'
import { getCustomGoals, ensureSystemMonthlyBudget, ensureSystemYearlyBudget, getActualForBudget } from '@/lib/api/budgets'
import {
  fetchMasterData, fetchDashboardData, fetchDashboardPaymentDetails, getISOWeek,
  type DashDataset, type DashBar, type MasterData,
  type PaymentDetailItem,
} from '@/lib/api/dashboard'
import { loadAppSettings } from '@/lib/appSettings'
import { recommendSubcategoryEmoji, splitSubcategoryLabel } from '@/lib/subcategoryEmoji'
import type { Region, Tag, Budget } from '@/types/database'

const CashFlowChart = dynamic(
  () => import('@/app/components/dashboard/CashFlowChart'),
  { ssr: false }
)
const ExpenseBreakdown = dynamic(
  () => import('@/app/components/dashboard/ExpenseBreakdown'),
  { ssr: false }
)

// ── 모드 타입 ──────────────────────────────────────────────
type DashMode = 'YEARLY' | 'MONTHLY' | 'WEEKLY' | 'REGION' | 'TAGGING'
const DASH_MODES: DashMode[] = ['YEARLY', 'MONTHLY', 'WEEKLY', 'REGION', 'TAGGING']

const FONT = "font-['Pretendard_Variable',sans-serif]"

// ── 현재 날짜 ──────────────────────────────────────────────
const _today        = new Date()
const CURRENT_YEAR  = _today.getFullYear()
const CURRENT_MONTH = _today.getMonth() + 1
const CURRENT_WEEK  = getISOWeek(_today)

const EMPTY_DATASET: DashDataset = {
  income: 0, expense: 0, net: 0, expBD: [], incBD: [], top5: [], spending: [],
}

type DashboardGoalItem = {
  id: string
  name: string
  target: number
  actual: number
  pct: number
  color: string
  track: string
  leftText: string
  rightText: string
}

const BUDGET_GOAL_SIDE_STYLES = [
  { color: '#004EA7', track: '#D8E9FD' },
  { color: '#FF786B', track: '#E0E0E0' },
] as const

function fmt(n: number) { return '₩' + n.toLocaleString('ko-KR') }

function fmtSubAmount(currency: string, amount: number | null) {
  if (!amount || currency === 'KRW') return null
  return `${currency} ${amount.toLocaleString('ko-KR', { maximumFractionDigits: 1 })}`
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-[24px] shadow-[0px_8px_24px_0px_rgba(25,28,30,0.04)] border border-[rgba(226,232,240,0.6)] overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

function SummaryMetric({
  label,
  amount,
  dotColor,
  amountClassName,
}: {
  label: string
  amount: number
  dotColor: string
  amountClassName: string
}) {
  return (
    <div className="min-w-0 flex-1">
      <div className="mb-[4px] flex items-center gap-[8px]">
        <span className="h-[8px] w-[8px] rounded-full" style={{ backgroundColor: dotColor }} />
        <span className={`${FONT} text-[12px] font-medium text-[#6c7b8e]`}>{label}</span>
      </div>
      <p className={`${FONT} whitespace-nowrap text-[30px] font-bold leading-[1.04] tracking-[-0.06em] ${amountClassName}`}>
        {fmt(amount)}
      </p>
    </div>
  )
}

function MobileSummaryMetric({
  label,
  amount,
  amountClassName,
  labelClassName = 'text-[#6c7b8e]',
}: {
  label: string
  amount: number
  amountClassName: string
  labelClassName?: string
}) {
  return (
    <div className="min-w-0 flex-1">
      <span className={`${FONT} block text-left text-[10px] font-medium leading-[14px] ${labelClassName}`}>{label}</span>
      <span className={`${FONT} mt-[2px] block truncate text-left text-[16px] font-bold leading-[20px] tracking-[-0.04em] ${amountClassName}`}>
        {fmt(amount)}
      </span>
    </div>
  )
}

function MobileBreakdownCard({ title, data }: { title: string; data: DashDataset['expBD'] }) {
  const safeData = data.filter((item) => item.value > 0)

  return (
    <div className="rounded-[20px] border border-[rgba(226,232,240,0.6)] bg-white p-[16px] shadow-[0px_4px_12px_0px_rgba(25,28,30,0.06)]">
      <p className={`${FONT} text-[12px] font-bold uppercase leading-[16px] text-[#18202a]`}>{title}</p>
      <div className="mt-[14px] flex h-[12px] overflow-hidden rounded-full bg-[#e9eef6]">
        {safeData.length === 0 ? (
          <div className="h-full w-full bg-[#e9eef6]" />
        ) : (
          safeData.map((item) => (
            <div
              key={item.name}
              className="h-full"
              style={{ width: `${item.value}%`, backgroundColor: item.color }}
            />
          ))
        )}
      </div>
      <div className="mt-[12px] grid grid-cols-2 gap-x-[12px] gap-y-[8px]">
        {safeData.length === 0 && <span className={`${FONT} text-[11px] text-[#6c7b8e]`}>데이터 없음</span>}
        {safeData.map((item) => (
          <div key={item.name} className="flex min-w-0 items-center gap-[7px]">
            <span className="h-[8px] w-[8px] flex-shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
            <span className={`${FONT} min-w-0 flex-1 truncate text-[11px] font-medium leading-[14px] text-[#18202a]`}>{item.name}</span>
            <span className={`${FONT} flex-shrink-0 text-[11px] font-semibold leading-[14px] text-[#004ea7]`}>{item.value.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DesktopModeToggle({ mode, onChange }: { mode: DashMode; onChange: (mode: DashMode) => void }) {
  return (
    <div className="relative flex h-[40px] items-center rounded-full bg-[#e6e8f1] p-[4px] shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]">
      {DASH_MODES.map((item) => (
        <button
          key={item}
          onClick={() => onChange(item)}
          className={`relative flex h-[32px] w-[100px] items-center justify-center rounded-full px-[24px] text-[12px] transition-all ${
            mode === item
              ? 'bg-white text-[#004ea7] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]'
              : 'text-[#6c7b8e] hover:text-[#18202a]'
          }`}
        >
          <span className={`${FONT} font-semibold leading-none`}>{item}</span>
        </button>
      ))}
    </div>
  )
}

// ── Budget Goal Progress ───────────────────────────────────
function BudgetGoalProgress({ goals, mobile = false }: { goals: DashboardGoalItem[]; mobile?: boolean }) {
  const [slide, setSlide] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const pages = Math.max(1, Math.ceil(goals.length / 2))

  useEffect(() => {
    setSlide((current) => Math.min(current, pages - 1))
  }, [pages])

  const handleTouchEnd = (clientX: number) => {
    if (touchStartX.current === null) return
    const deltaX = touchStartX.current - clientX
    touchStartX.current = null
    if (Math.abs(deltaX) < 40) return
    setSlide((current) => {
      if (deltaX > 0) return Math.min(current + 1, pages - 1)
      return Math.max(current - 1, 0)
    })
  }

  if (mobile) {
    return (
      <div className="bg-white rounded-[24px] shadow-[0px_8px_24px_0px_rgba(25,28,30,0.04)] border border-[rgba(226,232,240,0.6)] p-[20px] flex flex-col gap-[16px]">
        <p className={`${FONT} font-bold text-[12px] text-[#18202a] uppercase`}>Budget Goal Progress</p>
        {goals.length === 0 && <p className={`${FONT} text-[12px] text-[#6c7b8e]`}>표시할 목표가 없습니다</p>}
        {goals.map((goal, index) => {
          const style = BUDGET_GOAL_SIDE_STYLES[index % 2]
          return (
            <div key={goal.name} className="flex flex-col gap-[8px]">
              <div className="flex items-end justify-between">
                <div className="flex flex-col gap-[2px]">
                  <p className={`${FONT} font-semibold text-[14px] text-[#18202a] leading-none`}>{goal.name}</p>
                  <p className={`${FONT} font-normal text-[10px] text-[#6c7b8e] leading-none`}>Target: {fmt(goal.target)}</p>
                </div>
                <p className={`${FONT} font-bold text-[18px] leading-none`} style={{ color: style.color }}>{goal.pct}%</p>
              </div>
              <div className="rounded-full overflow-hidden" style={{ height: 10, backgroundColor: style.track }}>
                <div className="h-full rounded-full" style={{ width: `${Math.min(goal.pct, 100)}%`, backgroundColor: style.color }} />
              </div>
              <div className="flex justify-between">
                <p className={`${FONT} font-medium text-[10px] text-[#6c7b8e]`}>{goal.leftText}</p>
                <p className={`${FONT} font-medium text-[10px] text-[#6c7b8e]`}>{goal.rightText}</p>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const visible = goals.slice(slide * 2, slide * 2 + 2)
  return (
    <div
      className="bg-white rounded-[24px] shadow-[0px_8px_24px_0px_rgba(25,28,30,0.04)] border border-[rgba(226,232,240,0.6)] p-[24px] flex flex-col justify-between h-full"
      onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null }}
      onTouchCancel={() => { touchStartX.current = null }}
      onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
    >
      <div className="flex items-center justify-between flex-shrink-0">
        <p className={`${FONT} font-bold text-[12px] text-[#18202a] leading-none uppercase`}>Budget Goal Progress</p>
        <div className="flex gap-[8px]">
          {Array.from({ length: pages }).map((_, i) => (
            <button key={i} onClick={() => setSlide(i)}
              className={`w-[20px] h-[20px] rounded-full flex items-center justify-center transition-colors ${i === slide ? 'bg-[#004ea7]' : 'bg-[#e6e8f1]'}`}>
              <span className={`${FONT} font-bold text-[14px] leading-none ${i === slide ? 'text-white' : 'text-[#18202a]'}`}>{i + 1}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-[48px]">
        {visible.map((goal, index) => {
          const style = BUDGET_GOAL_SIDE_STYLES[index]
          return (
            <div key={goal.name} className="flex-1 flex flex-col gap-[8px]">
              <div className="flex items-end justify-between">
                <div className="flex flex-col gap-[2px]">
                  <p className={`${FONT} font-semibold text-[14px] text-[#18202a] leading-none`}>{goal.name}</p>
                  <p className={`${FONT} font-normal text-[10px] text-[#6c7b8e] leading-none`}>Target: {fmt(goal.target)}</p>
                </div>
                <p className={`${FONT} font-bold text-[18px] leading-none`} style={{ color: style.color }}>{goal.pct}%</p>
              </div>
              <div className="rounded-[9999px] overflow-hidden flex-shrink-0" style={{ height: 12, backgroundColor: style.track }}>
                <div className="h-full rounded-[9999px]" style={{ width: `${Math.min(goal.pct, 100)}%`, backgroundColor: style.color }} />
              </div>
              <div className="flex justify-between">
                <p className={`${FONT} font-medium text-[10px] text-[#6c7b8e]`}>{goal.leftText}</p>
                <p className={`${FONT} font-medium text-[10px] text-[#6c7b8e]`}>{goal.rightText}</p>
              </div>
            </div>
          )
        })}
        {visible.length === 1 && <div className="flex-1" />}
      </div>
    </div>
  )
}

// ── Top 5 Payment 카드 ────────────────────────────────────
function Top5Payment({ data, onSelect }: { data: DashDataset['top5']; onSelect?: (item: DashDataset['top5'][number]) => void }) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[10px] bg-[#18202A] px-[18px] py-[18px]">
      <span className={`${FONT} block w-full text-left font-bold text-[12px] text-white uppercase tracking-[0.02em]`} style={{ lineHeight: '15px' }}>
        Top 5 Payment
      </span>
      <div className="mt-[24px] flex w-full flex-col gap-[12px]">
        {data.length === 0 && <span className="text-[#6c7b8e] text-[11px]">데이터 없음</span>}
        {data.map((item) => (
          <button
            key={item.id ?? item.name}
            type="button"
            onClick={() => onSelect?.(item)}
            className="flex items-center gap-[12px] rounded-[6px] text-left transition-colors hover:bg-[rgba(255,255,255,0.08)]"
          >
            <div className="flex-shrink-0 flex items-center justify-center rounded-[4px]"
              style={{ width: 48, height: 30, backgroundColor: item.color, boxShadow: '2px 2px 5px 0px rgba(0,0,0,0.1)' }}>
              <span className={`${FONT} font-bold text-[24px] text-white`} style={{ lineHeight: '15px' }}>{item.initial}</span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-start justify-center gap-[2px]">
              <div className="flex min-w-0 items-center gap-[6px]">
                <span className={`${FONT} truncate text-[12px] font-bold text-[#5898FF]`} style={{ lineHeight: '15px' }}>{item.name}</span>
                <span className={`${FONT} whitespace-nowrap text-[12px] font-normal text-[#D8E9FD]`} style={{ lineHeight: '15px' }}>
                  {item.person ?? '종일'}
                </span>
              </div>
              <span className={`${FONT} text-[10px] font-normal text-[#D8E9FD]`} style={{ lineHeight: '15px' }}>{fmt(item.amount)}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Top Spending 카드 ─────────────────────────────────────
function TopSpending({ data, scrollable = true }: { data: DashDataset['spending']; scrollable?: boolean }) {
  const iconBgPalette = ['#F5E3D4', '#DCEBFF', '#DBF0D1', '#F9E0D8', '#E5DDFF', '#F7E8C9']
  const visibleData = data.slice(0, 12)

  return (
    <div className="bg-white rounded-[24px] shadow-[0px_8px_24px_0px_rgba(25,28,30,0.04)] border border-[rgba(226,232,240,0.6)] p-[24px] flex flex-col overflow-hidden">
      <div className={`${FONT} font-bold text-[12px] text-[#18202a] uppercase flex-shrink-0`} style={{ lineHeight: '1.333em' }}>
        Top Spending
      </div>
      <div className={`${scrollable ? 'flex-1 min-h-0 overflow-y-auto' : ''} flex flex-col gap-[13px] mt-[24px]`}>
        {visibleData.length === 0 && <span className="text-[#6c7b8e] text-[12px]">데이터 없음</span>}
        {visibleData.map((item, i) => {
          const { emoji, text: label } = splitSubcategoryLabel(item.name)
          const displayEmoji = emoji ?? recommendSubcategoryEmoji(label)
          const textColor = i < 5 ? '#004EA7' : '#18202A'
          return (
            <div key={item.rank} className="flex items-center gap-[6px]">
              <span className={`${FONT} font-bold text-[12px] text-[#6C7B8E] w-[18px] flex-shrink-0`}>{String(item.rank).padStart(2, '0')}</span>
              <div
                className="flex h-[20px] w-[20px] flex-shrink-0 items-center justify-center rounded-[6px] text-[12px]"
                style={{
                  backgroundColor: iconBgPalette[i % iconBgPalette.length],
                  fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
                }}
              >
                {displayEmoji}
              </div>
              <span className={`${FONT} font-bold text-[14px] flex-1 truncate`} style={{ color: textColor }}>{label}</span>
              <span className={`${FONT} font-normal text-[14px] flex-shrink-0 text-[#004EA7]`}>{fmt(item.amount)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PaymentDetailModal({
  payment,
  items,
  loading,
  onClose,
}: {
  payment: DashDataset['top5'][number]
  items: PaymentDetailItem[]
  loading: boolean
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-[16px] backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="flex max-h-[80vh] w-full max-w-[680px] flex-col overflow-hidden rounded-[24px] bg-white shadow-[0px_24px_64px_0px_rgba(25,28,30,0.18)]">
        <div className="flex items-start justify-between border-b border-[#f0f2f7] px-[24px] pb-[16px] pt-[20px]">
          <div>
            <p className={`${FONT} text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6c7b8e]`}>Top 5 Payment Detail</p>
            <h3 className={`${FONT} mt-[6px] text-[22px] font-bold text-[#18202a]`}>{payment.name}</h3>
            <p className={`${FONT} mt-[4px] text-[12px] text-[#6c7b8e]`}>총 사용금액 {fmt(payment.amount)}</p>
          </div>
          <button onClick={onClose} className="flex h-[36px] w-[36px] items-center justify-center rounded-full text-[#6c7b8e] transition-colors hover:bg-[#f4f4f7]">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-[24px] py-[18px]">
          {loading ? (
            <div className="flex h-[220px] items-center justify-center">
              <Loader2 size={24} className="animate-spin text-[#5898ff]" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-[220px] items-center justify-center">
              <p className={`${FONT} text-[13px] text-[#6c7b8e]`}>표시할 사용 내역이 없습니다</p>
            </div>
          ) : (
            <div className="flex flex-col gap-[12px]">
              {items.map((item) => (
                <div key={item.id} className="rounded-[18px] border border-[#edf1f7] bg-[#fafbfd] px-[18px] py-[14px]">
                  <div className="flex items-start justify-between gap-[16px]">
                    <div className="min-w-0 flex-1">
                      <p className={`${FONT} text-[15px] font-semibold text-[#18202a]`}>{item.description}</p>
                      <p className={`${FONT} mt-[4px] text-[12px] text-[#6c7b8e]`}>{item.date} · {item.categoryName} · {item.subcategoryName}</p>
                      {item.memo ? <p className={`${FONT} mt-[6px] text-[12px] text-[#8a97a8]`}>{item.memo}</p> : null}
                    </div>
                    <div className="text-right">
                      <p className={`${FONT} text-[15px] font-bold text-[#004ea7]`}>{fmt(item.amount)}</p>
                      {fmtSubAmount(item.currency, item.originalAmount) ? (
                        <p className={`${FONT} mt-[4px] text-[11px] text-[#6c7b8e]`}>{fmtSubAmount(item.currency, item.originalAmount)}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function toDashboardGoal(goal: Budget, actual: number): DashboardGoalItem {
  const pct = goal.target_amount > 0 ? Math.round((actual / goal.target_amount) * 100) : 0
  const over = actual > goal.target_amount
  const remaining = goal.target_amount - actual

  return {
    id: goal.id,
    name: goal.name,
    target: goal.target_amount,
    actual,
    pct,
    color: over ? '#d40000' : pct >= 100 ? '#99d276' : '#004EA7',
    track: '#D8E9FD',
    leftText: `Spent ${fmt(actual)}`,
    rightText: over ? `${fmt(Math.abs(remaining))} Over` : `${fmt(remaining)} Left`,
  }
}

// ── Dashboard 페이지 ────────────────────────────────────────
export default function DashboardPage() {
  const [mode,     setMode]     = useState<DashMode>('MONTHLY')
  const [weekPage, setWeekPage] = useState(0)

  const [master,  setMaster]  = useState<Pick<MasterData, 'categories' | 'subcategories' | 'paymentMethods'> | null>(null)
  const [regions, setRegions] = useState<Region[]>([])
  const [tags,    setTags]    = useState<Tag[]>([])

  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null)
  const [selectedTag,    setSelectedTag]    = useState<Tag | null>(null)

  const [dataset, setDataset] = useState<DashDataset>(EMPTY_DATASET)
  const [bars,    setBars]    = useState<DashBar[]>([])
  const [goalItems, setGoalItems] = useState<DashboardGoalItem[]>([])
  const [selectedPayment, setSelectedPayment] = useState<DashDataset['top5'][number] | null>(null)
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetailItem[]>([])
  const [paymentDetailsLoading, setPaymentDetailsLoading] = useState(false)
  const [periodSettings, setPeriodSettings] = useState(() => ({ startDay: 1, weekStartDay: 1 as 0 | 1 }))

  const MAX_WEEK_PAGE = Math.floor((CURRENT_WEEK - 1) / 12)

  useEffect(() => {
    const settings = loadAppSettings()
    setPeriodSettings({ startDay: settings.startDay, weekStartDay: settings.weekStartDay })
    setMode(settings.dashboardDefaultMode)
  }, [])

  useEffect(() => {
    fetchMasterData().then((data) => {
      setMaster({ categories: data.categories, subcategories: data.subcategories, paymentMethods: data.paymentMethods })
      setRegions(data.regions)
      setTags(data.tags)
      if (data.regions.length > 0) setSelectedRegion(data.regions[0])
      if (data.tags.length   > 0) setSelectedTag(data.tags[0])
    }).catch(console.error)
  }, [])

  const loadData = useCallback(async () => {
    if (!master) return
    try {
      const result = await fetchDashboardData({
        mode, year: CURRENT_YEAR, month: CURRENT_MONTH, week: CURRENT_WEEK, weekPage,
        monthStartDay: periodSettings.startDay,
        weekStartDay: periodSettings.weekStartDay,
        regionId: selectedRegion?.id ?? null, tagId: selectedTag?.id ?? null, master,
      })
      setDataset(result.dataset)
      setBars(result.bars)
    } catch (e) { console.error('Dashboard data error:', e) }
  }, [master, mode, weekPage, selectedRegion, selectedTag, periodSettings])

  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    if (!selectedPayment?.id || !master) return
    const paymentMethodId = selectedPayment.id
    const paymentMaster = { categories: master.categories, subcategories: master.subcategories }

    let cancelled = false

    async function loadPaymentDetails() {
      setPaymentDetailsLoading(true)
      try {
        const items = await fetchDashboardPaymentDetails({
          mode,
          year: CURRENT_YEAR,
          month: CURRENT_MONTH,
          week: CURRENT_WEEK,
          weekPage,
          monthStartDay: periodSettings.startDay,
          weekStartDay: periodSettings.weekStartDay,
          regionId: selectedRegion?.id ?? null,
          tagId: selectedTag?.id ?? null,
          paymentMethodId,
          master: paymentMaster,
        })
        if (!cancelled) setPaymentDetails(items)
      } catch (error) {
        console.error('Payment detail load error:', error)
        if (!cancelled) setPaymentDetails([])
      } finally {
        if (!cancelled) setPaymentDetailsLoading(false)
      }
    }

    loadPaymentDetails()
    return () => { cancelled = true }
  }, [selectedPayment, master, mode, weekPage, selectedRegion, selectedTag, periodSettings])

  const loadGoals = useCallback(async () => {
    try {
      const [systemMonthly, systemYearly, customGoals] = await Promise.all([
        ensureSystemMonthlyBudget(CURRENT_YEAR, CURRENT_MONTH),
        ensureSystemYearlyBudget(CURRENT_YEAR),
        getCustomGoals(),
      ])

      const goals = [systemYearly, systemMonthly, ...customGoals].filter((goal) => goal.is_active !== false)
      const actualPairs = await Promise.all(
        goals.map(async (goal) => ({ goal, actual: await getActualForBudget(goal) }))
      )

      setGoalItems(
        actualPairs
          .map(({ goal, actual }) => toDashboardGoal(goal, actual))
      )
    } catch (error) {
      console.error('Dashboard goals error:', error)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadInitialGoals() {
      await loadGoals()
      if (cancelled) return
    }

    loadInitialGoals()
    return () => { cancelled = true }
  }, [loadGoals])

  function CurrentModeHeading() {
    const baseNumberCls = `${FONT} font-bold md:text-[48px] text-[36px] leading-none tracking-[-0.05em] text-[#363D4B] md:tracking-normal`
    const baseLabelCls = `${FONT} font-normal md:text-[24px] text-[18px] leading-none text-[#363D4B]`
    const suffixCls = `${baseLabelCls} mb-[4px] md:mb-[6px]`
    const selectorFrameCls = 'relative inline-flex h-[48px] md:h-[60px] items-center rounded-[12px] border border-[#d8e9fd] bg-white pl-[14px] pr-[40px]'
    const selectorTextCls = `${FONT} h-full appearance-none bg-transparent pr-[16px] text-[24px] font-bold leading-none text-[#363D4B] outline-none md:text-[32px]`
    const currentWeekLabel = CURRENT_WEEK - weekPage * 12

    if (mode === 'YEARLY') {
      return (
        <div className="flex items-end gap-[4px]">
          <span className={baseNumberCls}>{CURRENT_YEAR}</span>
          <span className={suffixCls}>년</span>
        </div>
      )
    }

    if (mode === 'MONTHLY') {
      return (
        <div className="flex min-w-[344px] items-end gap-[4px] overflow-visible pl-[6px]">
          <span className={baseNumberCls}>{CURRENT_YEAR}</span>
          <span className={`${suffixCls} mr-[8px]`}>년</span>
          <span className={baseNumberCls}>{String(CURRENT_MONTH).padStart(2, '0')}</span>
          <span className={suffixCls}>월</span>
        </div>
      )
    }

    if (mode === 'WEEKLY') {
      return (
        <div className="flex items-end gap-[4px]">
          <span className={baseNumberCls}>{CURRENT_YEAR}</span>
          <span className={`${suffixCls} mr-[8px]`}>년</span>
          <span className={baseNumberCls}>{String(currentWeekLabel).padStart(2, '0')}</span>
          <span className={suffixCls}>W</span>
        </div>
      )
    }

    const isRegionMode = mode === 'REGION'
    const value = isRegionMode ? (selectedRegion?.id ?? '') : (selectedTag?.id ?? '')
    const options = isRegionMode ? regions : tags
    const onChange = (nextValue: string) => {
      if (isRegionMode) {
        setSelectedRegion(regions.find((r) => r.id === nextValue) ?? null)
        return
      }
      setSelectedTag(tags.find((t) => t.id === nextValue) ?? null)
    }

    return (
      <div className={selectorFrameCls}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={selectorTextCls}
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        <ChevronDown size={18} className="pointer-events-none absolute right-[14px] text-[#6c7b8e]" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col md:overflow-hidden overflow-y-auto">

      {/* ── 헤더 ── */}
      <div className="px-[16px] md:px-[32px] pt-[16px] md:pt-0 pb-[12px] md:pb-0 flex-shrink-0">
        <div className="hidden md:grid md:h-[84px] md:grid-cols-[minmax(0,1fr)_508px] md:items-start md:gap-[24px]">
          <div className="flex h-full min-w-0 items-center overflow-visible">
            <CurrentModeHeading />
          </div>
          <div className="flex h-full items-center justify-end">
            <DesktopModeToggle
              mode={mode}
              onChange={(nextMode) => {
                setMode(nextMode)
                setWeekPage(0)
              }}
            />
          </div>
        </div>

        <div className="flex md:hidden flex-col gap-[4px] justify-start">
          <CurrentModeHeading />
        </div>
      </div>

      {/* 모드 토글 — 모바일 전용 (가로 스크롤) */}
      <div className="flex md:hidden px-[16px] pb-[8px] flex-shrink-0">
        <div className="relative flex items-center p-[4px] rounded-[9999px] overflow-x-auto">
          <div aria-hidden="true" className="absolute bg-[#e6e8f1] inset-0 pointer-events-none rounded-[9999px]" />
          {DASH_MODES.map((m) => (
            <button key={m} onClick={() => { setMode(m); setWeekPage(0) }}
              className={`relative flex-shrink-0 w-[80px] flex items-center justify-center py-[8px] rounded-[9999px] text-[11px] transition-all whitespace-nowrap ${
                mode === m ? 'bg-white text-[#004ea7] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] font-semibold' : 'text-[#6c7b8e] font-medium'
              }`}>
              <span className={`${FONT} leading-[16px]`}>{m}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════
          데스크톱 레이아웃 (md 이상)
      ══════════════════════════════ */}
      <div className="hidden md:flex flex-1 flex-col gap-[24px] px-[32px] pb-[24px] overflow-hidden min-h-0">

        {/* Row 1: 차트 카드 */}
        <div className="flex h-[334px] min-w-0 gap-[24px] overflow-hidden rounded-[24px] border border-[rgba(226,232,240,0.6)] bg-white p-[24px] shadow-[0px_8px_24px_0px_rgba(25,28,30,0.04)]">
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex flex-shrink-0 items-start gap-[48px]">
              <SummaryMetric label="Expenses" amount={dataset.expense} dotColor="#d40000" amountClassName="text-[#18202a]" />
              <SummaryMetric label="Income" amount={dataset.income} dotColor="#004ea7" amountClassName="text-[#7f8ea3]" />
              <SummaryMetric label="Net" amount={dataset.net} dotColor="#ffd6a8" amountClassName="text-[#004ea7]" />
            </div>
            <div className="mt-[18px] min-h-0 flex-1">
              <CashFlowChart
                mode={mode}
                weekPage={weekPage}
                selectedRegion={selectedRegion?.name ?? ''}
                selectedTag={selectedTag?.name ?? ''}
                barsOverride={bars}
                onPrevPage={() => setWeekPage((p) => p + 1)}
                onNextPage={() => setWeekPage((p) => p - 1)}
                canPrevPage={weekPage < MAX_WEEK_PAGE}
                canNextPage={weekPage > 0}
              />
            </div>
          </div>
          <div className="w-[176px] min-h-0 flex-shrink-0">
            <Top5Payment data={dataset.top5} onSelect={(item) => setSelectedPayment(item)} />
          </div>
        </div>

        {/* 하단 섹션 */}
        <div className="flex min-h-0 flex-1 gap-[24px] overflow-hidden">
          <div className="flex min-h-0 flex-1 flex-col gap-[24px] min-w-0">
            <div className="flex h-[264px] min-h-0 gap-[24px]">
              <Card className="p-[24px] flex-1 min-w-0 overflow-hidden"><ExpenseBreakdown data={dataset.expBD} /></Card>
              <Card className="p-[24px] flex-1 min-w-0 overflow-hidden"><IncomeBreakdown data={dataset.incBD} /></Card>
            </div>
            <div className="flex-1 min-h-0"><BudgetGoalProgress goals={goalItems} /></div>
          </div>
          <div className="w-[281px] min-h-0 flex-shrink-0 bg-white rounded-[24px] shadow-[0px_8px_24px_0px_rgba(25,28,30,0.04)] border border-[rgba(226,232,240,0.6)] p-[24px] flex flex-col overflow-hidden">
            <div className={`${FONT} font-bold text-[12px] text-[#18202a] uppercase flex-shrink-0`} style={{ lineHeight: '1.333em' }}>Top Spending</div>
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-[13px] mt-[24px]">
              {dataset.spending.length === 0 && <span className="text-[#6c7b8e] text-[12px]">데이터 없음</span>}
              {dataset.spending.map((item, i) => {
                const { emoji, text: label } = splitSubcategoryLabel(item.name)
                const textColor = i < 5 ? '#004EA7' : '#18202A'
                const iconBgPalette = ['#F5E3D4', '#DCEBFF', '#DBF0D1', '#F9E0D8', '#E5DDFF', '#F7E8C9']
                return (
                  <div key={item.rank} className="flex items-center gap-[6px]">
                    <span className={`${FONT} font-bold text-[12px] text-[#6C7B8E] w-[18px] flex-shrink-0`}>{String(item.rank).padStart(2, '0')}</span>
                    {emoji ? (
                      <div
                        className="flex h-[20px] w-[20px] flex-shrink-0 items-center justify-center rounded-[6px] text-[12px]"
                        style={{ backgroundColor: iconBgPalette[i % iconBgPalette.length] }}
                      >
                        {emoji}
                      </div>
                    ) : null}
                    <span className={`${FONT} font-bold text-[14px] flex-1 truncate`} style={{ color: textColor }}>{label}</span>
                    <span className={`${FONT} font-normal text-[14px] flex-shrink-0 text-[#004EA7]`}>{fmt(item.amount)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>

      {/* ══════════════════════════════
          모바일 레이아웃 (md 미만)
      ══════════════════════════════ */}
      <div className="flex md:hidden flex-col gap-[16px] px-[16px] pb-[32px]">

        {/* Summary + 차트 */}
        <div className="rounded-[20px] border border-[#33445a] bg-[#18202a] p-[16px] shadow-[0px_12px_28px_0px_rgba(24,32,42,0.18)]">
          <div className="flex items-start gap-[12px]">
            <MobileSummaryMetric label="Income" amount={dataset.income} labelClassName="text-[#aebbd0]" amountClassName="text-[#8bb8ff]" />
            <MobileSummaryMetric label="Expenses" amount={dataset.expense} labelClassName="text-[#aebbd0]" amountClassName="text-[#f3f7ff]" />
            <MobileSummaryMetric label="Net" amount={dataset.net} labelClassName="text-[#aebbd0]" amountClassName="text-white" />
          </div>
          <div className="mt-[18px] h-[248px]">
            <CashFlowChart mode={mode} weekPage={weekPage}
              selectedRegion={selectedRegion?.name ?? ''} selectedTag={selectedTag?.name ?? ''}
              barsOverride={bars}
              onPrevPage={() => setWeekPage((p) => p + 1)} onNextPage={() => setWeekPage((p) => p - 1)}
              canPrevPage={weekPage < MAX_WEEK_PAGE} canNextPage={weekPage > 0}
              compact dark />
          </div>
        </div>

        {/* Expense Breakdown */}
        <MobileBreakdownCard title="Expense Breakdown" data={dataset.expBD} />

        {/* Income Breakdown */}
        <MobileBreakdownCard title="Income Breakdown" data={dataset.incBD} />

        {/* Budget Goal Progress */}
        <BudgetGoalProgress goals={goalItems} mobile />

        {/* Top Spending */}
        <TopSpending data={dataset.spending} scrollable={false} />

      </div>

      <GlobalTransactionFab onSaved={async () => {
        await loadData()
        await loadGoals()
      }} />

      {selectedPayment && (
        <PaymentDetailModal
          payment={selectedPayment}
          items={paymentDetails}
          loading={paymentDetailsLoading}
          onClose={() => {
            setSelectedPayment(null)
            setPaymentDetails([])
          }}
        />
      )}

    </div>
  )
}
