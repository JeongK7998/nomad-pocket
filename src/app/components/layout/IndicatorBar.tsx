'use client'

import { Bell } from 'lucide-react'

export interface ExchangeRateItem {
  code: string   // "USD", "JPY"
  rate: number   // 1 외화 = ? KRW
}

interface IndicatorBarProps {
  rates?: ExchangeRateItem[]
  lastUpdated?: string  // "HH:MM"
  unreadCount?: number
  onOpenNotifications?: () => void
}

function formatRate(code: string, rate: number): string {
  // 100 이상(JPY 등): 소수점 2자리, 이하(USD 등): 정수 + 소수점
  const formatted = rate >= 100
    ? rate.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : rate.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `KRW|${code} ${formatted}`
}

export function IndicatorBar({ rates = [], lastUpdated, unreadCount = 0, onOpenNotifications }: IndicatorBarProps) {
  return (
    <div className="h-[32px] relative shrink-0 w-full sticky top-0 z-20 bg-[#f4f4f7]">
      <div className="flex flex-row items-center justify-end size-full">
        <div className="content-stretch flex items-center gap-[24px] justify-end px-[32px] relative size-full">

          {rates.map((item) => (
            <span key={item.code} className="font-['Pretendard_Variable',sans-serif] font-medium text-[10px] text-[#6c7b8e] tracking-[0.5px] whitespace-nowrap">
              {formatRate(item.code, item.rate)}
            </span>
          ))}

          {lastUpdated && (
            <span className="font-['Pretendard_Variable',sans-serif] font-medium text-[10px] text-[#176bda] tracking-[0.5px] whitespace-nowrap">
              LAST UPDATED {lastUpdated}
            </span>
          )}

          <button onClick={onOpenNotifications} className="relative shrink-0 flex items-center justify-center text-[#6c7b8e] hover:text-[#18202a] transition-colors">
            <Bell size={14} />
            {unreadCount > 0 && (
              <span className="absolute -right-[10px] -top-[8px] min-w-[18px] h-[18px] px-[4px] rounded-[6px] bg-[#ff786b] text-white font-['Pretendard_Variable',sans-serif] text-[10px] font-bold leading-[18px] text-center">
                {unreadCount}
              </span>
            )}
          </button>

        </div>
      </div>
    </div>
  )
}
