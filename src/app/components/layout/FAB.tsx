'use client'

import { Plus } from 'lucide-react'

interface FABProps {
  onClick?: () => void
}

export function FAB({ onClick }: FABProps) {
  return (
    /* fixed, bottom-24px, right-33px, 58×58px, bg-#004ea7 */
    <button
      onClick={onClick}
      aria-label="거래 추가"
      className="
        fixed bottom-[24px] right-[33px] z-30
        w-[58px] h-[58px] rounded-full
        bg-[#004ea7] text-white
        flex items-center justify-center
        shadow-[0px_8px_24px_0px_rgba(0,78,167,0.4)]
        hover:bg-[#003d86] active:scale-95
        transition-all duration-150
      "
    >
      <Plus size={24} strokeWidth={2.5} />
    </button>
  )
}
