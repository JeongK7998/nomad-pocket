'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { Camera, Check, Image as ImageIcon, Loader2, MessageSquareText, Upload, X } from 'lucide-react'
import {
  createTransaction,
  getCategories,
  getCurrencies,
  getPaymentMethods,
  getRegions,
  getSubcategories,
  getTags,
} from '@/lib/api'
import { formatLocalDate } from '@/lib/date'
import { formatPaymentMethodLabel } from '@/lib/paymentMethod'
import { formatSubcategoryLabel } from '@/lib/subcategoryEmoji'
import type { Category, Currency, PaymentMethod, Region, Subcategory, Tag, TransactionImportSource, TransactionType } from '@/types/database'

const FONT = "font-['Pretendard_Variable',sans-serif]"
const INPUT_CLS = `h-[38px] min-w-0 rounded-[10px] border border-[#e4e5e9] bg-white px-[10px] ${FONT} text-[12px] text-[#18202a] outline-none transition-colors focus:border-[#5898ff]`

interface Props {
  onClose: () => void
  onSaved?: () => void | Promise<void>
  initialSource?: TransactionImportSource
  mode?: 'text' | 'image'
}

interface ParsedCandidate {
  type: TransactionType
  date: string | null
  description: string
  memo: string | null
  amount: number
  currency: string
  categoryName: string | null
  subcategoryName: string | null
  paymentMethodName: string | null
  regionName: string | null
  tagNames: string[]
  confidence: number
}

interface ReviewCandidate extends ParsedCandidate {
  id: string
  date: string
  categoryId: string
  subcategoryId: string
  paymentMethodId: string
  regionId: string
  tagIds: string[]
  selected: boolean
}

function normalize(value: string | null | undefined) {
  return (value ?? '').replace(/[^\p{L}\p{N}]/gu, '').toLowerCase()
}

function bestMatch<T extends { name: string }>(items: T[], value: string | null | undefined) {
  const target = normalize(value)
  if (!target) return undefined
  return items.find((item) => normalize(item.name) === target)
    ?? items.find((item) => {
      const name = normalize(item.name)
      return name.length >= 3 && target.length >= 3 && (name.includes(target) || target.includes(name))
    })
}

function scoreKeywordMatch(name: string, keywords: string[]) {
  const target = normalize(name)
  return keywords.reduce((score, keyword) => target.includes(normalize(keyword)) ? score + 1 : score, 0)
}

function inferCategoryByText(
  typedCategories: Category[],
  subcategories: Subcategory[],
  candidate: ParsedCandidate
) {
  const haystack = `${candidate.description} ${candidate.memo ?? ''} ${candidate.categoryName ?? ''} ${candidate.subcategoryName ?? ''}`
  const rules = [
    { keywords: ['커피', '카페', '라떼', '아메리카노', '스타벅스', '투썸', '메가커피', '컴포즈', '빽다방', '크래킹커피', '음료'], category: ['식비', '카페', '외식'], subcategory: ['카페', '커피', '간식', '음료'] },
    { keywords: ['식당', '음식', '밥', '점심', '저녁', '아침', '배달', '한식', '분식', '일식', '중식'], category: ['식비', '외식'], subcategory: ['식비', '외식', '식사', '배달'] },
    { keywords: ['택시', '버스', '지하철', '기차', '철도', '항공', '비행기', '교통'], category: ['교통', '이동', '여행'], subcategory: ['교통', '택시', '지하철', '버스', '항공'] },
    { keywords: ['호텔', '숙소', '에어비앤비', 'airbnb', 'booking', 'agoda'], category: ['여행', '숙박'], subcategory: ['숙박', '호텔'] },
    { keywords: ['월세', '전세', '집세', '관리비', '렌트', '임대'], category: ['주거', '주거비'], subcategory: ['관리비', '월세', '렌트'] },
  ]

  const matchedRule = rules.find((rule) => scoreKeywordMatch(haystack, rule.keywords) > 0)
  if (!matchedRule) return {}

  const category = typedCategories.find((cat) => matchedRule.category.some((keyword) => normalize(cat.name).includes(normalize(keyword))))
  const categorySubs = category ? subcategories.filter((sub) => sub.category_id === category.id) : []
  const subcategory = categorySubs.find((sub) => matchedRule.subcategory.some((keyword) => normalize(sub.name).includes(normalize(keyword))))
  return { category, subcategory }
}

function sourceLabel(source: TransactionImportSource) {
  if (source === 'sms') return '문자'
  if (source === 'image') return '사진'
  if (source === 'text') return '텍스트'
  return '자동'
}

function sourceMode(source: TransactionImportSource) {
  if (source === 'image') return 'image'
  if (source === 'sms') return 'sms'
  return 'text'
}

export function AutoTransactionImportPopup({ onClose, onSaved, initialSource = 'sms', mode = 'text' }: Props) {
  const isImageMode = mode === 'image'
  const [source, setSource] = useState<TransactionImportSource>(isImageMode ? 'image' : initialSource)
  const [inputText, setInputText] = useState('')
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [candidates, setCandidates] = useState<ReviewCandidate[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loadingMaster, setLoadingMaster] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cameraInputRef = useRef<HTMLInputElement | null>(null)
  const galleryInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    Promise.all([
      getCategories(),
      getSubcategories(),
      getPaymentMethods(),
      getRegions(),
      getTags(),
      getCurrencies(true),
    ]).then(([cats, subs, payments, rgns, tgs, curs]) => {
      setCategories(cats)
      setSubcategories(subs)
      setPaymentMethods(payments)
      setRegions(rgns)
      setTags(tgs)
      setCurrencies(curs)
    }).catch((e) => {
      console.error(e)
      setError('마스터 데이터를 불러오지 못했습니다.')
    }).finally(() => setLoadingMaster(false))
  }, [])

  const categoriesByType = useMemo(() => ({
    expense: categories.filter((cat) => cat.type === 'expense'),
    income: categories.filter((cat) => cat.type === 'income'),
  }), [categories])

  const resolveCandidate = useCallback((candidate: ParsedCandidate, index: number): ReviewCandidate => {
    const typedCategories = categories.filter((cat) => cat.type === candidate.type)
    const inferred = inferCategoryByText(typedCategories, subcategories, candidate)
    const category = bestMatch(typedCategories, candidate.categoryName) ?? inferred.category
    const categorySubs = category ? subcategories.filter((sub) => sub.category_id === category.id) : []
    const subcategory = bestMatch(categorySubs, candidate.subcategoryName) ?? inferred.subcategory
    const payment = candidate.type === 'expense' ? bestMatch(paymentMethods, candidate.paymentMethodName) : undefined
    const region = bestMatch(regions, candidate.regionName)
    const tagIds = tags.filter((tag) => candidate.tagNames.some((name) => normalize(name) === normalize(tag.name))).map((tag) => tag.id)
    const currency = currencies.some((item) => item.code === candidate.currency) ? candidate.currency : 'KRW'

    return {
      ...candidate,
      id: `${Date.now()}-${index}`,
      date: candidate.date ?? formatLocalDate(),
      amount: Number.isFinite(Number(candidate.amount)) ? Number(candidate.amount) : 0,
      currency,
      categoryId: category?.id ?? '',
      subcategoryId: subcategory?.id ?? '',
      paymentMethodId: payment?.id ?? '',
      regionId: region?.id ?? '',
      tagIds,
      selected: true,
    }
  }, [categories, currencies, paymentMethods, regions, subcategories, tags])

  const handleImageSelected = async (file: File | undefined) => {
    if (!file) return
    setError(null)
    setCandidates([])
    const reader = new FileReader()
    reader.onload = () => setImageDataUrl(typeof reader.result === 'string' ? reader.result : null)
    reader.onerror = () => setError('이미지를 읽지 못했습니다.')
    reader.readAsDataURL(file)
  }

  const handleAnalyze = async () => {
    setError(null)
    if (source === 'image' && !imageDataUrl) {
      setError('분석할 사진을 먼저 선택해 주세요.')
      return
    }
    if (source !== 'image' && !inputText.trim()) {
      setError('분석할 문자/내역을 붙여넣어 주세요.')
      return
    }

    setAnalyzing(true)
    try {
      const res = await fetch('/api/transaction-import/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: sourceMode(source),
          text: inputText,
          imageDataUrl,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? '자동 입력 분석에 실패했습니다.')
      const rows = (data.transactions ?? []) as ParsedCandidate[]
      if (rows.length === 0) {
        setCandidates([])
        setError('거래 후보를 찾지 못했습니다. 텍스트나 사진을 다시 확인해 주세요.')
        return
      }
      setCandidates(rows.map(resolveCandidate))
    } catch (e) {
      setError(e instanceof Error ? e.message : '자동 입력 분석에 실패했습니다.')
    } finally {
      setAnalyzing(false)
    }
  }

  const updateCandidate = (id: string, patch: Partial<ReviewCandidate>) => {
    setCandidates((prev) => prev.map((candidate) => {
      if (candidate.id !== id) return candidate
      const next = { ...candidate, ...patch }
      if (patch.type && patch.type !== candidate.type) {
        const category = categoriesByType[patch.type][0]
        const sub = category ? subcategories.find((item) => item.category_id === category.id) : undefined
        next.categoryId = category?.id ?? ''
        next.subcategoryId = sub?.id ?? ''
        next.paymentMethodId = patch.type === 'income' ? '' : next.paymentMethodId
      }
      if (patch.categoryId && patch.categoryId !== candidate.categoryId) {
        const sub = subcategories.find((item) => item.category_id === patch.categoryId)
        next.subcategoryId = sub?.id ?? ''
      }
      return next
    }))
  }

  const selectedCandidates = candidates.filter((candidate) => candidate.selected)
  const canSave = selectedCandidates.length > 0 && selectedCandidates.every((candidate) =>
    candidate.date && candidate.description.trim() && candidate.amount > 0 && candidate.categoryId && candidate.subcategoryId
  )

  const handleSave = async () => {
    if (!canSave) {
      setError('선택한 후보의 날짜, 분류, 내역, 금액을 확인해 주세요.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      await Promise.all(selectedCandidates.map((candidate) => createTransaction({
        type: candidate.type,
        date: candidate.date,
        category_id: candidate.categoryId,
        subcategory_id: candidate.subcategoryId,
        description: candidate.description.trim(),
        memo: candidate.memo?.trim() || null,
        amount: candidate.amount,
        currency: candidate.currency,
        original_amount: null,
        exchange_rate: null,
        payment_method_id: candidate.type === 'expense' ? candidate.paymentMethodId || null : null,
        region_id: candidate.regionId || null,
        tag_ids: candidate.tagIds,
        is_fixed: false,
        fixed_item_id: null,
        import_source: source,
        import_status: 'pending_review',
        import_confidence: candidate.confidence,
        import_raw_text: source === 'image' ? candidate.memo ?? 'image import' : inputText,
      })))
      await onSaved?.()
      onClose()
    } catch (e) {
      console.error(e)
      setError('자동 입력 후보 저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="flex max-h-[90dvh] w-[860px] max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-[20px] bg-white shadow-[0px_24px_64px_0px_rgba(25,28,30,0.18)]">
        <div className="flex flex-shrink-0 items-center justify-between border-b border-[#f0f2f7] px-[24px] py-[18px]">
          <div>
            <h2 className={`${FONT} text-[18px] font-bold text-[#18202a]`}>{isImageMode ? '사진 OCR' : '자동 입력'}</h2>
            <p className={`${FONT} mt-[2px] text-[11px] text-[#6c7b8e]`}>
              {isImageMode ? '카메라 또는 갤러리 사진에서 거래 후보를 만듭니다' : '문자 또는 여러 줄 내역을 붙여넣어 거래 후보를 만듭니다'}
            </p>
          </div>
          <button onClick={onClose} className="flex h-[32px] w-[32px] items-center justify-center rounded-full text-[#6c7b8e] transition-colors hover:bg-[#f4f4f7]">
            <X size={16} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-[14px] overflow-y-auto px-[24px] py-[18px]">
          {!isImageMode && (
          <div className="grid grid-cols-2 gap-[8px]">
            {([
              { value: 'sms', label: '문자 붙여넣기', icon: MessageSquareText },
              { value: 'text', label: '내역 붙여넣기', icon: Upload },
            ] as const).map((item) => {
              const Icon = item.icon
              const active = source === item.value
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => { setSource(item.value); setError(null); setCandidates([]) }}
                  className={`flex h-[54px] items-center justify-center gap-[8px] rounded-[14px] border transition-all ${
                    active ? 'border-[#004ea7] bg-[#f2f7ff] text-[#004ea7]' : 'border-[#e4e5e9] bg-white text-[#6c7b8e] hover:border-[#b8d5ff]'
                  }`}
                >
                  <Icon size={16} />
                  <span className={`${FONT} text-[13px] font-semibold`}>{item.label}</span>
                </button>
              )
            })}
          </div>
          )}

          {isImageMode ? (
            <div className="rounded-[16px] border border-[#eef1f6] bg-[#fbfcff] p-[12px]">
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handleImageSelected(e.target.files?.[0])}
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageSelected(e.target.files?.[0])}
              />
              <div className="grid grid-cols-2 gap-[8px]">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className={`flex h-[58px] items-center justify-center gap-[8px] rounded-[12px] border border-[#b8d5ff] bg-white text-[#004ea7] transition-colors hover:bg-[#f6faff] ${FONT}`}
                >
                  <Camera size={18} />
                  <span className="text-[12px] font-semibold">카메라 촬영</span>
                </button>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className={`flex h-[58px] items-center justify-center gap-[8px] rounded-[12px] border border-[#b8d5ff] bg-white text-[#004ea7] transition-colors hover:bg-[#f6faff] ${FONT}`}
                >
                  <ImageIcon size={18} />
                  <span className="text-[12px] font-semibold">사진 불러오기</span>
                </button>
              </div>
              {imageDataUrl && (
                <div className="relative mt-[10px] h-[112px] w-full overflow-hidden rounded-[12px] border border-[#eef1f6] bg-white md:h-[140px]">
                  <Image src={imageDataUrl} alt="자동 입력 이미지 미리보기" fill unoptimized className="object-contain" />
                </div>
              )}
            </div>
          ) : (
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={source === 'sms' ? '[현대카드] 04/27 14:21 스타벅스 6,800원 승인' : '여러 줄 거래 내역을 붙여넣어 주세요'}
              className={`min-h-[132px] w-full resize-none rounded-[16px] border border-[#e4e5e9] bg-white px-[14px] py-[12px] ${FONT} text-[13px] text-[#18202a] outline-none transition-colors placeholder:text-[#c0c8d4] focus:border-[#5898ff]`}
            />
          )}

          <div className="flex items-center gap-[10px]">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={analyzing || loadingMaster}
              className={`flex h-[42px] items-center justify-center gap-[6px] rounded-[12px] bg-[#004ea7] px-[18px] ${FONT} text-[13px] font-semibold text-white transition-colors hover:bg-[#003d86] disabled:opacity-50`}
            >
              {analyzing ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {analyzing ? '분석 중...' : '거래 후보 만들기'}
            </button>
            <span className={`${FONT} text-[11px] text-[#6c7b8e]`}>저장 후 거래 목록에 {sourceLabel(source)} 자동 배지가 표시됩니다</span>
            {isImageMode && imageDataUrl && (
              <span className={`${FONT} hidden text-[11px] text-[#6c7b8e] md:inline`}>미리보기는 작게 표시됩니다</span>
            )}
          </div>

          {error && <p className={`${FONT} text-[12px] text-[#d40000]`}>{error}</p>}

          {candidates.length > 0 && (
            <div className="overflow-hidden rounded-[16px] border border-[#eef1f6]">
              <div className="flex items-center justify-between bg-[#18202a] px-[14px] py-[10px]">
                <span className={`${FONT} text-[12px] font-bold uppercase tracking-[0.8px] text-[#e6e8f1]`}>자동 입력 후보 {candidates.length}건</span>
                <span className={`${FONT} text-[11px] text-[#b8d5ff]`}>선택한 항목만 저장</span>
              </div>
              <div className="max-h-[360px] overflow-y-auto">
                {candidates.map((candidate) => {
                  const subs = subcategories.filter((sub) => sub.category_id === candidate.categoryId)
                  return (
                    <div key={candidate.id} className="border-b border-[#eef1f6] px-[12px] py-[10px] last:border-b-0">
                      <div className="grid grid-cols-[24px_minmax(0,1fr)_112px] gap-[8px] md:hidden">
                        <input
                          type="checkbox"
                          checked={candidate.selected}
                          onChange={(e) => updateCandidate(candidate.id, { selected: e.target.checked })}
                          className="mt-[10px] h-[16px] w-[16px]"
                        />
                        <input className={INPUT_CLS} type="date" value={candidate.date} onChange={(e) => updateCandidate(candidate.id, { date: e.target.value })} />
                        <input className={`${INPUT_CLS} text-right`} type="number" value={candidate.amount} onChange={(e) => updateCandidate(candidate.id, { amount: Number(e.target.value) })} />

                        <select className={`${INPUT_CLS} col-start-2`} value={candidate.type} onChange={(e) => updateCandidate(candidate.id, { type: e.target.value as TransactionType })}>
                          <option value="expense">지출</option>
                          <option value="income">수입</option>
                        </select>
                        <input className={INPUT_CLS} value={candidate.description} onChange={(e) => updateCandidate(candidate.id, { description: e.target.value })} placeholder="내역" />

                        <select className="col-span-2 col-start-2 h-[38px] min-w-0 rounded-[10px] border border-[#e4e5e9] bg-white px-[10px] font-['Pretendard_Variable',sans-serif] text-[12px] text-[#18202a] outline-none focus:border-[#5898ff]" value={candidate.categoryId} onChange={(e) => updateCandidate(candidate.id, { categoryId: e.target.value })}>
                          <option value="">대분류 선택</option>
                          {categoriesByType[candidate.type].map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                        <select className="col-span-2 col-start-2 h-[38px] min-w-0 rounded-[10px] border border-[#e4e5e9] bg-white px-[10px] font-['Pretendard_Variable',sans-serif] text-[12px] text-[#18202a] outline-none focus:border-[#5898ff]" value={candidate.subcategoryId} onChange={(e) => updateCandidate(candidate.id, { subcategoryId: e.target.value })} disabled={!candidate.categoryId}>
                          <option value="">소분류 선택</option>
                          {subs.map((sub) => <option key={sub.id} value={sub.id}>{formatSubcategoryLabel(sub)}</option>)}
                        </select>
                        <select className={`${INPUT_CLS} col-start-2`} value={candidate.paymentMethodId} onChange={(e) => updateCandidate(candidate.id, { paymentMethodId: e.target.value })} disabled={candidate.type === 'income'}>
                          <option value="">지출방식</option>
                          {paymentMethods.map((payment) => <option key={payment.id} value={payment.id}>{formatPaymentMethodLabel(payment)}</option>)}
                        </select>
                        <select className={INPUT_CLS} value={candidate.regionId} onChange={(e) => updateCandidate(candidate.id, { regionId: e.target.value })}>
                          <option value="">지역</option>
                          {regions.map((region) => <option key={region.id} value={region.id}>{region.name}</option>)}
                        </select>
                      </div>

                      <div className="hidden gap-[8px] md:grid md:grid-cols-[24px_86px_94px_minmax(120px,1fr)_110px_118px_118px]">
                        <input
                          type="checkbox"
                          checked={candidate.selected}
                          onChange={(e) => updateCandidate(candidate.id, { selected: e.target.checked })}
                          className="mt-[10px] h-[16px] w-[16px]"
                        />
                        <input className={INPUT_CLS} type="date" value={candidate.date} onChange={(e) => updateCandidate(candidate.id, { date: e.target.value })} />
                        <select className={INPUT_CLS} value={candidate.type} onChange={(e) => updateCandidate(candidate.id, { type: e.target.value as TransactionType })}>
                          <option value="expense">지출</option>
                          <option value="income">수입</option>
                        </select>
                        <input className={INPUT_CLS} value={candidate.description} onChange={(e) => updateCandidate(candidate.id, { description: e.target.value })} placeholder="내역" />
                        <input className={`${INPUT_CLS} text-right`} type="number" value={candidate.amount} onChange={(e) => updateCandidate(candidate.id, { amount: Number(e.target.value) })} />
                        <select className={INPUT_CLS} value={candidate.categoryId} onChange={(e) => updateCandidate(candidate.id, { categoryId: e.target.value })}>
                          <option value="">대분류 선택</option>
                          {categoriesByType[candidate.type].map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                        <select className={INPUT_CLS} value={candidate.subcategoryId} onChange={(e) => updateCandidate(candidate.id, { subcategoryId: e.target.value })} disabled={!candidate.categoryId}>
                          <option value="">소분류 선택</option>
                          {subs.map((sub) => <option key={sub.id} value={sub.id}>{formatSubcategoryLabel(sub)}</option>)}
                        </select>
                        <div className="col-span-7 col-start-1 grid grid-cols-[24px_118px_118px_minmax(0,1fr)] gap-[8px]">
                          <div />
                          <select className={INPUT_CLS} value={candidate.paymentMethodId} onChange={(e) => updateCandidate(candidate.id, { paymentMethodId: e.target.value })} disabled={candidate.type === 'income'}>
                            <option value="">지출방식</option>
                            {paymentMethods.map((payment) => <option key={payment.id} value={payment.id}>{formatPaymentMethodLabel(payment)}</option>)}
                          </select>
                          <select className={INPUT_CLS} value={candidate.regionId} onChange={(e) => updateCandidate(candidate.id, { regionId: e.target.value })}>
                            <option value="">지역</option>
                            {regions.map((region) => <option key={region.id} value={region.id}>{region.name}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-shrink-0 gap-[10px] border-t border-[#f0f2f7] px-[24px] py-[16px]">
          <button onClick={onClose} disabled={saving} className={`flex-1 rounded-[12px] border border-[#e4e5e9] py-[12px] ${FONT} text-[14px] font-semibold text-[#6c7b8e] transition-colors hover:bg-[#f4f4f7] disabled:opacity-50`}>
            취소
          </button>
          <button onClick={handleSave} disabled={!canSave || saving} className={`flex flex-1 items-center justify-center gap-[6px] rounded-[12px] bg-[#004ea7] py-[12px] ${FONT} text-[14px] font-semibold text-white transition-colors hover:bg-[#003d86] disabled:opacity-50`}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {saving ? '저장 중...' : `${selectedCandidates.length || 0}건 저장`}
          </button>
        </div>
      </div>
    </div>
  )
}
