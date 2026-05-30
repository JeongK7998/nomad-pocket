'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { X, Plus, Loader2, Lock } from 'lucide-react'
import {
  getCategories, getSubcategories,
  getPaymentMethods, getRegions, getTags, getCurrencies,
  createTransaction, createFixedItem, deactivateFixedItem, updateTransaction, deleteTransaction,
} from '@/lib/api'
import { formatLocalDate } from '@/lib/date'
import { formatPaymentMethodLabel } from '@/lib/paymentMethod'
import { formatSubcategoryLabel } from '@/lib/subcategoryEmoji'
import type { Category, Subcategory, PaymentMethod, Region, Tag, Currency, FixedItem, Transaction } from '@/types/database'

const FONT = "font-['Pretendard_Variable',sans-serif]"
const INPUT_CLS = `w-full h-[42px] border border-[#e4e5e9] rounded-[10px] px-[14px] ${FONT} text-[13px] text-[#18202a] outline-none focus:border-[#5898ff] transition-colors bg-white`
const LOCKED_CLS = `w-full h-[42px] border border-[#e4e5e9] rounded-[10px] px-[14px] ${FONT} text-[13px] text-[#6c7b8e] bg-[#f4f4f7] cursor-not-allowed flex items-center gap-[6px]`

// ── 공통 UI ──────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return <label className={`${FONT} text-[11px] font-semibold text-[#6c7b8e] uppercase tracking-[0.8px] block mb-[6px]`}>{children}</label>
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex min-w-0 flex-row gap-[10px] sm:gap-[12px]">{children}</div>
}

function Field({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex min-w-0 flex-col ${className}`}>{children}</div>
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
    <div className="flex min-w-0 gap-[6px] overflow-x-auto pb-[2px]">
      {tags.map((tag) => {
        const on = selected.includes(tag.id)
        return (
          <button key={tag.id} type="button" onClick={() => toggle(tag.id)}
            className={`${FONT} flex-shrink-0 text-[11px] font-medium px-[10px] py-[5px] rounded-full border transition-all ${
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
function FixedCheckRow({ type, checked, onChange }: { type: 'expense' | 'income'; checked: boolean; onChange: (v: boolean) => void }) {
  const label = type === 'expense' ? '고정지출로 등록' : '고정수입으로 등록'

  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex h-[38px] w-full items-center gap-[8px] rounded-[10px] border px-[12px] text-left transition-all ${
        checked
          ? 'border-[#004ea7] bg-[#f2f7ff]'
          : 'border-[#e4e5e9] bg-white hover:border-[#b8d5ff] hover:bg-[#fbfdff]'
      }`}
      aria-pressed={checked}
    >
      <div className={`w-[18px] h-[18px] rounded-[5px] border-2 flex flex-shrink-0 items-center justify-center transition-all ${checked ? 'bg-[#004ea7] border-[#004ea7]' : 'border-[#d8dae6] bg-white'}`}>
        {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </div>
      <span className={`${FONT} text-[13px] font-semibold text-[#18202a]`}>{label}</span>
      <span className={`${FONT} ml-auto hidden text-[11px] text-[#6c7b8e] sm:inline`}>매달 반복</span>
    </button>
  )
}

// ── 메인 팝업 ────────────────────────────────────────────────
interface Props {
  onClose: () => void
  onSaved?: () => void | Promise<void>
  defaultType?: 'expense' | 'income'
  fixedItem?: FixedItem     // 고정항목 클릭 시 전달 — 해당 필드 잠금 + 저장 시 연결
  defaultDate?: string      // 고정항목 팝업에서 기본 날짜 (뷰 기준 년월 + day_of_month)
  existingTransaction?: Transaction | null
}

export function TransactionInputPopup({ onClose, onSaved, defaultType = 'expense', fixedItem, defaultDate, existingTransaction }: Props) {
  const isFromFixed = !!fixedItem
  const isEditing = !!existingTransaction
  const isImportReview = existingTransaction?.import_status === 'pending_review'
  const initialForm = useMemo(() => ({
    txType: existingTransaction?.type ?? fixedItem?.type ?? defaultType,
    date: existingTransaction?.date ?? defaultDate ?? formatLocalDate(),
    catId: existingTransaction?.category_id ?? fixedItem?.category_id ?? '',
    subId: existingTransaction?.subcategory_id ?? fixedItem?.subcategory_id ?? '',
    desc: existingTransaction?.description ?? fixedItem?.description ?? '',
    amount: existingTransaction
      ? String(existingTransaction.original_amount ?? existingTransaction.amount)
      : fixedItem
        ? String(fixedItem.amount)
        : '',
    currency: existingTransaction?.currency ?? fixedItem?.currency ?? 'KRW',
    paymentId: existingTransaction?.payment_method_id ?? fixedItem?.payment_method_id ?? '',
    regionId: existingTransaction?.region_id ?? '',
    tagIds: existingTransaction?.tag_ids ?? [],
    isFixed: existingTransaction?.is_fixed ?? false,
    memo: existingTransaction?.memo ?? '',
  }), [defaultDate, defaultType, existingTransaction, fixedItem])

  // ── 폼 상태 (fixedItem이 있으면 초기값 주입) ───────────────
  const [txType,     setTxType]     = useState<'expense' | 'income'>(initialForm.txType)
  const [date,       setDate]       = useState(initialForm.date)
  const [catId,      setCatId]      = useState(initialForm.catId)
  const [subId,      setSubId]      = useState(initialForm.subId)
  const [desc,       setDesc]       = useState(initialForm.desc)
  const [amount,     setAmount]     = useState(
    initialForm.amount
  )
  const [currency,   setCurrency]   = useState(initialForm.currency)
  const [paymentId,  setPaymentId]  = useState(initialForm.paymentId)
  const [regionId,   setRegionId]   = useState(initialForm.regionId)
  const [tagIds,     setTagIds]     = useState<string[]>(initialForm.tagIds)
  const [isFixed,    setIsFixed]    = useState(initialForm.isFixed)
  const [memo,       setMemo]       = useState(initialForm.memo)

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
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set())

  const hasUnsavedChanges = useMemo(() => {
    const normalizeTags = (ids: string[]) => [...ids].sort().join(',')
    return txType !== initialForm.txType ||
      date !== initialForm.date ||
      catId !== initialForm.catId ||
      subId !== initialForm.subId ||
      desc !== initialForm.desc ||
      amount !== initialForm.amount ||
      currency !== initialForm.currency ||
      paymentId !== initialForm.paymentId ||
      regionId !== initialForm.regionId ||
      normalizeTags(tagIds) !== normalizeTags(initialForm.tagIds) ||
      isFixed !== initialForm.isFixed ||
      memo !== initialForm.memo
  }, [amount, catId, currency, date, desc, initialForm, isFixed, memo, paymentId, regionId, subId, tagIds, txType])

  const requestClose = useCallback(() => {
    if (saving) return
    if (hasUnsavedChanges && !window.confirm('작성 중인 내용이 사라집니다. 닫으시겠습니까?')) return
    onClose()
  }, [hasUnsavedChanges, onClose, saving])

  // ── 파생 데이터 ────────────────────────────────────────────
  const filteredSubs = allSubs.filter((s) => s.category_id === catId)
  const catName = categories.find(c => c.id === catId)?.name ?? ''
  const selectedSubcategory = allSubs.find(s => s.id === subId)
  const subName = formatSubcategoryLabel(selectedSubcategory)

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
    setTxType(type); setCatId(''); setSubId(''); setTagIds([]); setPaymentId('')
  }

  const handleCatChange = (id: string) => { setCatId(id); setSubId('') }
  const invalidStyle = (name: string) => invalidFields.has(name)
    ? { borderColor: '#d40000', backgroundColor: '#fff8f7', boxShadow: '0 0 0 1px #d40000' }
    : undefined
  const clearInvalid = (name: string) => {
    setInvalidFields((prev) => {
      if (!prev.has(name)) return prev
      const next = new Set(prev)
      next.delete(name)
      return next
    })
  }

  // ── 환율 조회 ──────────────────────────────────────────────
  useEffect(() => {
    if (currency === 'KRW') { setExchangeRate(null); setKrwAmount(null); return }
    const numericAmount = Number(amount)
    if (!amount || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setExchangeRate(null)
      setKrwAmount(null)
      return
    }

    const fetchRate = async () => {
      setLoadingRate(true)
      try {
        const res  = await fetch(`https://open.er-api.com/v6/latest/${currency}`)
        const data = await res.json()
        const rate = data?.rates?.KRW as number | undefined
        if (rate && Number.isFinite(rate)) {
          setExchangeRate(rate)
          setKrwAmount(Math.round(numericAmount * rate))
        } else {
          setExchangeRate(null)
          setKrwAmount(null)
        }
      } catch {
        setExchangeRate(null)
        setKrwAmount(null)
      } finally {
        setLoadingRate(false)
      }
    }
    fetchRate()
  }, [currency, amount])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') requestClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [requestClose])

  // ── 저장 ───────────────────────────────────────────────────
  const handleSave = async () => {
    const missing = new Set<string>()
    if (!date) missing.add('date')
    if (!catId) missing.add('catId')
    if (!subId) missing.add('subId')
    if (!desc.trim()) missing.add('desc')
    if (!amount || Number(amount) <= 0) missing.add('amount')

    if (missing.size > 0) {
      setInvalidFields(missing)
      setError('빨간색으로 표시된 필수 항목을 입력해 주세요.')
      return
    }

    if (currency !== 'KRW') {
      if (loadingRate) {
        setInvalidFields(new Set(['amount']))
        setError('환율 조회가 끝난 뒤 저장해 주세요.')
        return
      }
      if (!exchangeRate || krwAmount === null) {
        setInvalidFields(new Set(['amount']))
        setError('환율을 확인할 수 없어 저장할 수 없습니다. 잠시 후 다시 시도해 주세요.')
        return
      }
    }

    setSaving(true)
    setError(null)
    setInvalidFields(new Set())

    let createdFixedItemId: string | null = null

    try {
      const rawAmount = Number(amount)
      const finalKrw  = currency === 'KRW' ? rawAmount : (krwAmount ?? rawAmount)
      let linkedFixedItemId: string | null = existingTransaction?.fixed_item_id ?? (isFromFixed ? fixedItem!.id : null)

      // 일반 입력에서 고정항목 체크 시, 먼저 fixed_items를 만들고
      // 같은 저장 건의 transaction에 fixed_item_id를 연결해 dim placeholder와 스위치되게 한다.
      if (!isFromFixed && isFixed && !linkedFixedItemId) {
        const createdFixedItem = await createFixedItem({
          type:               txType,
          category_id:        catId,
          subcategory_id:     subId,
          description:        desc,
          amount:             finalKrw,
          currency:           'KRW',
          payment_method_id:  paymentId || null,
          day_of_month:       new Date(date).getDate(),
          is_active:          true,
        })
        createdFixedItemId = createdFixedItem.id
        linkedFixedItemId = createdFixedItem.id
      }

      const payload = {
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
        fixed_item_id:      isFixed || isFromFixed ? linkedFixedItemId : null,
        ...(isImportReview ? { import_status: 'reviewed' as const } : {}),
      }

      if (isEditing && existingTransaction) {
        await updateTransaction(existingTransaction.id, payload)
      } else {
        await createTransaction(payload)
      }

      await onSaved?.()
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

  const handleDelete = async () => {
    if (!existingTransaction) return
    if (!confirm('이 거래를 삭제하시겠습니까?')) return

    setSaving(true)
    setError(null)

    try {
      await deleteTransaction(existingTransaction.id)
      await onSaved?.()
      onClose()
    } catch (e) {
      setError('삭제 중 오류가 발생했습니다. 다시 시도해 주세요.')
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) requestClose() }}
    >
      <div className="bg-white rounded-[20px] shadow-[0px_24px_64px_0px_rgba(25,28,30,0.18)] w-[520px] max-w-[calc(100vw-24px)] max-h-[90dvh] overflow-x-hidden overflow-y-auto flex flex-col">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-[24px] pt-[18px] pb-[14px] border-b border-[#f0f2f7] flex-shrink-0 sm:px-[28px]">
          <div>
            <h2 className={`${FONT} font-bold text-[18px] text-[#18202a]`}>
              {isFromFixed ? '고정항목 입력' : isEditing ? '거래 수정' : '거래 입력'}
            </h2>
            {isFromFixed && (
              <p className={`${FONT} text-[11px] text-[#6c7b8e] mt-[2px]`}>대분류 · 소분류 · 내역은 고정 설정값입니다</p>
            )}
            {!isFromFixed && isEditing && (
              <p className={`${FONT} text-[11px] text-[#6c7b8e] mt-[2px]`}>
                {isImportReview ? '자동 입력된 거래입니다. 확인 후 저장하면 자동 배지가 사라집니다' : '기존 거래 내용을 수정합니다'}
              </p>
            )}
          </div>
          <button onClick={requestClose} className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-[#6c7b8e] hover:bg-[#f4f4f7] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* 폼 */}
        <div className="px-[18px] py-[14px] flex flex-col gap-[10px] sm:px-[28px] sm:py-[18px] sm:gap-[12px]">

          {/* 구분 + 날짜 */}
          <Row>
            <Field className="flex-1 min-w-0">
              <Label>구분</Label>
              <TypeToggle value={txType} onChange={handleTypeChange} locked={isFromFixed} />
            </Field>
            <Field className="flex-1 min-w-0">
              <Label>날짜</Label>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value)
                  clearInvalid('date')
                  e.currentTarget.blur()
                }}
                className={`${INPUT_CLS} min-w-0 pr-[10px] text-[12px] placeholder-[#c0c8d4]`}
                style={invalidStyle('date')}
                aria-invalid={invalidFields.has('date')}
              />
            </Field>
          </Row>

          {/* 대분류 + 소분류 */}
          <Row>
            <Field className="flex-1">
              <Label>대분류</Label>
              {isFromFixed ? (
                <LockedField value={loadingData ? '로딩중...' : catName} />
              ) : (
                <select value={catId} onChange={(e) => { handleCatChange(e.target.value); clearInvalid('catId') }} className={INPUT_CLS} style={invalidStyle('catId')} disabled={loadingData} aria-invalid={invalidFields.has('catId')}>
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
                <select value={subId} onChange={(e) => { setSubId(e.target.value); clearInvalid('subId') }} className={INPUT_CLS} style={invalidStyle('subId')} disabled={!catId} aria-invalid={invalidFields.has('subId')}>
                  <option value="">선택</option>
                  {filteredSubs.map((s) => <option key={s.id} value={s.id}>{formatSubcategoryLabel(s)}</option>)}
                </select>
              )}
            </Field>
          </Row>

          {/* 내역 + 메모 */}
          <Row>
            <Field className="flex-1">
              <Label>내역</Label>
              {isFromFixed ? (
                <LockedField value={desc} />
              ) : (
                <input value={desc} onChange={(e) => { setDesc(e.target.value); clearInvalid('desc') }} placeholder="거래 내용을 입력하세요"
                  className={`${INPUT_CLS} placeholder-[#c0c8d4]`} style={invalidStyle('desc')} aria-invalid={invalidFields.has('desc')} />
              )}
            </Field>
            <Field className="flex-1">
              <Label>메모 (선택)</Label>
              <input value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="추가 메모"
                className={`${INPUT_CLS} placeholder-[#c0c8d4]`} />
            </Field>
          </Row>

          {/* 금액 + 통화 */}
          <Field>
            <Label>금액</Label>
            <div className="flex min-w-0 gap-[8px]">
              <input type="number" value={amount} onChange={(e) => { setAmount(e.target.value); clearInvalid('amount') }} placeholder="0"
                className={`min-w-0 flex-1 h-[42px] border border-[#e4e5e9] rounded-[10px] px-[14px] ${FONT} text-[13px] text-[#18202a] outline-none focus:border-[#5898ff] transition-colors bg-white placeholder-[#c0c8d4]`} style={invalidStyle('amount')} aria-invalid={invalidFields.has('amount')} />
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

          {/* 지출 전용 */}
          {txType === 'expense' && (
            <>
              <Row>
                <Field className="flex-1">
                  <Label>지출방식</Label>
                  <select value={paymentId} onChange={(e) => setPaymentId(e.target.value)} className={INPUT_CLS}>
                    <option value="">선택</option>
                    {payments.map((p) => <option key={p.id} value={p.id}>{formatPaymentMethodLabel(p)}</option>)}
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

            </>
          )}

          {/* 고정항목 여부 */}
          {!isFromFixed && (
            <FixedCheckRow type={txType} checked={isFixed} onChange={setIsFixed} />
          )}

          {/* 오류 메시지 */}
          {error && <p className={`${FONT} text-[12px] text-[#d40000]`}>{error}</p>}

        </div>

        {/* 버튼 */}
        <div className="flex gap-[10px] px-[24px] pb-[20px] pt-[2px] flex-shrink-0 sm:px-[28px]">
          {isEditing && (
            <button onClick={handleDelete} disabled={saving}
              className={`py-[12px] px-[16px] rounded-[12px] border border-[#ffd5d1] bg-[#fff5f4] ${FONT} font-semibold text-[14px] text-[#d40000] hover:bg-[#ffe9e6] transition-colors disabled:opacity-50`}>
              삭제
            </button>
          )}
          <button onClick={requestClose} disabled={saving}
            className={`flex-1 py-[12px] rounded-[12px] border border-[#e4e5e9] ${FONT} font-semibold text-[14px] text-[#6c7b8e] hover:bg-[#f4f4f7] transition-colors disabled:opacity-50`}>
            취소
          </button>
          <button onClick={handleSave} disabled={saving}
            className={`flex-1 py-[12px] rounded-[12px] bg-[#004ea7] ${FONT} font-semibold text-[14px] text-white hover:bg-[#003d86] transition-colors flex items-center justify-center gap-[6px] disabled:opacity-50`}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            {saving ? (isEditing ? '수정 중...' : '저장 중...') : (isEditing ? '수정하기' : '저장하기')}
          </button>
        </div>

      </div>
    </div>
  )
}
