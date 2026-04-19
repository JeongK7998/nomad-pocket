'use client'

import { useState } from 'react'

export interface LineChartDataPoint {
  month: number           // 1-12
  actual: number | null   // null = 데이터 없음 (미래 월)
  target: number | null   // null = 목표 없음
}

interface Props {
  data: LineChartDataPoint[]
  currentMonth: number
}

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const FONT = 'Pretendard Variable, sans-serif'

function fmtShort(n: number): string {
  if (n >= 100_000_000) return `₩${(n / 100_000_000).toFixed(1)}억`
  if (n >= 1_000_000)   return `₩${(n / 1_000_000).toFixed(0)}M`
  if (n >= 1_000)       return `₩${(n / 1_000).toFixed(0)}K`
  return `₩${n}`
}

function fmtFull(n: number): string {
  return '₩' + n.toLocaleString('ko-KR')
}

// ── Y축 스케일 계산 ──────────────────────────────────────────
function computeScale(data: LineChartDataPoint[]): { yTicks: number[]; maxVal: number } {
  const vals = data.flatMap(d => [d.actual ?? 0, d.target ?? 0]).filter(v => v > 0)
  const rawMax = Math.max(...vals, 1)
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)))
  const maxVal = Math.ceil(rawMax / magnitude) * magnitude
  const step = maxVal / 4
  const yTicks = [maxVal, maxVal - step, maxVal - step * 2, maxVal - step * 3, 0]
  return { yTicks, maxVal }
}

// ── SVG 좌표 ──────────────────────────────────────────────────
const PAD = { top: 24, right: 24, bottom: 44, left: 72 }
const VW  = 760   // viewBox width
const VH  = 280   // viewBox height
const CW  = VW - PAD.left - PAD.right
const CH  = VH - PAD.top  - PAD.bottom

export default function MonthlyLineChart({ data, currentMonth }: Props) {
  const [hovered, setHovered] = useState<number | null>(null)
  const { yTicks, maxVal } = computeScale(data)

  const toX = (month: number) => ((month - 1) / 11) * CW
  const toY = (val: number)   => CH - (val / maxVal) * CH

  // 실제 라인: 현재 월까지만
  const actualPts = data.filter(d => d.actual !== null && d.month <= currentMonth)
  const actualPath = actualPts.length > 1
    ? actualPts.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(d.month).toFixed(1)},${toY(d.actual!).toFixed(1)}`).join(' ')
    : ''

  // ── 목표 라인: 계단형(step) 경로 ─────────────────────────────
  // • 데이터가 없으면 빈 문자열
  // • 단일 값이면 Jan 왼쪽 ~ Dec 오른쪽 전체 수평선
  // • 값이 바뀌는 달부터 꺾임: 수평 이동 → 수직 이동 → 수평 이동
  const targetPts = data.filter(d => d.target !== null)
  const targetPath = (() => {
    if (targetPts.length === 0) return ''

    // 첫 번째 값
    const firstY = toY(targetPts[0].target!).toFixed(1)

    if (targetPts.length === 1) {
      // 단일 포인트 → 전체 수평선
      return `M0,${firstY} L${CW.toFixed(1)},${firstY}`
    }

    // 복수 포인트 → step 라인
    // 시작: 왼쪽 끝(0)에서 첫 번째 포인트까지 수평
    let path = `M0,${firstY} L${toX(targetPts[0].month).toFixed(1)},${firstY}`

    for (let i = 1; i < targetPts.length; i++) {
      const curr  = targetPts[i]
      const prev  = targetPts[i - 1]
      const currX = toX(curr.month).toFixed(1)
      const currY = toY(curr.target!).toFixed(1)
      const prevY = toY(prev.target!).toFixed(1)

      if (curr.target !== prev.target) {
        // 값이 달라지면: 현재 X에서 수직으로 꺾임 후 수평 연장
        path += ` L${currX},${prevY}`  // 수평: 이전 Y 유지하며 현재 X까지
        path += ` L${currX},${currY}`  // 수직: 새 Y로 이동
      } else {
        // 값이 같으면: 그냥 수평 연장
        path += ` L${currX},${currY}`
      }
    }

    // 마지막 포인트에서 오른쪽 끝까지 수평 연장
    const lastY = toY(targetPts[targetPts.length - 1].target!).toFixed(1)
    path += ` L${CW.toFixed(1)},${lastY}`

    return path
  })()

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        style={{ width: '100%', height: VH, display: 'block' }}
        onMouseLeave={() => setHovered(null)}
      >
        <g transform={`translate(${PAD.left},${PAD.top})`}>

          {/* ── 수평 그리드 + Y축 레이블 ── */}
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={0} y1={toY(tick).toFixed(1)}
                x2={CW} y2={toY(tick).toFixed(1)}
                stroke="#e6e8f1" strokeWidth={1} strokeDasharray="4 4"
              />
              <text
                x={-10} y={toY(tick)}
                textAnchor="end" dominantBaseline="middle"
                fontSize={10} fill="#6c7b8e" fontFamily={FONT}
              >
                {fmtShort(tick)}
              </text>
            </g>
          ))}

          {/* ── 목표 라인 (대시) ── */}
          {targetPath && (
            <path
              d={targetPath}
              fill="none"
              stroke="#18202a"
              strokeWidth={1.5}
              strokeDasharray="6 4"
              opacity={0.35}
            />
          )}

          {/* ── 실제 라인 ── */}
          {actualPath && (
            <path d={actualPath} fill="none" stroke="#5898ff" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
          )}

          {/* ── 데이터 포인트 ── */}
          {data.map((d) => {
            const x = toX(d.month)
            const isHov = hovered === d.month

            // 미래 월: 목표 있으면 빈 원
            if (d.month > currentMonth) {
              if (d.target === null) return null
              return (
                <circle
                  key={d.month}
                  cx={x} cy={toY(d.target)}
                  r={3} fill="white" stroke="#d8e9fd" strokeWidth={1.5}
                />
              )
            }

            // 과거/현재 월: actual 있으면 채운 원
            if (d.actual === null) return null
            const isOver  = d.target !== null && d.actual > d.target
            const dotColor = isOver ? '#ff786b' : '#5898ff'
            const dotY = toY(d.actual)

            return (
              <g key={d.month}>
                {/* 호버 감지 투명 영역 */}
                <circle
                  cx={x} cy={dotY} r={20}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHovered(d.month)}
                />

                {/* 실제 dot */}
                <circle
                  cx={x} cy={dotY}
                  r={isHov ? 6 : 4}
                  fill={dotColor}
                  stroke="white"
                  strokeWidth={2}
                  style={{ transition: 'r 0.1s' }}
                />

                {/* 호버 툴팁 */}
                {isHov && (() => {
                  const tipW = 136
                  const tipH = d.target !== null ? 70 : 50
                  const tipX = x > CW / 2 ? x - tipW - 8 : x + 12
                  const tipY = dotY - tipH / 2
                  return (
                    <g>
                      <rect x={tipX} y={tipY} width={tipW} height={tipH} rx={8} fill="#18202a" />
                      <text x={tipX + 12} y={tipY + 18} fontSize={10} fill="#9ab4d0" fontFamily={FONT}>
                        {MONTH_LABELS[d.month - 1]} 실제 지출
                      </text>
                      <text x={tipX + 12} y={tipY + 36} fontSize={13} fill={dotColor} fontFamily={FONT} fontWeight="bold">
                        {fmtShort(d.actual)}
                      </text>
                      {d.target !== null && (
                        <text x={tipX + 12} y={tipY + 56} fontSize={10} fill="#6c7b8e" fontFamily={FONT}>
                          목표: {fmtShort(d.target)}
                        </text>
                      )}
                    </g>
                  )
                })()}
              </g>
            )
          })}

          {/* ── X축 레이블 ── */}
          {data.map((d) => (
            <text
              key={d.month}
              x={toX(d.month)} y={CH + 24}
              textAnchor="middle"
              fontSize={11}
              fill={d.month === currentMonth ? '#004ea7' : '#6c7b8e'}
              fontFamily={FONT}
              fontWeight={d.month === currentMonth ? 'bold' : 'normal'}
            >
              {MONTH_LABELS[d.month - 1]}
            </text>
          ))}

          {/* ── 범례 ── */}
          <g transform={`translate(0, ${CH + 38})`}>
            <line x1={0} y1={5} x2={20} y2={5} stroke="#5898ff" strokeWidth={2.5} strokeLinecap="round" />
            <circle cx={10} cy={5} r={3.5} fill="#5898ff" />
            <text x={26} y={9} fontSize={10} fill="#6c7b8e" fontFamily={FONT}>실제 지출</text>

            <line x1={80} y1={5} x2={100} y2={5} stroke="#18202a" strokeWidth={1.5} strokeDasharray="5 3" opacity={0.4} />
            <text x={106} y={9} fontSize={10} fill="#6c7b8e" fontFamily={FONT}>목표 라인</text>

            <circle cx={180} cy={5} r={4} fill="#5898ff" stroke="white" strokeWidth={1.5} />
            <text x={190} y={9} fontSize={10} fill="#6c7b8e" fontFamily={FONT}>달성</text>

            <circle cx={230} cy={5} r={4} fill="#ff786b" stroke="white" strokeWidth={1.5} />
            <text x={240} y={9} fontSize={10} fill="#6c7b8e" fontFamily={FONT}>초과</text>
          </g>

        </g>
      </svg>

      {/* 전체 금액 호버 표시 */}
      {hovered !== null && (() => {
        const d = data.find(p => p.month === hovered)
        if (!d || d.actual === null) return null
        return (
          <div className="mt-[4px] text-center text-[11px] text-[#6c7b8e]" style={{ fontFamily: FONT }}>
            {fmtFull(d.actual)} {d.target !== null ? `/ 목표 ${fmtFull(d.target)}` : ''}
          </div>
        )
      })()}
    </div>
  )
}
