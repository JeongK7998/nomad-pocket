'use client'

import type { Budget } from '@/types/database'
import { isSystemGoal } from '@/lib/api/budgets'

interface Props {
  goal: Budget
  actual: number
  onEdit: () => void
  onDelete: () => void
}

function fmt(n: number) {
  return '₩' + n.toLocaleString('ko-KR')
}

const PERIOD_LABELS: Record<string, string> = {
  monthly: '월간',
  yearly:  '년간',
  custom:  '커스텀',
}

// 기간 종료 여부 (SummaryCard와 동일 로직)
function isPeriodEnded(goal: Budget): boolean {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  if (goal.period_type === 'monthly' && goal.year && goal.month) {
    return now > new Date(goal.year, goal.month, 0)
  }
  if (goal.period_type === 'yearly' && goal.year) {
    return now > new Date(goal.year, 11, 31)
  }
  if (goal.period_type === 'custom' && goal.end_date) {
    return now > new Date(goal.end_date)
  }
  return false
}

export default function GoalCard({ goal, actual, onEdit, onDelete }: Props) {
  const pct       = goal.target_amount > 0 ? Math.round((actual / goal.target_amount) * 100) : 0
  const isOver    = actual > goal.target_amount
  const ended     = isPeriodEnded(goal)
  const isAchieved = ended && !isOver   // 기간 종료 + 목표 미달성 = 달성

  const barW = Math.min(pct, 100)
  // 색상: 초과=빨강 / 달성(종료)=초록 / 진행중=파랑
  const barColor  = isOver ? '#ff786b' : isAchieved ? '#99d276' : '#5898ff'
  const textColor = isOver ? '#d40000' : isAchieved ? '#2d7a00' : '#004ea7'
  const badgeBg   = isOver ? '#ff786b' : isAchieved ? '#99d276' : '#5898ff'
  const remaining = goal.target_amount - actual

  // 상태 레이블
  const statusLabel = isOver ? '초과' : isAchieved ? '달성' : '진행중'
  const statusColor = isOver ? '#d40000' : isAchieved ? '#2d7a00' : '#004ea7'
  const statusBg    = isOver ? '#ffe8e5' : isAchieved ? '#f0fce4' : '#e8f0ff'

  return (
    <div className="bg-white rounded-[24px] shadow-[0px_4px_16px_0px_rgba(25,28,30,0.06)] border border-[rgba(226,232,240,0.6)] p-[24px] flex flex-col gap-[16px]">

      {/* ── 헤더 ── */}
      <div className="flex items-start justify-between gap-[8px]">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[8px] flex-wrap">
            {/* 기간 뱃지 */}
            <span
              className="px-[8px] py-[2px] rounded-full text-[10px] font-semibold text-white"
              style={{ backgroundColor: badgeBg }}
            >
              {PERIOD_LABELS[goal.period_type] ?? goal.period_type}
            </span>
            {/* 상태 뱃지 */}
            <span
              className="px-[8px] py-[2px] rounded-full text-[10px] font-semibold"
              style={{ color: statusColor, backgroundColor: statusBg }}
            >
              {statusLabel}
            </span>
            <span className="font-bold text-[14px] text-[#18202a] truncate" title={goal.name}>
              {goal.name}
            </span>
          </div>
          <p className="text-[11px] text-[#6c7b8e] mt-[4px]">
            목표: {fmt(goal.target_amount)}
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-[4px] flex-shrink-0">
          <button
            onClick={onEdit}
            className="w-[28px] h-[28px] rounded-full flex items-center justify-center bg-[#e6e8f1] hover:bg-[#d8e9fd] transition-colors"
            title="수정"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M8.5 1.5L10.5 3.5L4 10H2V8L8.5 1.5Z" stroke="#18202a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </button>
          {!isSystemGoal(goal) && (
            <button
              onClick={onDelete}
              className="w-[28px] h-[28px] rounded-full flex items-center justify-center bg-[#e6e8f1] hover:bg-[#ffe0e0] transition-colors"
              title="삭제"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 3H10M4.5 3V2H7.5V3M3 3L3.5 10H8.5L9 3" stroke="#d40000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── 달성률 수치 ── */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] text-[#6c7b8e] mb-[2px]">현재 지출</p>
          <p className="font-bold text-[20px]" style={{ color: textColor }}>
            {fmt(actual)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-[#6c7b8e] mb-[2px]">달성률</p>
          <p className="font-bold text-[28px] leading-none" style={{ color: barColor }}>
            {pct}%
          </p>
        </div>
      </div>

      {/* ── 프로그레스 바 ── */}
      <div>
        <div className="bg-[#e6e8f1] rounded-full overflow-hidden" style={{ height: 8 }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${barW}%`, backgroundColor: barColor }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-[#6c7b8e] mt-[6px]">
          <span>{fmt(actual)} 지출</span>
          <span style={{ color: textColor }}>
            {isOver
              ? `${fmt(Math.abs(remaining))} 초과`
              : isAchieved
                ? `${fmt(remaining)} 절약`
                : `${fmt(remaining)} 남음`
            }
          </span>
        </div>
      </div>

    </div>
  )
}
