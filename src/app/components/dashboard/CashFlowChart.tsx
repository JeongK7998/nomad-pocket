'use client'

import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export type DashMode = 'YEARLY' | 'MONTHLY' | 'WEEKLY' | 'REGION' | 'TAGGING'

const BAR_W = 32
const FONT  = "font-['Pretendard_Variable',sans-serif]"

// ── 포맷 헬퍼 ───────────────────────────────────────────────
function fmtY(v: number, mode: DashMode) {
  if (v === 0) return '₩0'
  if (mode === 'YEARLY')  return `₩${(v / 100_000_000).toFixed(0)}억`
  if (mode === 'WEEKLY')  return `₩${(v / 1_000_000).toFixed(1)}M`
  return `₩${(v / 1_000_000).toFixed(0)}M`
}
function fmtNum(v: number) { return '₩' + v.toLocaleString('ko-KR') }

// ── 공통 바 타입 ─────────────────────────────────────────────
interface Bar { label: string; income: number | null; expense: number | null }

// ── Mock: Monthly ────────────────────────────────────────────
const MONTHLY_BARS: Bar[] = [
  { label: 'Jan', income: 21_000_000, expense: 15_000_000 },
  { label: 'Feb', income: 24_000_000, expense: 18_000_000 },
  { label: 'Mar', income: 22_000_000, expense: 16_000_000 },
  { label: 'Apr', income: 28_000_000, expense: 20_000_000 },
  { label: 'May', income: 31_000_000, expense: 23_000_000 },
  { label: 'Jun', income: 38_200_000, expense: 29_500_000 },
  { label: 'Jul', income: null,       expense: null        },
  { label: 'Aug', income: null,       expense: null        },
  { label: 'Sep', income: null,       expense: null        },
  { label: 'Oct', income: null,       expense: null        },
  { label: 'Nov', income: null,       expense: null        },
  { label: 'Dec', income: null,       expense: null        },
]

// ── Mock: Yearly ─────────────────────────────────────────────
const CURRENT_YEAR = 2026
const DECADE_START = Math.floor((CURRENT_YEAR - 1) / 10) * 10 + 1 // 2021

const YEARLY_DATA: Record<number, { income: number; expense: number }> = {
  2022: { income: 180_000_000, expense: 120_000_000 },
  2024: { income: 240_000_000, expense: 160_000_000 },
  2025: { income: 280_000_000, expense: 190_000_000 },
  2026: { income: 130_000_000, expense:  89_000_000 },
}

const YEARLY_BARS: Bar[] = Array.from({ length: 10 }, (_, i) => {
  const year = DECADE_START + i
  const d = YEARLY_DATA[year]
  return { label: String(year), income: d?.income ?? null, expense: d?.expense ?? null }
})

const Y_TICKS_YEARLY = [300_000_000, 250_000_000, 200_000_000, 150_000_000, 100_000_000, 0]
const MAX_YEARLY     = 300_000_000

// ── Mock: Weekly ─────────────────────────────────────────────
const CURRENT_WEEK = 26

const WEEKLY_DATA: Record<number, { income: number; expense: number }> = {}
for (let w = 1; w <= CURRENT_WEEK; w++) {
  WEEKLY_DATA[w] = {
    income:  1_800_000 + w * 70_000,
    expense: 1_200_000 + w * 45_000,
  }
}

function buildWeeklyBars(page: number): Bar[] {
  const endWeek = CURRENT_WEEK - page * 12
  return Array.from({ length: 12 }, (_, i) => {
    const w = endWeek - 11 + i
    const label = w > 0
      ? `W${String(w).padStart(2, '0')}`
      : `W${String(w + 52).padStart(2, '0')}`
    const d = w > 0 ? WEEKLY_DATA[w] : undefined
    return { label, income: d?.income ?? null, expense: d?.expense ?? null }
  })
}

const Y_TICKS_WEEKLY = [5_000_000, 4_000_000, 3_000_000, 2_000_000, 1_000_000, 0]
const MAX_WEEKLY     = 5_000_000

// ── Mock: Region ─────────────────────────────────────────────
const REGION_BARS: Record<string, Bar[]> = {
  '서울': [
    { label: 'Jan', income: 18_000_000, expense: 12_000_000 },
    { label: 'Feb', income: 20_000_000, expense: 14_000_000 },
    { label: 'Mar', income: 19_500_000, expense: 13_500_000 },
    { label: 'Apr', income: 22_000_000, expense: 16_000_000 },
    { label: 'May', income: 25_000_000, expense: 18_000_000 },
    { label: 'Jun', income: 28_000_000, expense: 21_000_000 },
    ...Array.from({ length: 6 }, (_, i) => ({ label: ['Jul','Aug','Sep','Oct','Nov','Dec'][i], income: null, expense: null })),
  ],
  '도쿄': [
    { label: 'Jan', income: 8_000_000, expense: 6_000_000 },
    { label: 'Feb', income: 9_500_000, expense: 7_200_000 },
    ...Array.from({ length: 10 }, (_, i) => ({ label: ['Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i], income: null, expense: null })),
  ],
  '방콕': [
    { label: 'Jan', income: 12_000_000, expense: 8_500_000 },
    ...Array.from({ length: 11 }, (_, i) => ({ label: ['Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i], income: null, expense: null })),
  ],
  '발리':  Array.from({ length: 12 }, (_, i) => ({ label: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i], income: null, expense: null })),
  '제주도': Array.from({ length: 12 }, (_, i) => ({ label: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i], income: null, expense: null })),
}

// ── Mock: Tagging ────────────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const TAG_BARS: Record<string, Bar[]> = {
  '여행': [
    { label: 'Jan', income: null,       expense: 3_200_000 },
    { label: 'Feb', income: null,       expense: null       },
    { label: 'Mar', income: null,       expense: 5_800_000 },
    { label: 'Apr', income: null,       expense: null       },
    { label: 'May', income: null,       expense: 4_100_000 },
    { label: 'Jun', income: null,       expense: 7_500_000 },
    ...Array.from({ length: 6 }, (_, i) => ({ label: MONTHS[6 + i], income: null, expense: null })),
  ],
  '업무': [
    { label: 'Jan', income: 8_000_000,  expense: 1_200_000 },
    { label: 'Feb', income: 9_500_000,  expense: 1_400_000 },
    { label: 'Mar', income: 8_800_000,  expense: 1_100_000 },
    { label: 'Apr', income: 11_000_000, expense: 1_600_000 },
    { label: 'May', income: 12_500_000, expense: 1_800_000 },
    { label: 'Jun', income: 14_000_000, expense: 2_100_000 },
    ...Array.from({ length: 6 }, (_, i) => ({ label: MONTHS[6 + i], income: null, expense: null })),
  ],
  '건강': [
    { label: 'Jan', income: null, expense: 480_000  },
    { label: 'Feb', income: null, expense: 520_000  },
    { label: 'Mar', income: null, expense: 390_000  },
    { label: 'Apr', income: null, expense: 610_000  },
    { label: 'May', income: null, expense: 450_000  },
    { label: 'Jun', income: null, expense: 730_000  },
    ...Array.from({ length: 6 }, (_, i) => ({ label: MONTHS[6 + i], income: null, expense: null })),
  ],
  '자기개발': [
    { label: 'Jan', income: 2_000_000, expense: 350_000 },
    { label: 'Feb', income: 2_200_000, expense: 280_000 },
    { label: 'Mar', income: 1_800_000, expense: 420_000 },
    { label: 'Apr', income: 2_500_000, expense: 300_000 },
    { label: 'May', income: 2_800_000, expense: 380_000 },
    { label: 'Jun', income: 3_100_000, expense: 410_000 },
    ...Array.from({ length: 6 }, (_, i) => ({ label: MONTHS[6 + i], income: null, expense: null })),
  ],
  '엔터테인먼트': [
    { label: 'Jan', income: null, expense: 620_000  },
    { label: 'Feb', income: null, expense: 480_000  },
    { label: 'Mar', income: null, expense: 750_000  },
    { label: 'Apr', income: null, expense: 540_000  },
    { label: 'May', income: null, expense: 890_000  },
    { label: 'Jun', income: null, expense: 1_100_000 },
    ...Array.from({ length: 6 }, (_, i) => ({ label: MONTHS[6 + i], income: null, expense: null })),
  ],
}

// ── Y축 틱 & Max (Monthly/Region) ────────────────────────────
const Y_TICKS_MONTHLY = [50_000_000, 40_000_000, 30_000_000, 20_000_000, 10_000_000, 0]
const MAX_MONTHLY     = 50_000_000

// ── 기본 선택 인덱스 ─────────────────────────────────────────
function defaultSelected(bars: Bar[]): number {
  // 데이터 있는 마지막 항목
  let last = 0
  bars.forEach((b, i) => { if (b.income !== null) last = i })
  return last
}

// ── Y축 틱 동적 계산 (실제 데이터용) ────────────────────────
function computeYTicks(bars: Bar[]): { yTicks: number[]; maxVal: number } {
  const allVals = bars.flatMap(b => [b.income ?? 0, b.expense ?? 0])
  const rawMax = Math.max(...allVals, 1)
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)))
  const maxVal = Math.ceil(rawMax / magnitude) * magnitude
  const step = maxVal / 4
  const yTicks = [maxVal, maxVal - step, maxVal - 2 * step, maxVal - 3 * step, 0]
  return { yTicks, maxVal }
}

// ── Props ────────────────────────────────────────────────────
interface Props {
  mode: DashMode
  weekPage: number
  selectedRegion: string
  selectedTag: string
  barsOverride?: Bar[]        // 실제 DB 데이터 (제공 시 mock 무시)
  onPrevPage?: () => void     // WEEKLY: 이전 묶음(더 오래된 주차)
  onNextPage?: () => void     // WEEKLY: 다음 묶음(더 최신 주차)
  canPrevPage?: boolean
  canNextPage?: boolean
}

export default function CashFlowChart({ mode, weekPage, selectedRegion, selectedTag, barsOverride, onPrevPage, onNextPage, canPrevPage, canNextPage }: Props) {

  // ── 모드별 데이터 계산 ──────────────────────────────────────
  const { bars, yTicks, maxVal } = useMemo(() => {
    // 실제 데이터가 주어진 경우 사용
    if (barsOverride && barsOverride.length > 0) {
      return { bars: barsOverride, ...computeYTicks(barsOverride) }
    }
    // fallback: mock 데이터
    if (mode === 'YEARLY')  return { bars: YEARLY_BARS,                                   yTicks: Y_TICKS_YEARLY,  maxVal: MAX_YEARLY  }
    if (mode === 'WEEKLY')  return { bars: buildWeeklyBars(weekPage),                      yTicks: Y_TICKS_WEEKLY,  maxVal: MAX_WEEKLY  }
    if (mode === 'REGION')  return { bars: (REGION_BARS[selectedRegion] ?? MONTHLY_BARS).filter(b => b.income !== null || b.expense !== null), yTicks: Y_TICKS_MONTHLY, maxVal: MAX_MONTHLY }
    if (mode === 'TAGGING') return { bars: (TAG_BARS[selectedTag]       ?? MONTHLY_BARS).filter(b => b.income !== null || b.expense !== null), yTicks: Y_TICKS_MONTHLY, maxVal: MAX_MONTHLY }
    return { bars: MONTHLY_BARS, yTicks: Y_TICKS_MONTHLY, maxVal: MAX_MONTHLY }
  }, [mode, weekPage, selectedRegion, selectedTag, barsOverride])

  // ── REGION / TAGGING 내부 페이지네이션 ─────────────────────
  const [chartPage, setChartPage] = useState(0)

  useEffect(() => {
    setChartPage(0)
  }, [mode, selectedRegion, selectedTag])

  const needsInternalPaging = (mode === 'REGION' || mode === 'TAGGING') && bars.length > 12
  const displayedBars = needsInternalPaging
    ? bars.slice(chartPage * 12, chartPage * 12 + 12)
    : bars

  // ── 네비게이션 버튼 표시 여부 ───────────────────────────────
  const showLeftBtn = mode === 'WEEKLY'
    ? (canPrevPage ?? false)
    : (needsInternalPaging && chartPage > 0)

  const showRightBtn = mode === 'WEEKLY'
    ? (canNextPage ?? false)
    : (needsInternalPaging && (chartPage + 1) * 12 < bars.length)

  const handleLeft = mode === 'WEEKLY'
    ? onPrevPage
    : () => setChartPage(p => p - 1)

  const handleRight = mode === 'WEEKLY'
    ? onNextPage
    : () => setChartPage(p => p + 1)

  const [selectedIdx, setSelectedIdx] = useState(() => defaultSelected(bars))
  const [hoverIdx,    setHoverIdx]    = useState<number | null>(null)

  // 모드/페이지/지역 변경 시 선택 초기화
  useEffect(() => {
    setSelectedIdx(defaultSelected(bars))
  }, [bars])

  return (
    <div className="flex h-full gap-[6px] min-h-0">

      {/* ── Y축 레이블 ── */}
      <div className="flex flex-col justify-between pb-[22px] flex-shrink-0 w-[36px]">
        {yTicks.map((tick) => (
          <span key={tick} className={`block text-left text-[11px] leading-none text-[#6c7b8e] ${FONT}`}>
            {fmtY(tick, mode)}
          </span>
        ))}
      </div>

      {/* ── 차트 영역 ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">

        {/* 그리드 + 바 */}
        <div className="flex-1 relative min-h-0">

          {/* 수평 점선 그리드 */}
          {yTicks.map((tick, i) => (
            <div
              key={tick}
              className="absolute left-0 right-0 border-t border-dashed border-[#e4e5e9]"
              style={{ top: `${(i / (yTicks.length - 1)) * 100}%` }}
            />
          ))}

          {/* 네비게이션 오버레이 버튼 */}
          {showLeftBtn && (
            <button
              onClick={handleLeft}
              className="absolute left-[12px] top-1/2 -translate-y-1/2 z-40 w-[32px] h-[32px] rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center hover:bg-white/80 active:bg-white/90 transition-colors"
              style={{ border: '1px solid rgba(0,0,0,0.12)' }}
            >
              <ChevronLeft size={15} strokeWidth={2.5} className="text-[#18202a]" />
            </button>
          )}
          {showRightBtn && (
            <button
              onClick={handleRight}
              className="absolute right-[12px] top-1/2 -translate-y-1/2 z-40 w-[32px] h-[32px] rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center hover:bg-white/80 active:bg-white/90 transition-colors"
              style={{ border: '1px solid rgba(0,0,0,0.12)' }}
            >
              <ChevronRight size={15} strokeWidth={2.5} className="text-[#18202a]" />
            </button>
          )}

          {/* 바 컨테이너 */}
          <div className="absolute inset-0 flex items-end">
            <div className="w-full h-full flex items-end justify-around">
              {displayedBars.map((d, i) => {
                const isSelected = i === selectedIdx
                const isHovered  = i === hoverIdx
                const hasData    = d.income !== null && d.expense !== null

                if (!hasData) {
                  return (
                    <div
                      key={d.label}
                      className="flex-1 h-full flex items-end justify-center cursor-pointer"
                      onClick={() => setSelectedIdx(i)}
                    />
                  )
                }

                const income   = d.income!
                const expense  = d.expense!
                const incomeH  = (income  / maxVal) * 100
                const expenseH = (expense / maxVal) * 100
                const maxH     = Math.max(incomeH, expenseH)
                const incomeIsLarger = income >= expense
                const incomeZ  = incomeIsLarger ? 'z-10' : 'z-20'
                const expenseZ = incomeIsLarger ? 'z-20' : 'z-10'
                const tooltipRight = i < displayedBars.length / 2

                return (
                  <div
                    key={d.label}
                    className="flex-1 h-full flex items-end justify-center cursor-pointer"
                    onClick={() => setSelectedIdx(i)}
                    onMouseEnter={() => setHoverIdx(i)}
                    onMouseLeave={() => setHoverIdx(null)}
                  >
                    <div className="relative flex items-end justify-center" style={{ width: BAR_W, height: '100%' }}>

                      {/* 호버 팝업 */}
                      {isHovered && (
                        <div
                          className="absolute z-50 pointer-events-none bg-[#18202a] rounded-[8px] px-[14px] py-[10px] whitespace-nowrap"
                          style={{
                            bottom: `${maxH / 2}%`,
                            ...(tooltipRight
                              ? { left: `calc(${BAR_W}px + 8px)` }
                              : { right: `calc(${BAR_W}px + 8px)` }),
                          }}
                        >
                          <div className="flex gap-[12px]">
                            <div className="flex flex-col gap-[4px]">
                              <span className={`text-white text-[12px] leading-none ${FONT}`}>Income</span>
                              <span className={`text-white text-[12px] leading-none ${FONT}`}>Expenses</span>
                            </div>
                            <div className="flex flex-col gap-[4px]">
                              <span className={`text-[#5898ff] font-bold text-[12px] leading-none ${FONT}`}>{fmtNum(income)}</span>
                              <span className={`text-[#d30000] font-bold text-[12px] leading-none ${FONT}`}>{fmtNum(expense)}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 선택 월 테두리 */}
                      {isSelected && (
                        <div
                          className="absolute bottom-0 left-0 right-0 rounded-[4px] border-2 border-[#5898ff] z-30 pointer-events-none"
                          style={{ height: `${maxH}%` }}
                        />
                      )}

                      {/* 수입 바 */}
                      <div
                        className={`absolute bottom-0 left-0 right-0 rounded-[4px] ${incomeZ}`}
                        style={{ height: `${incomeH}%`, backgroundColor: '#5898ff' }}
                      />
                      {/* 지출 바 */}
                      <div
                        className={`absolute bottom-0 left-0 right-0 rounded-[4px] ${expenseZ}`}
                        style={{ height: `${expenseH}%`, backgroundColor: '#d8e9fd' }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* X축 레이블 */}
        <div className="flex justify-around pt-[8px] flex-shrink-0">
          {displayedBars.map((d, i) => (
            <div key={d.label} className="flex-1 text-center">
              <span
                className={`text-[12px] font-bold ${FONT} uppercase`}
                style={{
                  letterSpacing: '-0.0375em',
                  color: i === selectedIdx ? '#004ea7' : '#6c7b8e',
                }}
              >
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
