'use client'

import type { BreakdownItem } from './ExpenseBreakdown'

interface Props { data: BreakdownItem[] }

export default function IncomeBreakdown({ data }: Props) {
  // 100칸 박스 배열 생성 (비율 기반)
  const boxes: string[] = []
  data.forEach((cat) => {
    for (let i = 0; i < cat.value; i++) boxes.push(cat.color)
  })
  while (boxes.length < 100) boxes.push(data[data.length - 1]?.color ?? '#EBEBEB')

  return (
    <div className="flex flex-col justify-between h-full min-h-0">
      <p className="font-['Pretendard_Variable',sans-serif] font-bold text-[20px] leading-none text-[#18202a] uppercase flex-shrink-0">
        Income Breakdown
      </p>

      <div className="flex justify-between items-center px-[12px] pb-[24px]">
        {/* 10×10 박스 그리드 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 10px)', gridTemplateRows: 'repeat(10, 10px)', gap: 4 }}>
          {boxes.map((color, i) => (
            <div key={i} style={{ width: 10, height: 10, backgroundColor: color, borderRadius: 2 }} />
          ))}
        </div>

        {/* 범례 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {data.map((d) => (
            <div key={d.name} className="flex items-center" style={{ width: 110, height: 14 }}>
              <div className="flex items-center gap-[10px] flex-1 min-w-0">
                <span className="flex-shrink-0" style={{ width: 6, height: 6, backgroundColor: d.color, borderRadius: 4 }} />
                <span className="font-['Pretendard_Variable',sans-serif] font-medium text-[10px] text-[#18202a] leading-none truncate">
                  {d.name}
                </span>
              </div>
              <span className="font-['Pretendard_Variable',sans-serif] font-medium text-[10px] text-[#18202a] leading-none flex-shrink-0 text-right" style={{ width: 28 }}>
                {d.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
