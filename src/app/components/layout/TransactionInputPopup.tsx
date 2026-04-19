'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Plus, Loader2, Lock } from 'lucide-react'
import {
  getCategories, getSubcategories,
  getPaymentMethods, getRegions, getTags, getCurrencies,
  createTransaction, createFixedItem, deactivateFixedItem,
} from '@/lib/api'
import { formatLocalDate } from '@/lib/date'
import type { Category, Subcategory, PaymentMethod, Region, Tag, Currency, FixedItem } from '@/types/database'

const FONT = "font-['Pretendard_Variable',sans-serif]"
const INPUT_CLS = `w-full h-[42px] border border-[#e4e5e9] rounded-[10px] px-[14px] ${FONT} text-[13px] text-[#18202a] outline-none focus:border-[#5898ff] transition-colors bg-white`
const LOCKED_CLS = `w-full h-[42px] border border-[#e4e5e9] rounded-[10px] px-[14px] ${FONT} text-[13px] text-[#6c7b8e] bg-[#f4f4f7] cursor-not-allowed flex items-center gap-[6px]`

// ── 공통 UI ──────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return <label className={`${FONT} text-[11px] font-semibold text-[#6c7b8e] uppercase tracking-[0.8px] block mb-[6px]`}>{children}</label>
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-[12px]">{children}</div>
}

function Field({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex flex-col ${className}`}>{children}</div>
}

// ── 잠금 필드 (읽기 전용 표시) ──────────────────────────────
function LockedField({ value }: { value: string }) {
  return (
    <div className={LOCKED_CLS}>
      <Lock size={10} className="text-[#c0c8d4] flex-shrink-0" />
      <span className="truncate">{value || '-'}</span>
    </div>
  )
}

// ── 구분 토글 ─────────────────────────────────────────────────
function TypeToggle({ value, onChange, locked }: { value: 'expense' | 'income'; onChange: (v: 'expense' | 'income') => void; locked?: boolean }) {
  const labels: Record<string, string> = { expense: '지출', income: '수입' }
  return (
    <div className="relative flex items-center p-[4px] rounded-[9999px] self-start">
      <div aria-hidden className="absolute bg-[#e6e8f1] inset-0 rounded-[9999px] shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]" />
      {(['expense', 'income'] as const).map((t) => (
        <button key={t} type="button" onClick={() => !locked && onChange(t)} disabled={locked}
          className={`relative w-[80px] py-[7px] rounded-[9999px] transition-all ${value === t ? 'bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]' : ''} ${locked ? 'cursor-not-allowed' : ''}`}>
          <span className={`${FONT} text-[13px]`} style={{ fontWeight: value === t ? 700 : 500, color: value === t ? '#004EA7' : '#6C7B8E' }}>
            {labels[t]}
          </span>
        </button>
      ))}
    </div>
  )
}

// ── 태그 멀티칩 ──────────────────────────────────────────────
function TagChips({ tags, selected, onChange }: { tags: Tag[]; selected: string[]; onChange: (ids: string[]) => void }) {
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter((t) => t !== id) : [...selected, id])
  return (
    <div className="flex flex-wrap gap-[6px]">
      {tags.map((tag) => {
        const on = selected.includes(tag.id)
        return (
          <button key={tag.id} type="button" onClick={() => toggle(tag.id)}
            className={`${FONT} text-[11px] font-medium px-[10px] py-[5px] rounded-full border transition-all ${
              on ? 'bg-[#004ea7] border-[#004ea7] text-white' : 'bg-white border-[#e4e5e9] text-[#6c7b8e] hover:border-[#5898ff] hover:text-[#5898ff]'
            }`}>
            # {tag.name}
          </button>
        )
      })}
    </div>
  )
}

// ── 체크박스 행 ──────────────────────────────────────────────
function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-[8px] self-start">
      <div className={`w-[18px] h-[18px] rounded-[4px] border-2 flex items-center justify-center transition-all ${checked ? 'bg-[#004ea7] border-[#004ea7]' : 'border-[#d8dae6]'}`}>
        {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </div>
      <span className={`${FONT} text-[13px] text-[#18202a]`}>{label}</span>
    </button>
  )
}

// ── 메인 팝업 ────────────────────────────────────────────────
interface Props {
  onClose: () => void
  onSaved?: () => void
  defaultType?: 'expense' | 'income'
  fixedItem?: FixedItem     // 고정항목 클릭 시 전달 — 해당 필드 잠금 + 저장 시 연결
  defaultDate?: string      // 고정항목 팝업에서 기본 날짜 (뷰 기준 년월 + day_of_month)
}

export function TransactionInputPopup({ onClose, onSaved, defaultType = 'expense', fixedItem, defaultDate }: Props) {
  const isFromFixed = !!fixedItem

  // ── 폼 상태 (fixedItem이 있으면 초기값 주입) ───────────────
  const [txType,     setTxType]     = useState<'expense' | 'income'>(fixedItem?.type ?? defaultType)
  const [date,       setDate]       = useState(defaultDate ?? formatLocalDate())
  const [catId,      setCatId]      = useState(fixedItem?.category_id    ?? '')
  const [subId,      setSubId]      = useState(fixedItem?.subcategory_id ?? '')
  const [desc,       setDesc]       = useState(fixedItem?.description    ?? '')
  const [amount,     setAmount]     = useState(fixedItem ? String(fixedItem.amount) : '')
  const [currency,   setCurrency]   = useState(fixedItem?.currency ?? 'KRW')
  const [paymentId,  setPaymentId]  = useState(fixedItem?.payment_method_id ?? '')
  const [regionId,   setRegionId]   = useState('')
  const [tagIds,     setTagIds]     = useState<string[]>([])
  const [isFixed,    setIsFixed]    = useState(false)
  const [memo,       setMemo]       = useState('')

  // ── 마스터 데이터 ──────────────────────────────────────────
  const [categories,  setCategories]  = useState<Category[]>([])
  const [allSubs,     setAllSubs]     = useState<Subcategory[]>([])
  const [payments,    setPayments]    = useState<PaymentMethod[]>([])
  const [regions,     setRegions]     = useState<Region[]>([])
  const [tags,        setTags]        = useState<Tag[]>([])
  const [currencies,  setCurrencies]  = useState<Currency[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // ── 환율 ───────────────────────────────────────────────────
  const [exchangeRate,   setExchangeRate]   = useState<number | null>(null)
  const [loadingRate,    setLoadingRate]    = useState(false)
  const [krwAmount,      setKrwAmount]      = useState<number | null>(null)

  // ── 저장 상태 ──────────────────────────────────────────────
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  // ── 파생 데이터 ────────────────────────────────────────────
  const filteredSubs = allSubs.filter((s) => s.category_id === catId)
  const catName = categories.find(c => c.id === catId)?.name ?? ''
  const subName = allSubs.find(s => s.id === subId)?.name ?? ''

  // ── 마스터 데이터 로드 ─────────────────────────────────────
  const loadMasterData = useCallback(async (type: 'expense' | 'income') => {
    setLoadingData(true)
    const [cats, subs, pm, rgns, tgs, curs] = await Promise.all([
      getCategories(type),
      getSubcategories(),
      getPaymentMethods(),
      getRegions(),
      getTags(),
      getCurrencies(true),
    ])
    setCategories(cats)
    setAllSubs(subs)
    setPayments(pm)
    setRegions(rgns)
    setTags(tgs)
    setCurrencies(curs)
    setLoadingData(false)
  }, [])

  useEffect(() => { loadMasterData(txType) }, [txType, loadMasterData])

  const handleTypeChange = (type: 'expense' | 'income') => {
    setTxType(type); setCatId(''); setSubId(''); setTagIds([])
  }

  const handleCatChange = (id: string) => { setCatId(id); setSubId('') }

  // ── 환율 조회 ──────────────────────────────────────────────
  useEffect(() => {
    if (currency === 'KRW') { setExchangeRate(null); setKrwAmount(null); return }
    if (!amount) { setKrwAmount(null); return }

    const fetchRate = async () => {
      setLoadingRate(true)
      try {
        const res  = await fetch(`https://open.er-api.com/v6/latest/${currency}`)
        const data = await res.json()
        const rate = data?.rates?.KRW as number | undefined
        if (rate) {
          setExchangeRate(rate)
          setKrwAmount(Math.round(Number(amount) * rate))
        }
      } catch {
        setExchangeRate(null)
      } finally {
        setLoadingRate(false)
      }
    }
    fetchRate()
  }, [currency, amount])

  // ── 저장 ───────────────────────────────────────────────────
  const handleSave = async () => {
    if (!catId || !subId || !desc || !amount) {
      setError('대분류, 소분류, 내역, 금액은 필수입니다.')
      return
    }
    setSaving(true)
    setError(null)

    let createdFixedItemId: string | null = null

    try {
      const rawAmount = Number(amount)
      const finalKrw  = currency === 'KRW' ? rawAmount : (krwAmount ?? rawAmount)
      let linkedFixedItemId: string | null = isFromFixed ? fixedItem!.id : null

      // 일반 입력에서 고정항목 체크 시, 먼저 fixed_items를 만들고
      // 같은 저장 건의 transaction에 fixed_item_id를 연결해 dim placeholder와 스위치되게 한다.
      if (!isFromFixed && isFixed) {
        const createdFixedItem = await createFixedItem({
          type:               txType,
          category_id:        catId,
          subcategory_id:     subId,
          description:        desc,
          amount:             finalKrw,
          currency,
          payment_method_id:  paymentId || null,
          day_of_month:       new Date(date).getDate(),
          is_active:          true,
        })
        createdFixedItemId = createdFixedItem.id
        linkedFixedItemId = createdFixedItem.id
      }

      await createTransaction({
        type:               txType,
        date,
        category_id:        catId,
        subcategory_id:     subId,
        description:        desc,
        memo:               memo || null,
        amount:             finalKrw,
        currency,
        original_amount:    currency !== 'KRW' ? rawAmount   : null,
        exchange_rate:      currency !== 'KRW' ? exchangeRate : null,
        payment_method_id:  paymentId  || null,
        region_id:          regionId   || null,
        tag_ids:            tagIds,
        is_fixed:           isFromFixed ? true : isFixed,
        fixed_item_id:      linkedFixedItemId,
      })

      onSaved?.()
      onClose()
    } catch (e) {
      if (createdFixedItemId) {
        try {
          await deactivateFixedItem(createdFixedItemId)
        } catch (rollbackError) {
          console.error('Fixed item rollback failed:', rollbackError)
        }
      }
      setError('저장 중 오류가 발생했습니다. 다시 시도해 주세요.')
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-[20px] shadow-[0px_24px_64px_0px_rgba(25,28,30,0.18)] w-[520px] max-h-[90dvh] overflow-y-auto flex flex-col">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-[28px] pt-[24px] pb-[20px] border-b border-[#f0f2f7] flex-shrink-0">
          <div>
            <h2 className={`${FONT} font-bold text-[18px] text-[#18202a]`}>
              {isFromFixed ? '고정항목 입력' : '거래 입력'}
            </h2>
            {isFromFixed && (
              <p className={`${FONT} text-[11px] text-[#6c7b8e] mt-[2px]`}>대분류 · 소분류 · 내역은 고정 설정값입니다</p>
            )}
          </div>
          <button onClick={onClose} className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-[#6c7b8e] hover:bg-[#f4f4f7] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* 폼 */}
        <div className="px-[28px] py-[24px] flex flex-col gap-[18px]">

          {/* 구분 + 날짜 */}
          <Row>
            <Field className="flex-1">
              <Label>구분</Label>
              <TypeToggle value={txType} onChange={handleTypeChange} locked={isFromFixed} />
            </Field>
            <Field className="flex-1">
              <Label>날짜</Label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${INPUT_CLS} placeholder-[#c0c8d4]`} />
            </Field>
          </Row>

          {/* 대분류 + 소분류 */}
          <Row>
            <Field className="flex-1">
              <Label>대분류</Label>
              {isFromFixed ? (
                <LockedField value={loadingData ? '로딩중...' : catName} />
              ) : (
                <select value={catId} onChange={(e) => handleCatChange(e.target.value)} className={INPUT_CLS} disabled={loadingData}>
                  <option value="">{loadingData ? '로딩중...' : '선택'}</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
            </Field>
            <Field className="flex-1">
              <Label>소분류</Label>
              {isFromFixed ? (
                <LockedField value={loadingData ? '로딩중...' : subName} />
              ) : (
                <select value={subId} onChange={(e) => setSubId(e.target.value)} className={INPUT_CLS} disabled={!catId}>
                  <option value="">선택</option>
                  {filteredSubs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              )}
            </Field>
          </Row>

          {/* 내역 */}
          <Field>
            <Label>내역</Label>
            {isFromFixed ? (
              <LockedField value={desc} />
            ) : (
              <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="거래 내용을 입력하세요"
                className={`${INPUT_CLS} placeholder-[#c0c8d4]`} />
            )}
          </Field>

          {/* 금액 + 통화 */}
          <Field>
            <Label>금액</Label>
            <div className="flex gap-[8px]">
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0"
                className={`flex-1 h-[42px] border border-[#e4e5e9] rounded-[10px] px-[14px] ${FONT} text-[13px] text-[#18202a] outline-none focus:border-[#5898ff] transition-colors bg-white placeholder-[#c0c8d4]`} />
              <select value={currency} onChange={(e) => { setCurrency(e.target.value); setExchangeRate(null); setKrwAmount(null) }}
                className={`w-[90px] h-[42px] border border-[#e4e5e9] rounded-[10px] px-[10px] ${FONT} text-[13px] text-[#18202a] outline-none focus:border-[#5898ff] bg-white`}>
                {currencies.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
              </select>
            </div>
            {currency !== 'KRW' && (
              <div className={`${FONT} text-[11px] mt-[6px]`}>
                {loadingRate ? (
                  <span className="text-[#6c7b8e] flex items-center gap-[4px]"><Loader2 size={10} className="animate-spin" /> 환율 조회 중...</span>
                ) : krwAmount ? (
                  <span className="text-[#5898ff]">
                    ≈ ₩{krwAmount.toLocaleString('ko-KR')}
                    {exchangeRate && <span className="text-[#6c7b8e] ml-[6px]">(1{currency} = ₩{exchangeRate.toLocaleString('ko-KR', { maximumFractionDigits: 2 })})</span>}
                  </span>
                ) : (
                  <span className="text-[#6c7b8e]">금액 입력 시 원화로 자동 환산됩니다</span>
                )}
              </div>
            )}
          </Field>

          {/* 메모 */}
          <Field>
            <Label>메모 (선택)</Label>
            <input value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="추가 메모"
              className={`${INPUT_CLS} placeholder-[#c0c8d4]`} />
          </Field>

          {/* 지출 전용 */}
          {txType === 'expense' && (
            <>
              <Row>
                <Field className="flex-1">
                  <Label>지출방식</Label>
                  <select value={paymentId} onChange={(e) => setPaymentId(e.target.value)} className={INPUT_CLS}>
                    <option value="">선택</option>
                    {payments.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </Field>
                <Field className="flex-1">
                  <Label>지역</Label>
                  <select value={regionId} onChange={(e) => setRegionId(e.target.value)} className={INPUT_CLS}>
                    <option value="">선택</option>
                    {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </Field>
              </Row>

              <Field>
                <Label>태그</Label>
                <TagChips tags={tags} selected={tagIds} onChange={setTagIds} />
              </Field>

              {!isFromFixed && (
                <CheckRow label="고정지출로 등록 (매달 반복)" checked={isFixed} onChange={setIsFixed} />
              )}
            </>
          )}

          {/* 수입 전용 */}
          {txType === 'income' && !isFromFixed && (
            <CheckRow label="고정수입으로 등록 (매달 반복)" checked={isFixed} onChange={setIsFixed} />
          )}

          {/* 오류 메시지 */}
          {error && <p className={`${FONT} text-[12px] text-[#d40000]`}>{error}</p>}

        </div>

        {/* 버튼 */}
        <div className="flex gap-[10px] px-[28px] pb-[28px] pt-[4px] flex-shrink-0">
          <button onClick={onClose} disabled={saving}
            className={`flex-1 py-[12px] rounded-[12px] border border-[#e4e5e9] ${FONT} font-semibold text-[14px] text-[#6c7b8e] hover:bg-[#f4f4f7] transition-colors disabled:opacity-50`}>
            취소
          </button>
          <button onClick={handleSave} disabled={saving}
            className={`flex-1 py-[12px] rounded-[12px] bg-[#004ea7] ${FONT} font-semibold text-[14px] text-white hover:bg-[#003d86] transition-colors flex items-center justify-center gap-[6px] disabled:opacity-50`}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            {saving ? '저장 중...' : '저장하기'}
          </button>
        </div>

      </div>
    </div>
  )
}
