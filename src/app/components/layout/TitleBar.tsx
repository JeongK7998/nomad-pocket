'use client'

import { useAppMode, type AppMode } from '@/app/context/AppModeContext'

const MODES: AppMode[] = ['YEARLY', 'MONTHLY', 'WEEKLY', 'DAILY', 'CALENDAR']

interface TitleBarProps {
  title?: React.ReactNode
}

export function TitleBar({ title }: TitleBarProps) {
  const { mode, setMode } = useAppMode()

  return (
    /* sticky top-[32px] (IndicatorBar 높이만큼 내려옴) */
    <div className="relative shrink-0 w-full sticky top-[32px] z-20 bg-[#f4f4f7] pb-[16px] pt-[20px] px-[32px]">
      <div className="flex flex-row items-center justify-between">

        {/* 좌측: 페이지 타이틀 */}
        <div className="flex items-center gap-[12px]">
          {title}
        </div>

        {/* 우측: 모드 토글 버튼 그룹 */}
        <div className="relative flex items-start p-[4px] rounded-[9999px]">
          {/* 배경 */}
          <div
            aria-hidden="true"
            className="absolute bg-[#e6e8f1] inset-0 pointer-events-none rounded-[9999px]"
          />
          {/* 내부 그림자 */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]"
          />

          {MODES.map((m) => {
            const active = mode === m
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`
                  relative flex flex-col items-center justify-center px-[16px] py-[8px] shrink-0 transition-all rounded-[9999px] text-[12px] tracking-[0px] whitespace-nowrap
                  ${active
                    ? 'bg-white text-[#004ea7] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] font-semibold'
                    : 'text-[#6c7b8e] font-medium hover:text-[#18202a]'
                  }
                `}
              >
                <span className="font-['Pretendard_Variable',sans-serif] leading-[16px]">
                  {m}
                </span>
              </button>
            )
          })}
        </div>

      </div>
    </div>
  )
}
