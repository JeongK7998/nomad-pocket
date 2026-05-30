'use client'

export interface BreakdownItem { name: string; value: number; color: string }

interface Props { data: BreakdownItem[] }

const FONT = "font-['Pretendard_Variable',sans-serif]"

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const angleRad = (angleDeg * Math.PI) / 180
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy - radius * Math.sin(angleRad),
  }
}

function describeTopSemiArcPath(cx: number, cy: number, radius: number) {
  const left = polarToCartesian(cx, cy, radius, 180)
  const right = polarToCartesian(cx, cy, radius, 0)

  return `M ${left.x} ${left.y} A ${radius} ${radius} 0 0 1 ${right.x} ${right.y}`
}

function SemiDonut({ data }: { data: BreakdownItem[] }) {
  const safeData = data.filter((item) => item.value > 0)
  const total = safeData.reduce((sum, item) => sum + item.value, 0)
  const cx = 88
  const cy = 88
  const radius = 64
  const strokeWidth = 28
  const pathD = describeTopSemiArcPath(cx, cy, radius)
  let offset = 0

  return (
    <svg width="176" height="92" viewBox="0 0 176 92" aria-hidden="true">
      {total <= 0 ? (
        <path
          d={pathD}
          fill="none"
          stroke="#e9eef6"
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
          pathLength={100}
        />
      ) : (
        safeData.map((item, index) => {
          const segmentLength = (item.value / total) * 100
          const path = (
            <path
              key={`${item.name}-${index}`}
              d={pathD}
              fill="none"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeLinecap="butt"
              pathLength={100}
              strokeDasharray={`${segmentLength} ${100 - segmentLength}`}
              strokeDashoffset={-offset}
            />
          )
          offset += segmentLength

          return path
        })
      )}
    </svg>
  )
}

function LegendColumn({ items }: { items: BreakdownItem[] }) {
  return (
    <div className="flex flex-col items-start">
      {items.map((item) => (
        <div key={item.name} className="flex w-[110px] items-center justify-center">
          <div className="flex h-[14px] min-w-0 flex-1 items-center justify-center gap-[10px]">
            <span
              className="h-[10px] w-[10px] flex-shrink-0 rounded-[4px]"
              style={{ backgroundColor: item.color }}
            />
            <span className={`${FONT} w-[48px] text-[10px] font-medium leading-[14px] text-[#18202a]`}>
              {item.name}
            </span>
          </div>
          <span className={`${FONT} flex-shrink-0 whitespace-nowrap text-[10px] font-medium leading-[14px] text-[#18202a]`}>
            {item.value.toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  )
}

export default function ExpenseBreakdown({ data }: Props) {
  const midpoint = Math.ceil(data.length / 2)
  const col1 = data.slice(0, midpoint)
  const col2 = data.slice(midpoint)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <p className={`${FONT} flex-shrink-0 text-[12px] font-bold uppercase leading-[normal] text-[#18202a]`}>
        Expense Breakdown
      </p>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-between pt-[12px]">
        <div className="flex flex-shrink-0 items-start gap-[48px]">
          <LegendColumn items={col1} />
          <LegendColumn items={col2} />
        </div>

        <div className="flex h-[92px] w-[176px] flex-shrink-0 items-start justify-center overflow-hidden">
          <SemiDonut data={data} />
        </div>
      </div>
    </div>
  )
}
