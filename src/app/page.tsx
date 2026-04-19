'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import IncomeBreakdown from '@/app/components/dashboard/IncomeBreakdown'
import { GlobalTransactionFab } from '@/app/components/layout/GlobalTransactionFab'
import {
  fetchMasterData, fetchDashboardData, getISOWeek,
  type DashDataset, type DashBar, type MasterData,
} from '@/lib/api/dashboard'
import type { Region, Tag } from '@/types/database'

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
const CURRENT_DAY   = _today.getDate()
const CURRENT_WEEK  = getISOWeek(_today)

// ── Budget Goals placeholder ───────────────────────────────
const BUDGET_GOALS = [
  { name: 'New Studio Fund',  target: 250_000_000, saved: 160_000_000, pct: 64,  color: '#004EA7', track: '#D8E9FD' },
  { name: 'Travel Portfolio', target:  12_000_000, saved:  10_560_000, pct: 88,  color: '#FF786B', track: '#E0E0E0' },
  { name: 'Emergency Fund',   target:  20_000_000, saved:  22_000_000, pct: 110, color: '#d40000', track: '#E0E0E0' },
]

const EMPTY_DATASET: DashDataset = {
  income: 0, expense: 0, net: 0, expBD: [], incBD: [], top5: [], spending: [],
}

function fmt(n: number) { return '₩' + n.toLocaleString('ko-KR') }

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-[24px] shadow-[0px_8px_24px_0px_rgba(25,28,30,0.04)] border border-[rgba(226,232,240,0.6)] overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

// ── Budget Goal Progress ───────────────────────────────────
function BudgetGoalProgress({ mobile = false }: { mobile?: boolean }) {
  const [slide, setSlide] = useState(0)
  const pages = Math.ceil(BUDGET_GOALS.length / 2)

  if (mobile) {
    return (
      <div className="bg-white rounded-[24px] shadow-[0px_8px_24px_0px_rgba(25,28,30,0.04)] border border-[rgba(226,232,240,0.6)] p-[20px] flex flex-col gap-[16px]">
        <p className={`${FONT} font-bold text-[12px] text-[#18202a] uppercase`}>Budget Goal Progress</p>
        {BUDGET_GOALS.map((goal) => (
          <div key={goal.name} className="flex flex-col gap-[8px]">
            <div className="flex items-end justify-between">
              <div className="flex flex-col gap-[2px]">
                <p className={`${FONT} font-semibold text-[14px] text-[#18202a] leading-none`}>{goal.name}</p>
                <p className={`${FONT} font-normal text-[10px] text-[#6c7b8e] leading-none`}>Target: {fmt(goal.target)}</p>
              </div>
              <p className={`${FONT} font-bold text-[18px] leading-none`} style={{ color: goal.color }}>{goal.pct}%</p>
            </div>
            <div className="rounded-full overflow-hidden" style={{ height: 10, backgroundColor: goal.track }}>
              <div className="h-full rounded-full" style={{ width: `${Math.min(goal.pct, 100)}%`, backgroundColor: goal.color }} />
            </div>
            <div className="flex justify-between">
              <p className={`${FONT} font-medium text-[10px] text-[#6c7b8e]`}>{fmt(goal.saved)} Saved</p>
              <p className={`${FONT} font-medium text-[10px] text-[#6c7b8e]`}>{fmt(Math.max(goal.target - goal.saved, 0))} To go</p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const visible = BUDGET_GOALS.slice(slide * 2, slide * 2 + 2)
  return (
    <div className="bg-white rounded-[24px] shadow-[0px_8px_24px_0px_rgba(25,28,30,0.04)] border border-[rgba(226,232,240,0.6)] p-[24px] flex flex-col justify-between h-full">
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
        {visible.map((goal) => (
          <div key={goal.name} className="flex-1 flex flex-col gap-[8px]">
            <div className="flex items-end justify-between">
              <div className="flex flex-col gap-[2px]">
                <p className={`${FONT} font-semibold text-[14px] text-[#18202a] leading-none`}>{goal.name}</p>
                <p className={`${FONT} font-normal text-[10px] text-[#6c7b8e] leading-none`}>Target: {fmt(goal.target)}</p>
              </div>
              <p className={`${FONT} font-bold text-[18px] leading-none`} style={{ color: goal.color }}>{goal.pct}%</p>
            </div>
            <div className="rounded-[9999px] overflow-hidden flex-shrink-0" style={{ height: 12, backgroundColor: goal.track }}>
              <div className="h-full rounded-[9999px]" style={{ width: `${Math.min(goal.pct, 100)}%`, backgroundColor: goal.color }} />
            </div>
            <div className="flex justify-between">
              <p className={`${FONT} font-medium text-[10px] text-[#6c7b8e]`}>{fmt(goal.saved)} Saved</p>
              <p className={`${FONT} font-medium text-[10px] text-[#6c7b8e]`}>{fmt(Math.max(goal.target - goal.saved, 0))} To go</p>
            </div>
          </div>
        ))}
        {visible.length === 1 && <div className="flex-1" />}
      </div>
    </div>
  )
}

// ── Top 5 Payment 카드 ────────────────────────────────────
function Top5Payment({ data }: { data: DashDataset['top5'] }) {
  return (
    <div className="bg-[#18202A] rounded-[10px] px-[16px] py-[24px] flex flex-col justify-between">
      <span className={`${FONT} font-bold text-[12px] text-white uppercase`} style={{ lineHeight: '1.333em' }}>
        Top 5 Payment
      </span>
      <div className="flex flex-col gap-[12px] mt-[16px]">
        {data.length === 0 && <span className="text-[#6c7b8e] text-[11px]">데이터 없음</span>}
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-[10px]">
            <div className="flex-shrink-0 flex items-center justify-center rounded-[4px]"
              style={{ width: 48, height: 30, backgroundColor: item.color, boxShadow: '2px 2px 5px 0px rgba(0,0,0,0.1)' }}>
              <span className={`${FONT} font-bold text-[24px] text-white`} style={{ lineHeight: '0.625em' }}>{item.initial}</span>
            </div>
            <div className="flex flex-col gap-[2px] flex-1 min-w-0">
              <span className={`${FONT} font-bold text-[12px] text-[#5898FF] truncate`} style={{ lineHeight: '1.25em' }}>{item.name}</span>
              <span className={`${FONT} font-normal text-[10px] text-[#D8E9FD]`} style={{ lineHeight: '1.5em' }}>{fmt(item.amount)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Top Spending 카드 ─────────────────────────────────────
function TopSpending({ data, scrollable = true }: { data: DashDataset['spending']; scrollable?: boolean }) {
  return (
    <div className="bg-white rounded-[24px] shadow-[0px_8px_24px_0px_rgba(25,28,30,0.04)] border border-[rgba(226,232,240,0.6)] p-[24px] flex flex-col overflow-hidden">
      <div className={`${FONT} font-bold text-[12px] text-[#18202a] uppercase flex-shrink-0`} style={{ lineHeight: '1.333em' }}>
        Top Spending
      </div>
      <div className={`${scrollable ? 'flex-1 min-h-0 overflow-y-auto' : ''} flex flex-col gap-[13px] mt-[24px]`}>
        {data.length === 0 && <span className="text-[#6c7b8e] text-[12px]">데이터 없음</span>}
        {data.map((item, i) => {
          const textColor = i < 5 ? '#004EA7' : '#18202A'
          return (
            <div key={item.rank} className="flex items-center gap-[12px]">
              <span className={`${FONT} font-bold text-[12px] text-[#6C7B8E] w-[16px] flex-shrink-0`}>{item.rank}</span>
              <span className={`${FONT} font-bold text-[14px] flex-1 truncate`} style={{ color: textColor }}>{item.name}</span>
              <span className={`${FONT} font-normal text-[14px] flex-shrink-0`} style={{ color: textColor }}>{fmt(item.amount)}</span>
            </div>
          )
        })}
      </div>
      <div className="flex-shrink-0 flex items-center gap-[6px] cursor-pointer mt-[24px]">
        <span className={`${FONT} font-bold text-[12px] text-[#0053B1]`} style={{ lineHeight: '1.333em' }}>DETAILS</span>
        <svg width="5" height="7" viewBox="0 0 5 7" fill="none">
          <path d="M1 0.5L4 3.5L1 6.5" stroke="#0053B1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  )
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

  const MAX_WEEK_PAGE = Math.floor((CURRENT_WEEK - 1) / 12)

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
        regionId: selectedRegion?.id ?? null, tagId: selectedTag?.id ?? null, master,
      })
      setDataset(result.dataset)
      setBars(result.bars)
    } catch (e) { console.error('Dashboard data error:', e) }
  }, [master, mode, weekPage, selectedRegion, selectedTag])

  useEffect(() => { loadData() }, [loadData])

  const modeLabel =
    mode === 'REGION'  ? 'REGION VIEW' :
    mode === 'TAGGING' ? 'TAG VIEW'    :
    `${mode} OVERVIEW`

  function TitleDate() {
    if (mode === 'YEARLY') {
      return (
        <div className="flex items-baseline gap-[2px]">
          <span className={`${FONT} font-bold md:text-[48px] text-[32px] leading-none text-[#363D4B]`}>{CURRENT_YEAR}</span>
          <span className={`${FONT} font-normal md:text-[24px] text-[18px] leading-none text-[#363D4B]`}>년</span>
        </div>
      )
    }
    return (
      <div className="flex items-baseline gap-[2px]">
        <span className={`${FONT} font-bold md:text-[48px] text-[28px] leading-none text-[#363D4B]`}>{CURRENT_YEAR}</span>
        <span className={`${FONT} font-normal md:text-[24px] text-[16px] leading-none text-[#363D4B] mr-[4px]`}>년</span>
        <span className={`${FONT} font-bold md:text-[48px] text-[28px] leading-none text-[#363D4B]`}>{String(CURRENT_MONTH).padStart(2,'0')}</span>
        <span className={`${FONT} font-normal md:text-[24px] text-[16px] leading-none text-[#363D4B] mr-[4px]`}>월</span>
        <span className={`${FONT} font-bold md:text-[48px] text-[28px] leading-none text-[#363D4B]`}>{String(CURRENT_DAY).padStart(2,'0')}</span>
        <span className={`${FONT} font-normal md:text-[24px] text-[16px] leading-none text-[#363D4B]`}>일</span>
      </div>
    )
  }

  const cashFlowText =
    mode === 'YEARLY'  ? String(CURRENT_YEAR) :
    mode === 'WEEKLY'  ? `${CURRENT_WEEK - weekPage * 12}W` :
    `${String(CURRENT_MONTH).padStart(2,'0')}.${new Date(CURRENT_YEAR, CURRENT_MONTH-1).toLocaleString('en',{month:'short'})}`

  const SELECT_CLS = `${FONT} font-bold text-[#18202a] bg-transparent outline-none cursor-pointer w-full`

  return (
    <div className="h-full flex flex-col md:overflow-hidden overflow-y-auto">

      {/* ── 헤더 ── */}
      <div className="flex items-end justify-between px-[16px] md:px-[32px] pt-[16px] md:pt-[20px] pb-[12px] flex-shrink-0">
        <div className="flex flex-col gap-[6px]">
          <div className="inline-flex items-center px-[10px] py-[3px] bg-[#5898ff] rounded-[12px] self-start">
            <span className={`${FONT} font-semibold text-[12px] text-white tracking-[1.2px] uppercase whitespace-nowrap`}>{modeLabel}</span>
          </div>
          <TitleDate />
        </div>

        {/* 모드 토글 — 데스크톱: 가로 배치, 모바일: 숨김 (하단으로 이동) */}
        <div className="hidden md:flex relative items-center p-[4px] rounded-[9999px]">
          <div aria-hidden="true" className="absolute bg-[#e6e8f1] inset-0 pointer-events-none rounded-[9999px]" />
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]" />
          {DASH_MODES.map((m) => (
            <button key={m} onClick={() => { setMode(m); setWeekPage(0) }}
              className={`relative w-[100px] flex items-center justify-center px-[24px] py-[8px] rounded-[9999px] text-[12px] transition-all whitespace-nowrap ${
                mode === m ? 'bg-white text-[#004ea7] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] font-semibold' : 'text-[#6c7b8e] font-medium hover:text-[#18202a]'
              }`}>
              <span className={`${FONT} leading-[16px]`}>{m}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 모드 토글 — 모바일 전용 (가로 스크롤) */}
      <div className="flex md:hidden px-[16px] pb-[12px] flex-shrink-0">
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
        <div className="h-[334px] flex-shrink-0 p-[24px] gap-[24px] flex min-w-0 bg-white rounded-[24px] shadow-[0px_8px_24px_0px_rgba(25,28,30,0.04)] border border-[rgba(226,232,240,0.6)] overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            <div className="flex items-stretch justify-between flex-shrink-0 px-[20px]">
              <div className="w-[120px] flex-shrink-0 flex flex-col items-end">
                <span className={`${FONT} font-normal text-[12px] text-[#6c7b8e]`} style={{ lineHeight: '1.2em' }}>Cash Flow</span>
                {mode === 'WEEKLY' && <span className={`${FONT} font-bold text-[26px] text-[#18202a]`} style={{ lineHeight: '1.2em' }}>{cashFlowText}</span>}
                {mode === 'REGION' && (
                  <select value={selectedRegion?.id ?? ''} onChange={(e) => setSelectedRegion(regions.find(r => r.id === e.target.value) ?? null)}
                    className={`${SELECT_CLS} text-[20px]`} style={{ lineHeight: '1.2em' }}>
                    {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                )}
                {mode === 'TAGGING' && (
                  <select value={selectedTag?.id ?? ''} onChange={(e) => setSelectedTag(tags.find(t => t.id === e.target.value) ?? null)}
                    className={`${SELECT_CLS} text-[16px]`} style={{ lineHeight: '1.2em' }}>
                    {tags.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                )}
                {(mode === 'YEARLY' || mode === 'MONTHLY') && (
                  <span className={`${FONT} font-bold text-[30px] text-[#18202a]`} style={{ lineHeight: '1.2em' }}>{cashFlowText}</span>
                )}
              </div>
              <div className="w-px bg-[#e6e8f1] self-stretch" />
              <div className="w-[160px] flex-shrink-0 flex flex-col items-end">
                <span className={`${FONT} font-normal text-[12px] text-[#6c7b8e]`} style={{ lineHeight: '1.2em' }}>Income</span>
                <span className={`${FONT} font-bold text-[30px] text-[#6c7b8e]`} style={{ lineHeight: '1.2em', letterSpacing: '-0.05em' }}>{fmt(dataset.income)}</span>
              </div>
              <div className="w-[160px] flex-shrink-0 flex flex-col items-end">
                <span className={`${FONT} font-normal text-[12px] text-[#6c7b8e]`} style={{ lineHeight: '1.2em' }}>Expenses</span>
                <span className={`${FONT} font-bold text-[30px] text-[#9a9a9a]`} style={{ lineHeight: '1.2em', letterSpacing: '-0.05em' }}>{fmt(dataset.expense)}</span>
              </div>
              <div className="w-[160px] flex-shrink-0 flex flex-col items-end">
                <span className={`${FONT} font-normal text-[12px] text-[#6c7b8e]`} style={{ lineHeight: '1.2em' }}>Net</span>
                <span className={`${FONT} font-bold text-[30px] text-[#004ea7]`} style={{ lineHeight: '1.2em', letterSpacing: '-0.05em' }}>{fmt(dataset.net)}</span>
              </div>
            </div>
            <div className="flex-1 min-h-0 mt-[12px]">
              <CashFlowChart mode={mode} weekPage={weekPage}
                selectedRegion={selectedRegion?.name ?? ''} selectedTag={selectedTag?.name ?? ''}
                barsOverride={bars}
                onPrevPage={() => setWeekPage((p) => p + 1)} onNextPage={() => setWeekPage((p) => p - 1)}
                canPrevPage={weekPage < MAX_WEEK_PAGE} canNextPage={weekPage > 0} />
            </div>
          </div>
          <div className="w-[167px] flex-shrink-0 bg-[#18202A] rounded-[10px] px-[16px] py-[24px] flex flex-col justify-between">
            <span className={`${FONT} font-bold text-[12px] text-white uppercase`} style={{ lineHeight: '1.333em' }}>Top 5 Payment</span>
            <div className="flex flex-col gap-[12px]">
              {dataset.top5.length === 0 && <span className="text-[#6c7b8e] text-[11px]">데이터 없음</span>}
              {dataset.top5.map((item) => (
                <div key={item.name} className="flex items-center gap-[10px]">
                  <div className="flex-shrink-0 flex items-center justify-center rounded-[4px]"
                    style={{ width: 48, height: 30, backgroundColor: item.color, boxShadow: '2px 2px 5px 0px rgba(0,0,0,0.1)' }}>
                    <span className={`${FONT} font-bold text-[24px] text-white`} style={{ lineHeight: '0.625em' }}>{item.initial}</span>
                  </div>
                  <div className="flex flex-col gap-[2px] flex-1 min-w-0">
                    <span className={`${FONT} font-bold text-[12px] text-[#5898FF] truncate`} style={{ lineHeight: '1.25em' }}>{item.name}</span>
                    <span className={`${FONT} font-normal text-[10px] text-[#D8E9FD]`} style={{ lineHeight: '1.5em' }}>{fmt(item.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 하단 섹션 */}
        <div className="flex gap-[24px] flex-shrink-0">
          <div className="flex-1 flex flex-col gap-[24px] min-w-0">
            <div className="flex gap-[24px] h-[276px] flex-shrink-0">
              <Card className="p-[24px] flex-1 min-w-0 overflow-hidden"><ExpenseBreakdown data={dataset.expBD} /></Card>
              <Card className="p-[24px] flex-1 min-w-0 overflow-hidden"><IncomeBreakdown data={dataset.incBD} /></Card>
            </div>
            <div className="h-[188px] flex-shrink-0"><BudgetGoalProgress /></div>
          </div>
          <div className="w-[281px] flex-shrink-0 bg-white rounded-[24px] shadow-[0px_8px_24px_0px_rgba(25,28,30,0.04)] border border-[rgba(226,232,240,0.6)] p-[24px] flex flex-col overflow-hidden">
            <div className={`${FONT} font-bold text-[12px] text-[#18202a] uppercase flex-shrink-0`} style={{ lineHeight: '1.333em' }}>Top Spending</div>
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-[13px] mt-[24px]">
              {dataset.spending.length === 0 && <span className="text-[#6c7b8e] text-[12px]">데이터 없음</span>}
              {dataset.spending.map((item, i) => {
                const textColor = i < 5 ? '#004EA7' : '#18202A'
                return (
                  <div key={item.rank} className="flex items-center gap-[12px]">
                    <span className={`${FONT} font-bold text-[12px] text-[#6C7B8E] w-[16px] flex-shrink-0`}>{item.rank}</span>
                    <span className={`${FONT} font-bold text-[14px] flex-1 truncate`} style={{ color: textColor }}>{item.name}</span>
                    <span className={`${FONT} font-normal text-[14px] flex-shrink-0`} style={{ color: textColor }}>{fmt(item.amount)}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex-shrink-0 flex items-center gap-[6px] cursor-pointer mt-[24px]">
              <span className={`${FONT} font-bold text-[12px] text-[#0053B1]`} style={{ lineHeight: '1.333em' }}>DETAILS</span>
              <svg width="5" height="7" viewBox="0 0 5 7" fill="none"><path d="M1 0.5L4 3.5L1 6.5" stroke="#0053B1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
        </div>

      </div>

      {/* ══════════════════════════════
          모바일 레이아웃 (md 미만)
      ══════════════════════════════ */}
      <div className="flex md:hidden flex-col gap-[16px] px-[16px] pb-[32px]">

        {/* Summary Bar */}
        <div className="bg-white rounded-[20px] p-[16px] flex justify-between shadow-[0px_4px_12px_0px_rgba(25,28,30,0.06)] border border-[rgba(226,232,240,0.6)]">
          <div className="flex flex-col items-center">
            <span className={`${FONT} text-[10px] text-[#6c7b8e]`}>Income</span>
            <span className={`${FONT} font-bold text-[16px] text-[#6c7b8e]`} style={{ letterSpacing: '-0.03em' }}>{fmt(dataset.income)}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className={`${FONT} text-[10px] text-[#6c7b8e]`}>Expenses</span>
            <span className={`${FONT} font-bold text-[16px] text-[#9a9a9a]`} style={{ letterSpacing: '-0.03em' }}>{fmt(dataset.expense)}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className={`${FONT} text-[10px] text-[#6c7b8e]`}>Net</span>
            <span className={`${FONT} font-bold text-[16px] text-[#004ea7]`} style={{ letterSpacing: '-0.03em' }}>{fmt(dataset.net)}</span>
          </div>
        </div>

        {/* 차트 */}
        <div className="bg-white rounded-[20px] p-[16px] shadow-[0px_4px_12px_0px_rgba(25,28,30,0.06)] border border-[rgba(226,232,240,0.6)]">
          <div className="h-[240px]">
            <CashFlowChart mode={mode} weekPage={weekPage}
              selectedRegion={selectedRegion?.name ?? ''} selectedTag={selectedTag?.name ?? ''}
              barsOverride={bars}
              onPrevPage={() => setWeekPage((p) => p + 1)} onNextPage={() => setWeekPage((p) => p - 1)}
              canPrevPage={weekPage < MAX_WEEK_PAGE} canNextPage={weekPage > 0} />
          </div>
        </div>

        {/* Top 5 Payment */}
        <Top5Payment data={dataset.top5} />

        {/* Expense Breakdown */}
        <Card className="p-[16px]">
          <ExpenseBreakdown data={dataset.expBD} />
        </Card>

        {/* Income Breakdown */}
        <Card className="p-[16px]">
          <IncomeBreakdown data={dataset.incBD} />
        </Card>

        {/* Budget Goal Progress */}
        <BudgetGoalProgress mobile />

        {/* Top Spending */}
        <TopSpending data={dataset.spending} scrollable={false} />

      </div>

      <GlobalTransactionFab onSaved={loadData} />

    </div>
  )
}
