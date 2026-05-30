'use client'

import { useEffect, useState } from 'react'

export interface LineChartDataPoint {
  month: number
  actual: number | null
  target: number | null
}

interface Props {
  data: LineChartDataPoint[]
  currentMonth: number
}

const MONTH_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
const FONT = 'Pretendard Variable, sans-serif'

function fmtShort(n: number): string {
  if (n >= 100_000_000) return `₩${(n / 100_000_000).toFixed(1)}억`
  if (n >= 1_000_000) return `₩${(n / 1_000_000).toFixed(0)}M`
  if (n >= 1_000) return `₩${(n / 1_000).toFixed(0)}K`
  return `₩${n}`
}

function fmtFull(n: number): string {
  return '₩' + n.toLocaleString('ko-KR')
}

function getSeriesValues(data: LineChartDataPoint[]) {
  return data.flatMap((d) => [d.actual ?? 0, d.target ?? 0]).filter((v) => v > 0)
}

function computeDesktopScale(data: LineChartDataPoint[]) {
  const vals = getSeriesValues(data)
  const rawMax = Math.max(...vals, 1)
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)))
  const maxVal = Math.ceil(rawMax / magnitude) * magnitude
  const minVal = 0
  const step = (maxVal - minVal) / 4
  const yTicks = [maxVal, maxVal - step, maxVal - step * 2, maxVal - step * 3, minVal]
  return { minVal, maxVal, yTicks }
}

function computeMobileScale(data: LineChartDataPoint[]) {
  const vals = getSeriesValues(data)
  const rawMax = Math.max(...vals, 1)
  const rawMin = Math.min(...vals, rawMax)
  const range = Math.max(rawMax - rawMin, rawMax * 0.05)
  const padding = Math.max(range * 0.06, rawMax * 0.01)
  const minVal = Math.max(0, rawMin - padding)
  const maxVal = rawMax + padding
  const step = (maxVal - minVal) / 3
  const yTicks = [maxVal, maxVal - step, maxVal - step * 2, minVal]
  return { minVal, maxVal, yTicks }
}

function buildTargetPath(
  data: LineChartDataPoint[],
  toX: (month: number) => number,
  toY: (value: number) => number,
  width: number
) {
  const targetPts = data.filter((d) => d.target !== null)
  if (targetPts.length === 0) return ''

  const firstY = toY(targetPts[0].target!).toFixed(1)
  if (targetPts.length === 1) {
    return `M0,${firstY} L${width.toFixed(1)},${firstY}`
  }

  let path = `M0,${firstY} L${toX(targetPts[0].month).toFixed(1)},${firstY}`

  for (let i = 1; i < targetPts.length; i++) {
    const curr = targetPts[i]
    const prev = targetPts[i - 1]
    const currX = toX(curr.month).toFixed(1)
    const currY = toY(curr.target!).toFixed(1)
    const prevY = toY(prev.target!).toFixed(1)

    if (curr.target !== prev.target) {
      path += ` L${currX},${prevY}`
      path += ` L${currX},${currY}`
    } else {
      path += ` L${currX},${currY}`
    }
  }

  const lastY = toY(targetPts[targetPts.length - 1].target!).toFixed(1)
  path += ` L${width.toFixed(1)},${lastY}`
  return path
}

function MobileChart({
  data,
  currentMonth,
  hovered,
  setHovered,
}: {
  data: LineChartDataPoint[]
  currentMonth: number
  hovered: number | null
  setHovered: (month: number | null) => void
}) {
  const selectedMonth = hovered ?? currentMonth
  const selected = data.find((point) => point.month === selectedMonth)

  const { minVal, maxVal, yTicks } = computeMobileScale(data)
  const PAD = { top: 6, right: 6, bottom: 22, left: 50 }
  const VW = 360
  const VH = 142
  const CW = VW - PAD.left - PAD.right
  const CH = VH - PAD.top - PAD.bottom
  const safeRange = Math.max(maxVal - minVal, 1)

  const toX = (month: number) => ((month - 1) / 11) * CW
  const toY = (value: number) => CH - ((value - minVal) / safeRange) * CH

  const actualPts = data.filter((d) => d.actual !== null && d.month <= currentMonth)
  const actualPath = actualPts.length > 1
    ? actualPts.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(d.month).toFixed(1)},${toY(d.actual!).toFixed(1)}`).join(' ')
    : ''
  const targetPath = buildTargetPath(data, toX, toY, CW)

  return (
    <div className="w-full">
      <div className="rounded-[18px] bg-[#f8fbff] px-[10px] py-[10px]">
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          style={{ width: '100%', height: VH, display: 'block' }}
        >
          <g transform={`translate(${PAD.left},${PAD.top})`}>
            {yTicks.map((tick) => (
              <g key={tick}>
                <line
                  x1={0}
                  y1={toY(tick)}
                  x2={CW}
                  y2={toY(tick)}
                  stroke="#dfe8f7"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <text
                  x={-8}
                  y={toY(tick)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={12}
                  fill="#708198"
                  fontFamily={FONT}
                  fontWeight={600}
                >
                  {fmtShort(tick)}
                </text>
              </g>
            ))}

            {targetPath && (
              <path
                d={targetPath}
                fill="none"
                stroke="#a8b4c8"
                strokeWidth={1.5}
                strokeDasharray="5 4"
              />
            )}

            {actualPath && (
              <path
                d={actualPath}
                fill="none"
                stroke="#5d90ff"
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}

            {data.map((d) => {
              const x = toX(d.month)

              if (d.month > currentMonth) {
                if (d.target === null) return null
                return (
                  <circle
                    key={d.month}
                    cx={x}
                    cy={toY(d.target)}
                    r={2.5}
                    fill="white"
                    stroke="#cfe0fb"
                    strokeWidth={1.25}
                  />
                )
              }

              if (d.actual === null) return null
              const isOver = d.target !== null && d.actual > d.target
              const isActive = selectedMonth === d.month

              return (
                <g key={d.month}>
                  <circle
                    cx={x}
                    cy={toY(d.actual)}
                    r={12}
                    fill="transparent"
                    onClick={() => setHovered(d.month)}
                    style={{ cursor: 'pointer' }}
                  />
                  <circle
                    cx={x}
                    cy={toY(d.actual)}
                    r={isActive ? 4.5 : 3.5}
                    fill={isOver ? '#f27d68' : '#5d90ff'}
                    stroke="white"
                    strokeWidth={1.6}
                  />
                </g>
              )
            })}

            {data.map((d) => (
              <text
                key={d.month}
                x={toX(d.month)}
                y={CH + 18}
                textAnchor="middle"
                fontSize={12}
                fill={selectedMonth === d.month ? '#004ea7' : '#708198'}
                fontFamily={FONT}
                fontWeight={selectedMonth === d.month ? 700 : 500}
              >
                {MONTH_LABELS[d.month - 1]}
              </text>
            ))}
          </g>
        </svg>
      </div>

      <div className="mt-[10px] flex items-center justify-center gap-[14px] text-[11px] text-[#708198]" style={{ fontFamily: FONT }}>
        <span className="inline-flex items-center gap-[5px]">
          <svg width="22" height="8" viewBox="0 0 22 8" fill="none" aria-hidden="true">
            <line x1="0" y1="4" x2="22" y2="4" stroke="#5d90ff" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="11" cy="4" r="3.5" fill="#5d90ff" />
          </svg>
          실제 지출
        </span>
        <span className="inline-flex items-center gap-[5px]">
          <svg width="22" height="8" viewBox="0 0 22 8" fill="none" aria-hidden="true">
            <line x1="0" y1="4" x2="22" y2="4" stroke="#a8b4c8" strokeWidth="1.5" strokeDasharray="5 4" />
          </svg>
          목표 라인
        </span>
        <span className="inline-flex items-center gap-[5px]">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
            <circle cx="4" cy="4" r="4" fill="#5d90ff" />
          </svg>
          달성
        </span>
        <span className="inline-flex items-center gap-[5px]">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
            <circle cx="4" cy="4" r="4" fill="#f27d68" />
          </svg>
          초과
        </span>
      </div>

      {selected && selected.actual !== null && (
        <div
          className="mt-[8px] rounded-[14px] bg-[#f3f7fd] px-[12px] py-[10px] text-center"
          style={{ fontFamily: FONT }}
        >
          <div className="text-[11px] font-semibold text-[#708198]">{selected.month}월 실적</div>
          <div className="mt-[2px] text-[18px] font-bold text-[#18202a]">{fmtFull(selected.actual)}</div>
          {selected.target !== null && (
            <div className="mt-[2px] text-[12px] text-[#708198]">목표 {fmtFull(selected.target)}</div>
          )}
        </div>
      )}
    </div>
  )
}

function DesktopChart({
  data,
  currentMonth,
  hovered,
  setHovered,
}: {
  data: LineChartDataPoint[]
  currentMonth: number
  hovered: number | null
  setHovered: (month: number | null) => void
}) {
  const { minVal, maxVal, yTicks } = computeDesktopScale(data)
  const PAD = { top: 24, right: 24, bottom: 44, left: 72 }
  const VW = 760
  const VH = 280
  const CW = VW - PAD.left - PAD.right
  const CH = VH - PAD.top - PAD.bottom
  const safeRange = Math.max(maxVal - minVal, 1)

  const toX = (month: number) => ((month - 1) / 11) * CW
  const toY = (value: number) => CH - ((value - minVal) / safeRange) * CH

  const actualPts = data.filter((d) => d.actual !== null && d.month <= currentMonth)
  const actualPath = actualPts.length > 1
    ? actualPts.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(d.month).toFixed(1)},${toY(d.actual!).toFixed(1)}`).join(' ')
    : ''
  const targetPath = buildTargetPath(data, toX, toY, CW)

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        style={{ width: '100%', height: VH, display: 'block' }}
        onMouseLeave={() => setHovered(null)}
      >
        <g transform={`translate(${PAD.left},${PAD.top})`}>
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={0}
                y1={toY(tick)}
                x2={CW}
                y2={toY(tick)}
                stroke="#e6e8f1"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <text
                x={-10}
                y={toY(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={10}
                fill="#6c7b8e"
                fontFamily={FONT}
              >
                {fmtShort(tick)}
              </text>
            </g>
          ))}

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

          {actualPath && (
            <path
              d={actualPath}
              fill="none"
              stroke="#5898ff"
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {data.map((d) => {
            const x = toX(d.month)
            const isHov = hovered === d.month

            if (d.month > currentMonth) {
              if (d.target === null) return null
              return (
                <circle
                  key={d.month}
                  cx={x}
                  cy={toY(d.target)}
                  r={3}
                  fill="white"
                  stroke="#d8e9fd"
                  strokeWidth={1.5}
                />
              )
            }

            if (d.actual === null) return null
            const isOver = d.target !== null && d.actual > d.target
            const dotColor = isOver ? '#ff786b' : '#5898ff'
            const dotY = toY(d.actual)

            return (
              <g key={d.month}>
                <circle
                  cx={x}
                  cy={dotY}
                  r={20}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHovered(d.month)}
                />
                <circle
                  cx={x}
                  cy={dotY}
                  r={isHov ? 6 : 4}
                  fill={dotColor}
                  stroke="white"
                  strokeWidth={2}
                  style={{ transition: 'r 0.1s' }}
                />
                {isHov && (
                  <g>
                    <rect
                      x={x > CW / 2 ? x - 144 : x + 12}
                      y={dotY - 35}
                      width={136}
                      height={70}
                      rx={8}
                      fill="#18202a"
                    />
                    <text
                      x={(x > CW / 2 ? x - 144 : x + 12) + 12}
                      y={dotY - 17}
                      fontSize={10}
                      fill="#9ab4d0"
                      fontFamily={FONT}
                    >
                      {d.month}월 실제 지출
                    </text>
                    <text
                      x={(x > CW / 2 ? x - 144 : x + 12) + 12}
                      y={dotY + 1}
                      fontSize={13}
                      fill={dotColor}
                      fontFamily={FONT}
                      fontWeight="bold"
                    >
                      {fmtShort(d.actual)}
                    </text>
                    {d.target !== null && (
                      <text
                        x={(x > CW / 2 ? x - 144 : x + 12) + 12}
                        y={dotY + 21}
                        fontSize={10}
                        fill="#6c7b8e"
                        fontFamily={FONT}
                      >
                        목표: {fmtShort(d.target)}
                      </text>
                    )}
                  </g>
                )}
              </g>
            )
          })}

          {data.map((d) => (
            <text
              key={d.month}
              x={toX(d.month)}
              y={CH + 24}
              textAnchor="middle"
              fontSize={11}
              fill={d.month === currentMonth ? '#004ea7' : '#6c7b8e'}
              fontFamily={FONT}
              fontWeight={d.month === currentMonth ? 'bold' : 'normal'}
            >
              {MONTH_LABELS[d.month - 1]}
            </text>
          ))}

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

      {hovered !== null && (() => {
        const selected = data.find((p) => p.month === hovered)
        if (!selected || selected.actual === null) return null
        return (
          <div className="mt-[4px] text-center text-[11px] text-[#6c7b8e]" style={{ fontFamily: FONT }}>
            {fmtFull(selected.actual)} {selected.target !== null ? `/ 목표 ${fmtFull(selected.target)}` : ''}
          </div>
        )
      })()}
    </div>
  )
}

export default function MonthlyLineChart({ data, currentMonth }: Props) {
  const [hovered, setHovered] = useState<number | null>(currentMonth)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    setHovered(currentMonth)
  }, [currentMonth, isMobile])

  if (isMobile) {
    return (
      <MobileChart
        data={data}
        currentMonth={currentMonth}
        hovered={hovered}
        setHovered={setHovered}
      />
    )
  }

  return (
    <DesktopChart
      data={data}
      currentMonth={currentMonth}
      hovered={hovered}
      setHovered={setHovered}
    />
  )
}
