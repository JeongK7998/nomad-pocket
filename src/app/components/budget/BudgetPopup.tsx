'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Budget, Category, Subcategory, Region, Tag } from '@/types/database'
import { isSystemGoal } from '@/lib/api/budgets'

interface MasterData {
  expenseCategories: Category[]
  subcategories: Subcategory[]
  regions: Region[]
  tags: Tag[]
}

interface Props {
  isOpen: boolean
  budget?: Budget | null      // null → 추가 모드 / Budget → 수정 모드
  onClose: () => void
  onSave: (data: Omit<Budget, 'id' | 'created_at'>) => Promise<void>
  master: MasterData
  currentYear: number
  currentMonth: number
}

type PeriodType = 'monthly' | 'yearly' | 'custom'
type FilterType = 'total' | 'category' | 'subcategory' | 'region' | 'tag'

const FONT = "font-['Pretendard_Variable',sans-serif]"

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className={`${FONT} block text-[12px] font-semibold text-[#18202a] mb-[6px]`}>
      {children}
    </label>
  )
}

function SegBtn({ active, onClick, children, disabled }: {
  active: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 py-[8px] text-[12px] font-semibold rounded-full transition-all
        ${active   ? 'bg-[#004ea7] text-white shadow-sm' : 'text-[#6c7b8e] hover:text-[#18202a]'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  )
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-[8px] bg-[#f0f5ff] border border-[#d8e9fd] rounded-[12px] px-[14px] py-[10px]">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mt-[1px] flex-shrink-0">
        <circle cx="7" cy="7" r="6.5" stroke="#5898ff" strokeWidth="1"/>
        <path d="M7 6V10M7 4.5V5" stroke="#5898ff" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
      <p className={`${FONT} text-[11px] text-[#004ea7] leading-relaxed`}>{children}</p>
    </div>
  )
}

export default function BudgetPopup({
  isOpen, budget, onClose, onSave, master, currentYear, currentMonth,
}: Props) {
  const isEdit     = Boolean(budget)
  const isSystem   = budget ? isSystemGoal(budget) : false  // 시스템 목표 수정 시 금액만 변경 가능

  // ── 폼 상태 ──────────────────────────────────────────────────
  const [name,          setName]          = useState('')
  const [period,        setPeriod]        = useState<PeriodType>('monthly')
  const [amount,        setAmount]        = useState('')
  const [filter,        setFilter]        = useState<FilterType>('total')
  const [filterId,      setFilterId]      = useState('')
  const [selectedCatId, setSelectedCatId] = useState('')
  const [startDate,     setStartDate]     = useState('')
  const [endDate,       setEndDate]       = useState('')
  const [saving,        setSaving]        = useState(false)
  const [error,         setError]         = useState('')

  // ── 열릴 때마다 초기화 ────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return
    setError('')
    if (budget) {
      setName(budget.name)
      setPeriod(budget.period_type as PeriodType)
      setAmount(budget.target_amount > 0 ? budget.target_amount.toLocaleString('ko-KR') : '')
      setFilter(budget.filter_type as FilterType)
      setFilterId(budget.filter_id ?? '')
      setStartDate(budget.start_date ?? '')
      setEndDate(budget.end_date ?? '')
      // 소분류 선택 시 상위 카테고리 복원
      if (budget.filter_type === 'subcategory' && budget.filter_id) {
        const sub = master.subcategories.find(s => s.id === budget.filter_id)
        setSelectedCatId(sub?.category_id ?? '')
      } else {
        setSelectedCatId('')
      }
    } else {
      setName('')
      setPeriod('monthly')
      setAmount('')
      setFilter('total')
      setFilterId('')
      setSelectedCatId('')
      setStartDate('')
      setEndDate('')
    }
  }, [isOpen, budget, master.subcategories])

  // ── 필터링된 소분류 ──────────────────────────────────────────
  const filteredSubs = master.subcategories.filter(s => s.category_id === selectedCatId)

  // ── 금액 입력 (콤마 포맷) ─────────────────────────────────────
  const handleAmountInput = useCallback((v: string) => {
    const clean = v.replace(/[^0-9]/g, '')
    setAmount(clean ? Number(clean).toLocaleString('ko-KR') : '')
  }, [])

  // ── 저장 ─────────────────────────────────────────────────────
  const handleSave = async () => {
    const raw = parseInt(amount.replace(/,/g, ''), 10)
    if (!isSystem && !name.trim())            { setError('목표 이름을 입력해주세요'); return }
    if (!raw || raw <= 0)                     { setError('목표 금액을 입력해주세요'); return }
    if (period === 'custom' && (!startDate || !endDate)) { setError('기간을 설정해주세요'); return }
    if (filter !== 'total' && !filterId)      { setError('필터 항목을 선택해주세요'); return }

    setSaving(true)
    setError('')
    try {
      await onSave({
        name:          isSystem ? (budget?.name ?? '') : name.trim(),
        period_type:   period,
        target_amount: raw,
        year:          period !== 'custom' ? currentYear : null,
        month:         period === 'monthly' ? currentMonth : null,
        start_date:    period === 'custom' ? startDate : null,
        end_date:      period === 'custom' ? endDate   : null,
        filter_type:   filter,
        filter_id:     filter !== 'total' ? filterId : null,
        is_system:     isSystem,
        is_active:     true,
      })
      onClose()
    } catch {
      setError('저장에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setSaving(false)
    }
  }

  // ESC 키로 닫기
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto mx-4">

        {/* ── Header ── */}
        <div className="sticky top-0 bg-white rounded-t-[24px] px-[32px] pt-[28px] pb-[20px] border-b border-[#e6e8f1] z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`${FONT} font-bold text-[18px] text-[#18202a]`}>
                목표 {isEdit ? '수정' : '추가'}
              </h2>
              {isSystem && (
                <p className={`${FONT} text-[11px] text-[#6c7b8e] mt-[2px]`}>
                  기본 제공 목표 — 금액만 수정 가능합니다
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-[32px] h-[32px] rounded-full bg-[#e6e8f1] flex items-center justify-center hover:bg-[#d8e9fd] transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 1L11 11M11 1L1 11" stroke="#18202a" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-[32px] py-[24px] flex flex-col gap-[20px]">

          {/* 시스템 목표 안내 */}
          {isSystem && (
            <InfoBox>
              월간·년간 기본 목표는 금액만 수정할 수 있습니다. 이달 금액을 변경하면 다음 달에도 자동 승계됩니다.
            </InfoBox>
          )}

          {/* 목표 이름 */}
          {!isSystem && (
            <div>
              <Label>목표 이름</Label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="예: 식비 절약, 여행 예산..."
                className={`${FONT} w-full border border-[#e6e8f1] rounded-[12px] px-[14px] py-[10px] text-[14px] text-[#18202a] outline-none focus:border-[#5898ff] transition-colors`}
              />
            </div>
          )}

          {/* 기간 */}
          <div>
            <Label>기간</Label>
            <div className="flex bg-[#e6e8f1] rounded-full p-[4px] gap-[2px]">
              <SegBtn active={period === 'monthly'} onClick={() => setPeriod('monthly')} disabled={isSystem}>월간</SegBtn>
              <SegBtn active={period === 'yearly'}  onClick={() => setPeriod('yearly')}  disabled={isSystem}>년간</SegBtn>
              <SegBtn active={period === 'custom'}  onClick={() => setPeriod('custom')}  disabled={isSystem}>커스텀</SegBtn>
            </div>

            {period === 'custom' && !isSystem && (
              <div className="flex items-center gap-[10px] mt-[10px]">
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className={`${FONT} flex-1 border border-[#e6e8f1] rounded-[12px] px-[14px] py-[8px] text-[13px] outline-none focus:border-[#5898ff]`}
                />
                <span className="text-[#6c7b8e] text-[12px]">~</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className={`${FONT} flex-1 border border-[#e6e8f1] rounded-[12px] px-[14px] py-[8px] text-[13px] outline-none focus:border-[#5898ff]`}
                />
              </div>
            )}

            {(period === 'monthly' || period === 'yearly') && (
              <p className={`${FONT} text-[11px] text-[#6c7b8e] mt-[6px] ml-[4px]`}>
                {period === 'monthly'
                  ? `${currentYear}년 ${currentMonth}월 기준 · 매월 자동 승계`
                  : `${currentYear}년 기준 · 매년 자동 승계`}
              </p>
            )}
          </div>

          {/* 목표 금액 */}
          <div>
            <Label>목표 금액</Label>
            <div className="relative">
              <span className={`${FONT} absolute left-[14px] top-1/2 -translate-y-1/2 text-[14px] text-[#6c7b8e]`}>₩</span>
              <input
                type="text"
                value={amount}
                onChange={e => handleAmountInput(e.target.value)}
                placeholder="3,000,000"
                className={`${FONT} w-full border border-[#e6e8f1] rounded-[12px] pl-[28px] pr-[14px] py-[10px] text-[14px] text-[#18202a] outline-none focus:border-[#5898ff] transition-colors`}
              />
            </div>
          </div>

          {/* 집계 기준 (시스템 목표는 '전체'로 고정) */}
          {!isSystem && (
            <div>
              <Label>집계 기준</Label>
              <div className="grid grid-cols-5 gap-[6px]">
                {(['total','category','subcategory','region','tag'] as FilterType[]).map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => { setFilter(f); setFilterId(''); setSelectedCatId('') }}
                    className={`py-[6px] rounded-[8px] text-[11px] font-semibold transition-all ${
                      filter === f
                        ? 'bg-[#004ea7] text-white'
                        : 'bg-[#e6e8f1] text-[#6c7b8e] hover:bg-[#d8e9fd]'
                    }`}
                  >
                    {f === 'total'       ? '전체'
                     : f === 'category'    ? '대분류'
                     : f === 'subcategory' ? '소분류'
                     : f === 'region'      ? '지역'
                     :                      '태그'}
                  </button>
                ))}
              </div>

              {/* 대분류 */}
              {filter === 'category' && (
                <select
                  value={filterId}
                  onChange={e => setFilterId(e.target.value)}
                  className={`${FONT} w-full border border-[#e6e8f1] rounded-[12px] px-[14px] py-[10px] text-[13px] text-[#18202a] outline-none focus:border-[#5898ff] mt-[8px] bg-white`}
                >
                  <option value="">대분류 선택</option>
                  {master.expenseCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}

              {/* 소분류 (2단 셀렉트) */}
              {filter === 'subcategory' && (
                <div className="flex flex-col gap-[6px] mt-[8px]">
                  <select
                    value={selectedCatId}
                    onChange={e => { setSelectedCatId(e.target.value); setFilterId('') }}
                    className={`${FONT} w-full border border-[#e6e8f1] rounded-[12px] px-[14px] py-[10px] text-[13px] text-[#18202a] outline-none focus:border-[#5898ff] bg-white`}
                  >
                    <option value="">대분류 선택</option>
                    {master.expenseCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {selectedCatId && (
                    <select
                      value={filterId}
                      onChange={e => setFilterId(e.target.value)}
                      className={`${FONT} w-full border border-[#e6e8f1] rounded-[12px] px-[14px] py-[10px] text-[13px] text-[#18202a] outline-none focus:border-[#5898ff] bg-white`}
                    >
                      <option value="">소분류 선택</option>
                      {filteredSubs.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* 지역 */}
              {filter === 'region' && (
                <select
                  value={filterId}
                  onChange={e => setFilterId(e.target.value)}
                  className={`${FONT} w-full border border-[#e6e8f1] rounded-[12px] px-[14px] py-[10px] text-[13px] text-[#18202a] outline-none focus:border-[#5898ff] mt-[8px] bg-white`}
                >
                  <option value="">지역 선택</option>
                  {master.regions.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              )}

              {/* 태그 */}
              {filter === 'tag' && (
                <select
                  value={filterId}
                  onChange={e => setFilterId(e.target.value)}
                  className={`${FONT} w-full border border-[#e6e8f1] rounded-[12px] px-[14px] py-[10px] text-[13px] text-[#18202a] outline-none focus:border-[#5898ff] mt-[8px] bg-white`}
                >
                  <option value="">태그 선택</option>
                  {master.tags.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              )}

              {filter !== 'total' && (
                <p className={`${FONT} text-[11px] text-[#6c7b8e] mt-[6px] ml-[4px]`}>
                  선택한 {
                    filter === 'category'    ? '대분류'
                    : filter === 'subcategory' ? '소분류'
                    : filter === 'region'      ? '지역'
                    :                           '태그'
                  }에 해당하는 지출 합계로 달성 여부를 판단합니다.
                </p>
              )}
            </div>
          )}

          {/* 에러 */}
          {error && (
            <div className="flex items-center gap-[8px] bg-[#fff0f0] border border-[#ffd0d0] rounded-[12px] px-[14px] py-[10px]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6.5" stroke="#d40000" strokeWidth="1"/>
                <path d="M7 4V8M7 10V10.5" stroke="#d40000" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <p className={`${FONT} text-[12px] text-[#d40000]`}>{error}</p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="sticky bottom-0 bg-white rounded-b-[24px] px-[32px] pb-[28px] pt-[16px] border-t border-[#e6e8f1] flex gap-[12px]">
          <button
            onClick={onClose}
            className={`${FONT} flex-1 py-[12px] rounded-[12px] bg-[#e6e8f1] text-[#18202a] font-semibold text-[14px] hover:bg-[#d8e9fd] transition-colors`}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`${FONT} flex-1 py-[12px] rounded-[12px] bg-[#004ea7] text-white font-semibold text-[14px] hover:bg-[#0053b1] transition-colors disabled:opacity-60`}
          >
            {saving ? '저장 중...' : isEdit ? '수정하기' : '저장하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
