'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import GoalCard from '@/app/components/budget/GoalCard'
import BudgetPopup from '@/app/components/budget/BudgetPopup'
import { GlobalTransactionFab } from '@/app/components/layout/GlobalTransactionFab'
import {
  ensureSystemMonthlyBudget, ensureSystemYearlyBudget,
  getSystemMonthlyBudgets, getCustomGoals,
  getActualForBudget, getMonthlyActuals,
  createBudget, updateBudget, deleteBudget,
  isSystemGoal,
} from '@/lib/api/budgets'
import { fetchMasterData } from '@/lib/api/dashboard'
import type { Budget, Category, Subcategory, Region, Tag } from '@/types/database'
import type { LineChartDataPoint } from '@/app/components/budget/MonthlyLineChart'

const MonthlyLineChart = dynamic(
  () => import('@/app/components/budget/MonthlyLineChart'),
  { ssr: false }
)

const FONT  = "font-['Pretendard_Variable',sans-serif]"
const today = new Date()
const CY    = today.getFullYear()
const CM    = today.getMonth() + 1

type MasterData = {
  expenseCategories: Category[]
  subcategories: Subcategory[]
  regions: Region[]
  tags: Tag[]
}

const EMPTY_MASTER: MasterData = {
  expenseCategories: [],
  subcategories: [],
  regions: [],
  tags: [],
}

// ── 기간 종료 여부 판단 ──────────────────────────────────────────
// 달성 기준: 기간이 완전히 끝났고 + 목표 금액을 넘지 않은 경우
function isPeriodEnded(goal: Budget): boolean {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  if (goal.period_type === 'monthly' && goal.year && goal.month) {
    // 해당 월의 마지막 날 이후면 종료
    const endOfMonth = new Date(goal.year, goal.month, 0) // day 0 = 전월 말일
    return now > endOfMonth
  }
  if (goal.period_type === 'yearly' && goal.year) {
    const endOfYear = new Date(goal.year, 11, 31)
    return now > endOfYear
  }
  if (goal.period_type === 'custom' && goal.end_date) {
    const endDate = new Date(goal.end_date)
    return now > endDate
  }
  return false
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-[24px] shadow-[0px_8px_24px_0px_rgba(25,28,30,0.04)] border border-[rgba(226,232,240,0.6)] ${className}`}>
      {children}
    </div>
  )
}

// ── 목표 전체 현황 대시보드 카드 ────────────────────────────────
function SummaryCard({
  goals,
  actuals,
}: {
  goals: Budget[]
  actuals: Record<string, number>
}) {
  const total = goals.length
  // 달성: 기간이 끝났고 + 실제 지출이 목표 이하
  const achieved = goals.filter(g =>
    g.target_amount > 0 &&
    isPeriodEnded(g) &&
    (actuals[g.id] ?? 0) <= g.target_amount
  ).length
  // 초과: 실제 지출이 목표를 넘음 (기간 중에도 이미 초과면 카운트)
  const over = goals.filter(g =>
    g.target_amount > 0 &&
    (actuals[g.id] ?? 0) > g.target_amount
  ).length
  const rate      = total > 0 ? Math.round((achieved / total) * 100) : 0
  const rateColor = rate >= 80 ? '#004ea7' : rate >= 50 ? '#5898ff' : '#d40000'

  const StatRow = ({
    label, value, color = '#18202a',
  }: { label: string; value: string | number; color?: string }) => (
    <div className="flex items-center justify-between py-[10px]">
      <span className={`${FONT} text-[12px] text-[#6c7b8e]`}>{label}</span>
      <span className={`${FONT} font-bold text-[14px]`} style={{ color }}>{value}</span>
    </div>
  )

  return (
    <Card className="h-full p-[24px] flex flex-col">
      {/* 헤더 */}
      <p className={`${FONT} font-bold text-[12px] text-[#18202a] uppercase mb-[20px]`}>
        목표 현황
      </p>

      {/* 달성률 큰 숫자 */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <p className={`${FONT} font-bold text-[56px] leading-none`} style={{ color: rateColor }}>
          {rate}%
        </p>
        <p className={`${FONT} text-[11px] text-[#6c7b8e] mt-[6px]`}>전체 달성률</p>

        {/* 프로그레스 바 */}
        <div className="w-full mt-[16px]">
          <div className="bg-[#e6e8f1] rounded-full overflow-hidden" style={{ height: 6 }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${rate}%`, backgroundColor: rateColor }}
            />
          </div>
        </div>
      </div>

      {/* 구분선 */}
      <div className="w-full h-px bg-[#e6e8f1] mt-[20px]" />

      {/* 통계 항목 */}
      <div className="flex flex-col divide-y divide-[#e6e8f1]">
        <StatRow label="진행중인 목표" value={`${total}개`} />
        <StatRow label="달성"         value={`${achieved}개`} color="#004ea7" />
        <StatRow label="초과"         value={`${over}개`}     color={over > 0 ? '#d40000' : '#6c7b8e'} />
      </div>
    </Card>
  )
}

// ── 메인 페이지 ──────────────────────────────────────────────────
export default function BudgetPage() {

  // ── 상태 ──────────────────────────────────────────────────────
  const [loading,        setLoading]        = useState(true)
  const [systemMonthly,  setSystemMonthly]  = useState<Budget | null>(null)
  const [systemYearly,   setSystemYearly]   = useState<Budget | null>(null)
  const [allMonthly,     setAllMonthly]     = useState<Budget[]>([])
  const [customGoals,    setCustomGoals]    = useState<Budget[]>([])
  const [actuals,        setActuals]        = useState<Record<string, number>>({})
  const [monthlyActuals, setMonthlyActuals] = useState<Record<number, number>>({})
  const [master,         setMaster]         = useState<MasterData>(EMPTY_MASTER)

  const [popupOpen, setPopupOpen] = useState(false)
  const [editGoal,  setEditGoal]  = useState<Budget | null>(null)

  // ── 데이터 로드 (단계별 — 한 단계 실패해도 다음 단계 진행) ────
  const load = useCallback(async () => {
    setLoading(true)

    // ① Master 데이터 + 월별 실제 지출 (항상 로드 → 팝업 드롭다운 재료)
    try {
      const [md, mAct] = await Promise.all([
        fetchMasterData(),
        getMonthlyActuals(CY),
      ])
      setMonthlyActuals(mAct)
      setMaster({
        expenseCategories: md.categories.filter(c => c.type === 'expense'),
        subcategories:     md.subcategories,
        regions:           md.regions,
        tags:              md.tags,
      })
    } catch (e) {
      console.error('Master data load error:', e)
    }

    // ② 시스템 목표 자동 생성 (is_system 컬럼 없으면 실패 → 무시)
    let sysM: Budget | null = null
    let sysY: Budget | null = null
    try {
      const [m, y] = await Promise.all([
        ensureSystemMonthlyBudget(CY, CM),
        ensureSystemYearlyBudget(CY),
      ])
      sysM = m
      sysY = y
      setSystemMonthly(m)
      setSystemYearly(y)
    } catch (e) {
      console.warn('System budget 생성 실패 (Supabase migration 필요):', e)
    }

    // ③ 차트용 월별 목표 + 커스텀 목표 + actuals
    try {
      const [allM, customs] = await Promise.all([
        getSystemMonthlyBudgets(CY),
        getCustomGoals(),
      ])
      setAllMonthly(allM)
      setCustomGoals(customs)

      const goals = [
        ...(sysM ? [sysM] : []),
        ...(sysY ? [sysY] : []),
        ...customs,
      ]
      if (goals.length > 0) {
        const actualMap: Record<string, number> = {}
        await Promise.all(
          goals.map(async (g) => {
            actualMap[g.id] = await getActualForBudget(g)
          })
        )
        setActuals(actualMap)
      }
    } catch (e) {
      console.error('Goals load error:', e)
    }

    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // ── 목표 라인 계산 ───────────────────────────────────────────
  // 규칙:
  //   • 데이터가 있는 달은 해당 금액 사용
  //   • 이후 달(아직 목표 미설정)은 마지막 알려진 금액 승계 → 수평선
  //   • 이전 달(목표 설정 이전)은 첫 번째 알려진 금액으로 역채움
  //   • 중간에 금액이 바뀌면 그 달부터 꺾임
  const monthlyTargets = (() => {
    if (allMonthly.length === 0) return Array(12).fill(null) as (number | null)[]

    const map: Record<number, number> = {}
    for (const b of allMonthly) {
      if (b.month != null) map[b.month] = b.target_amount
    }

    const targets: (number | null)[] = Array(12).fill(null)

    // 전진 채우기: 1→12월, 값이 있으면 갱신, 없으면 직전 값 승계
    let last: number | null = null
    for (let m = 1; m <= 12; m++) {
      if (map[m] !== undefined) last = map[m]
      targets[m - 1] = last
    }

    // 역채우기: 앞쪽 null(데이터 이전 달)을 첫 번째 알려진 값으로 채움
    const firstVal = targets.find(v => v !== null) ?? null
    if (firstVal !== null) {
      for (let i = 0; i < 12; i++) {
        if (targets[i] === null) targets[i] = firstVal
        else break
      }
    }

    return targets
  })()

  // ── 차트 데이터 ──────────────────────────────────────────────
  const chartData: LineChartDataPoint[] = Array.from({ length: 12 }, (_, i) => ({
    month:  i + 1,
    actual: (i + 1) <= CM ? (monthlyActuals[i + 1] ?? null) : null,
    target: monthlyTargets[i],
  }))

  // ── 전체 목표 목록 ────────────────────────────────────────────
  const allGoals: Budget[] = [
    ...(systemMonthly ? [systemMonthly] : []),
    ...(systemYearly  ? [systemYearly]  : []),
    ...customGoals,
  ]

  // ── Popup 핸들러 ──────────────────────────────────────────────
  const openAdd  = () => { setEditGoal(null); setPopupOpen(true) }
  const openEdit = (g: Budget) => { setEditGoal(g); setPopupOpen(true) }

  const handleSave = async (data: Omit<Budget, 'id' | 'created_at'>) => {
    if (editGoal) {
      // 시스템 목표(월간·년간 기본)는 금액만 수정
      await updateBudget(
        editGoal.id,
        isSystemGoal(editGoal) ? { target_amount: data.target_amount } : data
      )
    } else {
      await createBudget(data)
    }
    await load()
  }

  const handleDelete = async (goal: Budget) => {
    if (isSystemGoal(goal)) return   // 시스템 목표는 삭제 불가
    if (!confirm(`"${goal.name}" 목표를 삭제할까요?`)) return
    await deleteBudget(goal.id)
    await load()
  }

  if (loading && allGoals.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className={`${FONT} text-[14px] text-[#6c7b8e]`}>로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-[16px] py-[20px] md:px-[32px] md:py-[24px] flex flex-col gap-[20px] md:gap-[28px]">

        {/* ── 페이지 타이틀 ── */}
        <div>
          <h1 className={`${FONT} font-bold text-[22px] md:text-[24px] text-[#18202a] uppercase tracking-[-0.5px]`}>
            Budget
          </h1>
          <p className={`${FONT} text-[13px] text-[#6c7b8e] mt-[2px]`}>
            지출 목표를 설정하고 월별 달성 현황을 추적하세요
          </p>
        </div>

        {/* ── Section 1: 라인 차트 + 요약 카드 (3:1) ── */}
        <div className="flex flex-col gap-[16px] md:flex-row md:gap-[24px] md:items-stretch">

          {/* 차트 (75%) */}
          <Card className="flex-[3] min-w-0 p-[8px] flex flex-col gap-[6px] md:p-[24px] md:gap-[16px]">
            <div className="flex items-center justify-between">
              <p className={`${FONT} font-bold text-[13px] text-[#18202a] uppercase md:text-[12px]`}>
                월간 지출 목표 달성 현황 — {CY}년
              </p>
              <p className={`${FONT} hidden md:block text-[11px] text-[#6c7b8e]`}>
                실선: 실제 지출 / 점선: 목표 라인
              </p>
            </div>
            <MonthlyLineChart data={chartData} currentMonth={CM} />
          </Card>

          {/* 요약 카드 (25%) */}
          <div className="w-full md:flex-1 md:min-w-[200px] md:max-w-[280px]">
            <SummaryCard goals={allGoals} actuals={actuals} />
          </div>

        </div>

        {/* ── Section 2: 진행중인 목표 ── */}
        <div className="mt-[12px] md:mt-0">
          <div className="flex items-center justify-between gap-[12px] mb-[20px] md:mb-[16px]">
            <p className={`${FONT} font-bold text-[14px] text-[#18202a]`}>
              진행중인 목표
              <span className={`${FONT} font-normal text-[12px] text-[#6c7b8e] ml-[8px]`}>
                {allGoals.length}개
              </span>
            </p>
            <button
              onClick={openAdd}
              className={`${FONT} ml-auto flex shrink-0 items-center justify-center gap-[8px] rounded-[10px] bg-[#004ea7] px-[12px] py-[8px] text-[12px] font-semibold text-white transition-colors hover:bg-[#0053b1] md:rounded-[9999px] md:px-[16px] md:justify-start`}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1V11M1 6H11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              목표 추가
            </button>
          </div>

          {allGoals.length === 0 ? (
            <div className="text-center py-[48px] text-[#6c7b8e] text-[14px]">
              목표가 없습니다. 새 목표를 추가하거나 Supabase migration을 실행해주세요.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-[16px] md:grid-cols-2">
              {allGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  actual={actuals[goal.id] ?? 0}
                  onEdit={() => openEdit(goal)}
                  onDelete={() => handleDelete(goal)}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── 목표 추가/수정 팝업 — master 로드 여부 무관하게 항상 렌더 ── */}
      <BudgetPopup
        isOpen={popupOpen}
        budget={editGoal}
        onClose={() => setPopupOpen(false)}
        onSave={handleSave}
        master={master}
        currentYear={CY}
        currentMonth={CM}
      />
      <GlobalTransactionFab onSaved={load} />
    </div>
  )
}
