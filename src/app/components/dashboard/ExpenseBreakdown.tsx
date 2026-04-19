'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

export interface BreakdownItem { name: string; value: number; color: string }

interface Props { data: BreakdownItem[] }

export default function ExpenseBreakdown({ data }: Props) {
  const col1 = data.slice(0, Math.ceil(data.length / 2))
  const col2 = data.slice(Math.ceil(data.length / 2))

  return (
    <div className="flex flex-col h-full min-h-0">
      <p className="font-['Pretendard_Variable',sans-serif] font-bold text-[20px] leading-[1em] text-[#18202a] uppercase flex-shrink-0 mb-[18px]">
        Expense Breakdown
      </p>

      <div className="flex flex-col items-center gap-[12px]">
        {/* Legend: 2 cols */}
        <div className="flex gap-[36px]">
          {[col1, col2].map((col, ci) => (
            <div key={ci} style={{ width: 110 }}>
              {col.map((d) => (
                <div key={d.name} className="flex items-center" style={{ height: 14 }}>
                  <div className="flex items-center gap-[10px] flex-1 min-w-0">
                    <span className="flex-shrink-0" style={{ width: 10, height: 10, backgroundColor: d.color, borderRadius: 4 }} />
                    <span className="font-['Pretendard_Variable',sans-serif] font-medium text-[10px] text-[#18202a] truncate leading-none">
                      {d.name}
                    </span>
                  </div>
                  <span className="font-['Pretendard_Variable',sans-serif] font-medium text-[10px] text-[#18202a] leading-none flex-shrink-0 text-right" style={{ width: 28 }}>
                    {d.value}%
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Semi-circle donut */}
        <div style={{ width: 170, height: 88, marginTop: 8 }} className="flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 3, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={data}
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius={55}
                outerRadius={85}
                dataKey="value"
                stroke="none"
                paddingAngle={0}
              >
                {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
