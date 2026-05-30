'use client'

import { useRef, useState } from 'react'
import { Plus } from 'lucide-react'

interface FABProps {
  onClick?: () => void
}

const BUTTON_SIZE = 58
const RIGHT_OFFSET = 33
const TUCKED_VISIBLE_RATIO = 0.2
const TUCKED_X = RIGHT_OFFSET + BUTTON_SIZE * (1 - TUCKED_VISIBLE_RATIO)

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}

export function FAB({ onClick }: FABProps) {
  const [tucked, setTucked] = useState(false)
  const [dragX, setDragX] = useState<number | null>(null)
  const startXRef = useRef(0)
  const movedRef = useRef(false)

  const currentX = dragX ?? (tucked ? TUCKED_X : 0)

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    startXRef.current = event.clientX
    movedRef.current = false
    setDragX(tucked ? TUCKED_X : 0)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (dragX === null) return
    const deltaX = event.clientX - startXRef.current
    if (Math.abs(deltaX) > 4) movedRef.current = true
    const baseX = tucked ? TUCKED_X : 0
    setDragX(clamp(baseX + deltaX, 0, TUCKED_X))
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    const finalX = dragX ?? (tucked ? TUCKED_X : 0)
    event.currentTarget.releasePointerCapture(event.pointerId)
    setDragX(null)

    if (!movedRef.current) return
    setTucked(finalX > TUCKED_X * 0.5)
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (movedRef.current) {
      event.preventDefault()
      movedRef.current = false
      return
    }

    if (tucked) {
      setTucked(false)
      return
    }

    onClick?.()
  }

  return (
    /* fixed, bottom-24px, right-33px, 58×58px, bg-#004ea7 */
    <button
      type="button"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => { setDragX(null); movedRef.current = false }}
      onClick={handleClick}
      aria-label={tucked ? '거래 추가 버튼 다시 보이기' : '거래 추가'}
      title={tucked ? '왼쪽으로 스와이프하여 되돌리기' : '오른쪽으로 드래그하여 숨기기'}
      style={{ transform: `translateX(${currentX}px)` }}
      className="
        fixed bottom-[24px] right-[33px] z-30
        w-[58px] h-[58px] rounded-full
        bg-[#004ea7] text-white
        flex items-center justify-center
        shadow-[0px_18px_40px_0px_rgba(0,78,167,0.26),0px_6px_14px_0px_rgba(24,32,42,0.12)]
        hover:bg-[#003d86] active:scale-95
        transition-[background-color,box-shadow,transform] duration-300 ease-out
        touch-none select-none
      "
    >
      <Plus size={24} strokeWidth={2.5} />
    </button>
  )
}
