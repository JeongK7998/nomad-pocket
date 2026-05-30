'use client'

import { useState } from 'react'
import { Camera, Keyboard, MessageSquareText, X } from 'lucide-react'
import { AutoTransactionImportPopup } from '@/app/components/layout/AutoTransactionImportPopup'
import { FAB } from '@/app/components/layout/FAB'
import { TransactionInputPopup } from '@/app/components/layout/TransactionInputPopup'

interface GlobalTransactionFabProps {
  onSaved?: () => void | Promise<void>
}

const FONT = "font-['Pretendard_Variable',sans-serif]"

export function GlobalTransactionFab({ onSaved }: GlobalTransactionFabProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [manualOpen, setManualOpen] = useState(false)
  const [autoOpen, setAutoOpen] = useState(false)
  const [autoMode, setAutoMode] = useState<'text' | 'image'>('text')

  const handleSaved = async () => {
    if (onSaved) {
      await onSaved()
      return
    }

    window.location.reload()
  }

  return (
    <>
      <FAB onClick={() => setMenuOpen(true)} />

      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={(e) => { if (e.target === e.currentTarget) setMenuOpen(false) }}
        >
          <div className="fixed bottom-[94px] right-[33px] w-[250px] overflow-hidden rounded-[18px] border border-[#eef1f6] bg-white shadow-[0px_18px_48px_0px_rgba(24,32,42,0.18)]">
            <div className="flex items-center justify-between border-b border-[#f0f2f7] px-[14px] py-[10px]">
              <span className={`${FONT} text-[12px] font-bold text-[#18202a]`}>거래 추가</span>
              <button onClick={() => setMenuOpen(false)} className="flex h-[24px] w-[24px] items-center justify-center rounded-full text-[#6c7b8e] hover:bg-[#f4f4f7]">
                <X size={13} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => { setMenuOpen(false); setManualOpen(true) }}
              className="flex h-[54px] w-full items-center gap-[10px] px-[16px] text-left transition-colors hover:bg-[#f8fbff]"
            >
              <Keyboard size={16} className="text-[#004ea7]" />
              <div>
                <p className={`${FONT} text-[13px] font-semibold text-[#18202a]`}>직접 입력</p>
                <p className={`${FONT} text-[10px] text-[#6c7b8e]`}>기존 거래 입력 팝업</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => { setAutoMode('text'); setMenuOpen(false); setAutoOpen(true) }}
              className="flex h-[54px] w-full items-center gap-[10px] border-t border-[#f0f2f7] px-[16px] text-left transition-colors hover:bg-[#f8fbff]"
            >
              <MessageSquareText size={16} className="text-[#004ea7]" />
              <div>
                <p className={`${FONT} text-[13px] font-semibold text-[#18202a]`}>문자/내역 자동 입력</p>
                <p className={`${FONT} text-[10px] text-[#6c7b8e]`}>붙여넣기 후 검토 저장</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => { setAutoMode('image'); setMenuOpen(false); setAutoOpen(true) }}
              className="flex h-[54px] w-full items-center gap-[10px] border-t border-[#f0f2f7] px-[16px] text-left transition-colors hover:bg-[#f8fbff]"
            >
              <Camera size={16} className="text-[#004ea7]" />
              <div>
                <p className={`${FONT} text-[13px] font-semibold text-[#18202a]`}>사진 OCR 자동 입력</p>
                <p className={`${FONT} text-[10px] text-[#6c7b8e]`}>영수증/카드앱 캡처 분석</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {manualOpen && (
        <TransactionInputPopup
          onClose={() => setManualOpen(false)}
          onSaved={handleSaved}
        />
      )}
      {autoOpen && (
        <AutoTransactionImportPopup
          mode={autoMode}
          initialSource={autoMode === 'image' ? 'image' : 'sms'}
          onClose={() => setAutoOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </>
  )
}
