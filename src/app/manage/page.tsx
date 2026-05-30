'use client'

import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import { Plus, Pencil, Trash2, Check, X, Loader2, RotateCcw, ChevronRight } from 'lucide-react'
import { GlobalTransactionFab } from '@/app/components/layout/GlobalTransactionFab'
import {
  getCategories, createCategory, updateCategory, deleteCategory,
  getSubcategories, createSubcategory, updateSubcategory, deleteSubcategory, countCategoryUsages, countSubcategoryUsages, replaceSubcategoryReferencesAndDelete,
  getPaymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod,
  getRegions, createRegion, deleteRegion, restoreRegion,
  getTags, createTag, deleteTag, restoreTag,
  getCurrencies, toggleCurrency, createCurrency, deleteCurrency,
  getFixedItems, createFixedItem, updateFixedItem, deactivateFixedItem,
  getTransactions,
} from '@/lib/api'
import { SUBCATEGORY_EMOJI_GROUPS, formatSubcategoryLabel, recommendSubcategoryEmoji } from '@/lib/subcategoryEmoji'
import { CATEGORY_PASTEL_COLORS, DEFAULT_CATEGORY_COLOR, getCategoryColor, getSubcategoryThumbnail } from '@/lib/categoryVisuals'
import { formatPaymentMethodLabel } from '@/lib/paymentMethod'
import type { Category, Subcategory, PaymentMethod, Region, Tag, Currency, FixedItem } from '@/types/database'

const FONT = "font-['Pretendard_Variable',sans-serif]"
const INPUT_SM = `border border-[#e4e5e9] rounded-[8px] px-[10px] h-[34px] ${FONT} text-[12px] text-[#18202a] outline-none focus:border-[#5898ff] transition-colors bg-white`

// ── 메뉴 ──────────────────────────────────────────────────────
type MenuKey = 'categories' | 'payment' | 'region' | 'currency' | 'tags' | 'fixed-expense' | 'fixed-income'
type MobileManageKey = 'taxonomy' | 'settings' | 'fixed'

const MENU_ITEMS: { key: MenuKey; label: string }[] = [
  { key: 'categories',    label: '대분류 / 소분류' },
  { key: 'payment',       label: '지출방식' },
  { key: 'region',        label: '지역' },
  { key: 'currency',      label: '통화' },
  { key: 'tags',          label: '태그' },
  { key: 'fixed-expense', label: '고정지출' },
  { key: 'fixed-income',  label: '고정수입' },
]

const MOBILE_MENU_ITEMS: { key: MobileManageKey; label: string }[] = [
  { key: 'taxonomy', label: '대분류 / 소분류' },
  { key: 'settings', label: '세부설정' },
  { key: 'fixed', label: '고정' },
]

// ── 공통 UI ───────────────────────────────────────────────────
function SectionHeader({ title, onAdd, addLabel = '추가' }: {
  title: string; onAdd?: () => void; addLabel?: string
}) {
  return (
    <div className="flex items-center justify-between mb-[20px]">
      <h2 className={`${FONT} font-bold text-[18px] text-[#18202a]`}>{title}</h2>
      {onAdd && (
        <button
          onClick={onAdd}
          className={`${FONT} text-[12px] font-semibold text-white bg-[#004ea7] rounded-[8px] px-[16px] py-[8px] hover:bg-[#003d86] transition-colors flex items-center gap-[6px]`}
        >
          <Plus size={12} /> {addLabel}
        </button>
      )}
    </div>
  )
}

function Spinner() {
  return <div className="flex items-center justify-center py-[40px]"><Loader2 size={20} className="animate-spin text-[#5898ff]" /></div>
}

function MobileGroupDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-[10px]">
      <div className="h-px flex-1 bg-[#e6e8f1]" />
      <span className={`${FONT} text-[11px] font-semibold uppercase tracking-[0.8px] text-[#6c7b8e]`}>{title}</span>
      <div className="h-px flex-1 bg-[#e6e8f1]" />
    </div>
  )
}

function fmt(n: number) { return '₩' + n.toLocaleString('ko-KR') }

function fmtShortDate(date: string | null | undefined) {
  if (!date) return '-'
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return '-'
  return `${String(d.getFullYear()).slice(2)}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

function ModalFrame({ title, description, children, onClose, widthClass = 'max-w-[640px]' }: {
  title: string
  description?: string
  children: ReactNode
  onClose: () => void
  widthClass?: string
}) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[rgba(24,32,42,0.36)] px-[12px] py-[12px] md:px-[20px]" onClick={onClose}>
      <div
        className={`w-full ${widthClass} max-h-[calc(100dvh-24px)] overflow-y-auto rounded-[24px] bg-white p-[18px] shadow-[0_32px_100px_rgba(24,32,42,0.2)] overscroll-contain md:rounded-[28px] md:p-[28px]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-[20px] flex items-start justify-between gap-[16px]">
          <div className="flex flex-col gap-[6px]">
            <h3 className={`${FONT} text-[20px] font-bold text-[#18202a]`}>{title}</h3>
            {description ? (
              <p className={`${FONT} text-[13px] leading-[1.5] text-[#6c7b8e]`}>{description}</p>
            ) : null}
          </div>
          <button onClick={onClose} className="rounded-full p-[6px] text-[#9aa5b4] transition-colors hover:bg-[#f4f6fa] hover:text-[#18202a]">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function CategoryColorSwatch({ color, selected, onClick }: { color: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-[40px] w-[40px] rounded-full border transition-all ${selected ? 'scale-105 ring-2 ring-[#004ea7] ring-offset-2' : 'border-white/70 hover:scale-[1.03]'}`}
      style={{ backgroundColor: color }}
    />
  )
}

function SubcategoryThumbnail({ category, subcategory, size = 'md' }: {
  category?: Pick<Category, 'color'> | null
  subcategory?: Pick<Subcategory, 'emoji'> | null
  size?: 'sm' | 'md'
}) {
  const thumb = getSubcategoryThumbnail(category, subcategory)
  const sizeClass = size === 'sm' ? 'h-[34px] w-[34px] text-[18px] rounded-[12px]' : 'h-[56px] w-[56px] text-[28px] rounded-[18px]'

  return (
    <div
      className={`flex items-center justify-center border border-white/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.45)] ${sizeClass}`}
      style={{ backgroundColor: thumb.backgroundColor }}
    >
      <span>{thumb.emoji}</span>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// ── 1. 대분류 / 소분류 패널 ──────────────────────────────────
// ════════════════════════════════════════════════════════════════
interface CatWithSubs extends Category { subs: Subcategory[] }

interface CategoryModalState {
  mode: 'create' | 'edit'
  type: 'expense' | 'income'
  category?: Category
}

interface SubcategoryModalState {
  mode: 'create' | 'edit'
  category: Category
  subcategory?: Subcategory
}

function CategoryModal({ state, onClose, onSubmit }: {
  state: CategoryModalState
  onClose: () => void
  onSubmit: (payload: { name: string; color: string }) => Promise<void>
}) {
  const [name, setName] = useState(state.category?.name ?? '')
  const [color, setColor] = useState(state.category?.color ?? DEFAULT_CATEGORY_COLOR)
  const title = state.mode === 'create' ? '대분류 추가' : '대분류 수정'

  useEffect(() => {
    setName(state.category?.name ?? '')
    setColor(state.category?.color ?? DEFAULT_CATEGORY_COLOR)
  }, [state])

  return (
    <ModalFrame
      title={title}
      description="대분류 이름과 파스텔 컬러를 정하면, 해당 색상이 소분류 썸네일의 컨테이너 베이스로 사용됩니다."
      onClose={onClose}
    >
      <div className="grid gap-[20px] md:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col gap-[12px]">
          <label className={`${FONT} text-[12px] font-semibold uppercase tracking-[0.6px] text-[#6c7b8e]`}>대분류 이름</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 식비, 업무, 정기수입"
            className={`${INPUT_SM} h-[44px] rounded-[14px] px-[14px] text-[14px]`}
          />
          <div className="rounded-[18px] border border-[#edf1f6] bg-[#f8fafc] p-[18px]">
            <p className={`${FONT} mb-[12px] text-[12px] font-semibold uppercase tracking-[0.6px] text-[#6c7b8e]`}>컬러 팔레트</p>
            <div className="flex flex-wrap gap-[12px]">
              {CATEGORY_PASTEL_COLORS.map((item) => (
                <CategoryColorSwatch key={item} color={item} selected={color === item} onClick={() => setColor(item)} />
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-[22px] border border-[#edf1f6] bg-[#fbfcfe] p-[20px]">
          <p className={`${FONT} mb-[14px] text-[12px] font-semibold uppercase tracking-[0.6px] text-[#6c7b8e]`}>미리보기</p>
          <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-[16px] rounded-[20px]" style={{ backgroundColor: color }}>
            <div className="flex h-[64px] w-[64px] items-center justify-center rounded-[22px] border border-white/70 bg-white/30 text-[28px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]">
              {name.trim().slice(0, 1) || 'A'}
            </div>
            <div className="text-center">
              <p className={`${FONT} text-[15px] font-semibold text-[#18202a]`}>{name.trim() || '새 대분류'}</p>
              <p className={`${FONT} mt-[4px] text-[12px] text-[#33445a]`}>{state.type === 'expense' ? '소비 분류' : '수입 분류'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-[24px] flex justify-end gap-[10px]">
        <button onClick={onClose} className={`${FONT} rounded-[12px] border border-[#d9e2ec] px-[18px] py-[10px] text-[13px] font-semibold text-[#6c7b8e] transition-colors hover:bg-[#f7f9fc]`}>
          취소
        </button>
        <button
          onClick={() => void onSubmit({ name: name.trim(), color })}
          className={`${FONT} rounded-[12px] bg-[#004ea7] px-[18px] py-[10px] text-[13px] font-semibold text-white transition-colors hover:bg-[#003d86]`}
        >
          저장하기
        </button>
      </div>
    </ModalFrame>
  )
}

function EmojiTabbedPicker({ value, onChange }: { value?: string | null; onChange: (emoji: string | null) => void }) {
  const [activeTab, setActiveTab] = useState<string>(SUBCATEGORY_EMOJI_GROUPS[0]?.label ?? '')
  const activeGroup = SUBCATEGORY_EMOJI_GROUPS.find((group) => group.label === activeTab) ?? SUBCATEGORY_EMOJI_GROUPS[0]

  useEffect(() => {
    if (!SUBCATEGORY_EMOJI_GROUPS.some((group) => group.label === activeTab)) {
      setActiveTab(SUBCATEGORY_EMOJI_GROUPS[0]?.label ?? '')
    }
  }, [activeTab])

  return (
    <div className="rounded-[18px] border border-[#edf1f6] bg-[#fbfcfe] p-[16px]">
      <div className="mb-[12px] flex items-center justify-between gap-[12px]">
        <p className={`${FONT} text-[12px] font-semibold uppercase tracking-[0.6px] text-[#6c7b8e]`}>이모지 선택</p>
        <button type="button" onClick={() => onChange(null)} className={`${FONT} text-[12px] font-semibold text-[#6c7b8e] transition-colors hover:text-[#18202a]`}>
          이모지 없음
        </button>
      </div>
      <div className="mb-[12px] flex flex-wrap gap-[8px]">
        {SUBCATEGORY_EMOJI_GROUPS.map((group) => {
          const active = group.label === activeGroup.label
          return (
            <button
              key={group.label}
              type="button"
              onClick={() => setActiveTab(group.label)}
              className={`${FONT} rounded-full px-[12px] py-[7px] text-[12px] font-semibold transition-colors ${
                active ? 'bg-[#004ea7] text-white' : 'bg-white text-[#6c7b8e] hover:bg-[#eef4ff] hover:text-[#004ea7]'
              }`}
            >
              {group.label}
            </button>
          )
        })}
      </div>
      <div className="grid max-h-[280px] grid-cols-6 gap-[8px] overflow-y-auto pr-[2px]">
        {activeGroup.emojis.map((emoji) => {
          const active = value === emoji
          return (
            <button
              key={emoji}
              type="button"
              onClick={() => onChange(emoji)}
              className={`flex h-[48px] items-center justify-center rounded-[14px] border text-[24px] transition-colors ${
                active ? 'border-[#004ea7] bg-[#eef4ff]' : 'border-[#e4e8f0] bg-white hover:border-[#5898ff] hover:bg-[#f7faff]'
              }`}
            >
              {emoji}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SubcategoryModal({ state, onClose, onSubmit }: {
  state: SubcategoryModalState
  onClose: () => void
  onSubmit: (payload: { name: string; emoji: string | null }) => Promise<void>
}) {
  const [name, setName] = useState(state.subcategory?.name ?? '')
  const [emoji, setEmoji] = useState<string | null>(state.subcategory?.emoji ?? null)
  const [emojiTouched, setEmojiTouched] = useState(!!state.subcategory?.emoji)
  const previewCategory = { color: getCategoryColor(state.category) }

  useEffect(() => {
    setName(state.subcategory?.name ?? '')
    setEmoji(state.subcategory?.emoji ?? null)
    setEmojiTouched(!!state.subcategory?.emoji)
  }, [state])

  useEffect(() => {
    const trimmedName = name.trim()
    if (!trimmedName || emojiTouched) return
    setEmoji(recommendSubcategoryEmoji(trimmedName, state.category.name))
  }, [name, state.category.name, emojiTouched])

  return (
    <ModalFrame
      title={state.mode === 'create' ? '소분류 추가' : '소분류 수정'}
      description="대분류의 파스텔 컬러 위에 소분류 이모지를 합쳐서 최종 썸네일을 만듭니다."
      onClose={onClose}
      widthClass="max-w-[840px]"
    >
      <div className="grid gap-[20px] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col gap-[16px]">
          <div className="rounded-[22px] border border-[#edf1f6] bg-[#fbfcfe] p-[20px]">
            <p className={`${FONT} mb-[12px] text-[12px] font-semibold uppercase tracking-[0.6px] text-[#6c7b8e]`}>대분류 베이스</p>
            <div className="flex items-center gap-[14px] rounded-[18px] p-[16px]" style={{ backgroundColor: getCategoryColor(state.category) }}>
              <SubcategoryThumbnail category={previewCategory} subcategory={{ emoji }} />
              <div>
                <p className={`${FONT} text-[14px] font-semibold text-[#18202a]`}>{state.category.name}</p>
                <p className={`${FONT} mt-[4px] text-[12px] text-[#33445a]`}>컨테이너 컬러가 이 대분류 색상을 따라갑니다.</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-[8px]">
            <label className={`${FONT} text-[12px] font-semibold uppercase tracking-[0.6px] text-[#6c7b8e]`}>소분류 이름</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 커피, 지하철, 호텔"
              className={`${INPUT_SM} h-[44px] rounded-[14px] px-[14px] text-[14px]`}
            />
            <p className={`${FONT} text-[12px] text-[#6c7b8e]`}>
              이름 기준으로 이모지가 자동 추천되며, 필요하면 직접 변경할 수 있습니다.
            </p>
          </div>
          <div className="rounded-[22px] border border-[#edf1f6] bg-[#f8fafc] p-[18px]">
            <p className={`${FONT} mb-[12px] text-[12px] font-semibold uppercase tracking-[0.6px] text-[#6c7b8e]`}>완성 썸네일</p>
            <div className="flex items-center gap-[14px]">
              <SubcategoryThumbnail category={previewCategory} subcategory={{ emoji }} />
              <div>
                <p className={`${FONT} text-[14px] font-semibold text-[#18202a]`}>{name.trim() || '새 소분류'}</p>
                <p className={`${FONT} mt-[4px] text-[12px] text-[#6c7b8e]`}>{emoji ? `${emoji} ${state.category.name}` : `${state.category.name} 기반 썸네일`}</p>
              </div>
            </div>
          </div>
        </div>

        <EmojiTabbedPicker
          value={emoji}
          onChange={(nextEmoji) => {
            setEmoji(nextEmoji)
            setEmojiTouched(true)
          }}
        />
      </div>

      <div className="mt-[24px] flex justify-end gap-[10px]">
        <button onClick={onClose} className={`${FONT} rounded-[12px] border border-[#d9e2ec] px-[18px] py-[10px] text-[13px] font-semibold text-[#6c7b8e] transition-colors hover:bg-[#f7f9fc]`}>
          취소
        </button>
        <button
          onClick={() => void onSubmit({ name: name.trim(), emoji })}
          className={`${FONT} rounded-[12px] bg-[#004ea7] px-[18px] py-[10px] text-[13px] font-semibold text-white transition-colors hover:bg-[#003d86]`}
        >
          저장하기
        </button>
      </div>
    </ModalFrame>
  )
}

function NoticeModal({ title, message, confirmLabel = '확인', onClose }: {
  title: string
  message: string
  confirmLabel?: string
  onClose: () => void
}) {
  return (
    <ModalFrame title={title} description={message} onClose={onClose} widthClass="max-w-[520px]">
      <div className="flex justify-end">
        <button onClick={onClose} className={`${FONT} rounded-[12px] bg-[#004ea7] px-[18px] py-[10px] text-[13px] font-semibold text-white transition-colors hover:bg-[#003d86]`}>
          {confirmLabel}
        </button>
      </div>
    </ModalFrame>
  )
}

function ConfirmDeleteModal({ title, description, onCancel, onConfirm }: {
  title: string
  description: string
  onCancel: () => void
  onConfirm: () => Promise<void>
}) {
  return (
    <ModalFrame title={title} description={description} onClose={onCancel} widthClass="max-w-[520px]">
      <div className="flex justify-end gap-[10px]">
        <button onClick={onCancel} className={`${FONT} rounded-[12px] border border-[#d9e2ec] px-[18px] py-[10px] text-[13px] font-semibold text-[#6c7b8e] transition-colors hover:bg-[#f7f9fc]`}>
          취소
        </button>
        <button onClick={() => void onConfirm()} className={`${FONT} rounded-[12px] bg-[#ff786b] px-[18px] py-[10px] text-[13px] font-semibold text-white transition-colors hover:bg-[#ef6759]`}>
          삭제하기
        </button>
      </div>
    </ModalFrame>
  )
}

function ReplaceSubcategoryModal({ subcategory, categories, subcategories, onClose, onConfirm }: {
  subcategory: Subcategory
  categories: Category[]
  subcategories: Subcategory[]
  onClose: () => void
  onConfirm: (replacement: { categoryId: string; subcategoryId: string }) => Promise<void>
}) {
  const currentCategoryId = categories.find((category) => category.id === subcategory.category_id)?.id ?? ''
  const [targetCategoryId, setTargetCategoryId] = useState(currentCategoryId)
  const [targetSubcategoryId, setTargetSubcategoryId] = useState('')
  const availableCategories = categories
  const filteredSubs = subcategories.filter((item) => item.category_id === targetCategoryId && item.id !== subcategory.id)

  useEffect(() => {
    setTargetCategoryId(currentCategoryId)
    setTargetSubcategoryId('')
  }, [currentCategoryId, subcategory.id])

  return (
    <ModalFrame
      title="소분류 삭제 전에 대체 분류를 지정해주세요"
      description="이미 적용된 내역이 있어 바로 삭제할 수 없습니다. 먼저 해당 내역들이 이동할 대분류와 소분류를 선택해주세요."
      onClose={onClose}
      widthClass="max-w-[620px]"
    >
      <div className="flex flex-col gap-[16px]">
        <div className="rounded-[18px] border border-[#edf1f6] bg-[#fbfcfe] p-[16px]">
          <div className="flex items-center gap-[12px]">
            <SubcategoryThumbnail
              category={categories.find((item) => item.id === subcategory.category_id)}
              subcategory={subcategory}
              size="sm"
            />
            <div>
              <p className={`${FONT} text-[13px] font-semibold text-[#18202a]`}>삭제 대상</p>
              <p className={`${FONT} mt-[4px] text-[13px] text-[#6c7b8e]`}>{formatSubcategoryLabel(subcategory)}</p>
            </div>
          </div>
        </div>
        <div className="grid gap-[14px] md:grid-cols-2">
          <div className="flex flex-col gap-[8px]">
            <label className={`${FONT} text-[12px] font-semibold uppercase tracking-[0.6px] text-[#6c7b8e]`}>대체 대분류</label>
            <select value={targetCategoryId} onChange={(e) => { setTargetCategoryId(e.target.value); setTargetSubcategoryId('') }} className={`${INPUT_SM} h-[44px] rounded-[14px] px-[14px] text-[14px]`}>
              <option value="">대분류 선택</option>
              {availableCategories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-[8px]">
            <label className={`${FONT} text-[12px] font-semibold uppercase tracking-[0.6px] text-[#6c7b8e]`}>대체 소분류</label>
            <select value={targetSubcategoryId} onChange={(e) => setTargetSubcategoryId(e.target.value)} className={`${INPUT_SM} h-[44px] rounded-[14px] px-[14px] text-[14px]`} disabled={!targetCategoryId}>
              <option value="">소분류 선택</option>
              {filteredSubs.map((item) => (
                <option key={item.id} value={item.id}>{formatSubcategoryLabel(item)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-[24px] flex justify-end gap-[10px]">
        <button onClick={onClose} className={`${FONT} rounded-[12px] border border-[#d9e2ec] px-[18px] py-[10px] text-[13px] font-semibold text-[#6c7b8e] transition-colors hover:bg-[#f7f9fc]`}>
          취소
        </button>
        <button
          onClick={() => {
            if (!targetCategoryId || !targetSubcategoryId) return
            void onConfirm({ categoryId: targetCategoryId, subcategoryId: targetSubcategoryId })
          }}
          className={`${FONT} rounded-[12px] bg-[#004ea7] px-[18px] py-[10px] text-[13px] font-semibold text-white transition-colors hover:bg-[#003d86]`}
        >
          대체 후 삭제
        </button>
      </div>
    </ModalFrame>
  )
}

function CategoryCard({
  cat,
  onCreateSub,
  onEditCategory,
  onEditSubcategory,
  onDeleteCategory,
  onDeleteSubcategory,
}: {
  cat: CatWithSubs
  onCreateSub: (category: Category) => void
  onEditCategory: (category: Category) => void
  onEditSubcategory: (category: Category, subcategory: Subcategory) => void
  onDeleteCategory: (category: Category) => void
  onDeleteSubcategory: (category: Category, subcategory: Subcategory) => void
}) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-[rgba(226,232,240,0.9)] bg-white shadow-[0_8px_20px_rgba(24,32,42,0.04)]">
      <div className="flex items-start justify-between gap-[8px] bg-[#f4f4f7] pl-[22px] pr-[12px] py-[12px]">
        <div className="min-w-0 pt-[2px]">
          <p className={`${FONT} truncate text-[16px] font-bold text-[#18202a]`}>{cat.name}</p>
        </div>
        <div className="flex items-center gap-[6px]">
          <button onClick={() => onCreateSub(cat)} className="rounded-[8px] bg-white/70 px-[8px] py-[6px] text-[#004ea7] transition-colors hover:bg-white">
            <Plus size={12} />
          </button>
          <button onClick={() => onEditCategory(cat)} className="rounded-[8px] bg-white/70 px-[8px] py-[6px] text-[#6c7b8e] transition-colors hover:bg-white hover:text-[#004ea7]">
            <Pencil size={12} />
          </button>
          <button onClick={() => onDeleteCategory(cat)} className="rounded-[8px] bg-white/70 px-[8px] py-[6px] text-[#6c7b8e] transition-colors hover:bg-white hover:text-[#ff786b]">
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-[6px] p-[10px]">
        {cat.subs.length === 0 ? (
          <div className="rounded-[12px] border border-dashed border-[#d8e0ea] bg-[#fbfcfe] px-[10px] py-[12px] text-center">
            <p className={`${FONT} text-[11px] text-[#6c7b8e]`}>소분류 없음</p>
          </div>
        ) : (
          cat.subs.map((sub) => (
            <div key={sub.id} className="flex items-center justify-between gap-[8px] rounded-[12px] border border-[#eef2f6] bg-[#fbfcfe] px-[10px] py-[8px]">
              <div className="flex min-w-0 items-center gap-[8px]">
                <SubcategoryThumbnail category={cat} subcategory={sub} size="sm" />
                <p className={`${FONT} truncate text-[12px] font-semibold text-[#18202a]`}>{sub.name}</p>
              </div>
              <div className="flex items-center gap-[2px]">
                <button onClick={() => onEditSubcategory(cat, sub)} className="rounded-[8px] px-[6px] py-[5px] text-[#6c7b8e] transition-colors hover:bg-white hover:text-[#004ea7]">
                  <Pencil size={11} />
                </button>
                <button onClick={() => onDeleteSubcategory(cat, sub)} className="rounded-[8px] px-[6px] py-[5px] text-[#6c7b8e] transition-colors hover:bg-white hover:text-[#ff786b]">
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))
        )}
        <button
          onClick={() => onCreateSub(cat)}
          className={`${FONT} flex items-center justify-center gap-[5px] rounded-[12px] border border-dashed border-[#cfd8e3] px-[10px] py-[8px] text-[11px] font-semibold text-[#5898ff] transition-colors hover:border-[#5898ff] hover:bg-[#f7faff]`}
        >
          <Plus size={11} /> 소분류 추가
        </button>
      </div>
    </div>
  )
}

function CategorySection({ title, cats, type, allCategories, allSubcategories, onRefresh }: {
  title: string
  cats: CatWithSubs[]
  type: 'expense' | 'income'
  allCategories: Category[]
  allSubcategories: Subcategory[]
  onRefresh: () => void
}) {
  const [categoryModal, setCategoryModal] = useState<CategoryModalState | null>(null)
  const [subcategoryModal, setSubcategoryModal] = useState<SubcategoryModalState | null>(null)
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null)
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<Category | null>(null)
  const [deleteSubcategoryTarget, setDeleteSubcategoryTarget] = useState<{ category: Category; subcategory: Subcategory } | null>(null)
  const [replaceSubcategoryTarget, setReplaceSubcategoryTarget] = useState<{ category: Category; subcategory: Subcategory } | null>(null)

  const handleDeleteCategory = async (category: Category) => {
    const usage = await countCategoryUsages(category.id)
    if (usage.total > 0) {
      setNotice({
        title: '대분류를 삭제할 수 없습니다',
        message: '이미 적용된 분류가 있어 삭제할 수 없습니다. 먼저 해당 분류를 사용하는 거래, 고정항목, 예산 설정을 정리해주세요.',
      })
      return
    }
    setDeleteCategoryTarget(category)
  }

  const handleDeleteSubcategory = async (category: Category, subcategory: Subcategory) => {
    const usage = await countSubcategoryUsages(subcategory.id)
    if (usage.total > 0) {
      setReplaceSubcategoryTarget({ category, subcategory })
      return
    }
    setDeleteSubcategoryTarget({ category, subcategory })
  }

  return (
    <div className="mb-[32px]">
      <div className="flex items-center justify-between mb-[14px]">
        <h3 className={`${FONT} font-bold text-[15px] text-[#18202a]`}>{title}</h3>
        <button
          onClick={() => setCategoryModal({ mode: 'create', type })}
          className="flex items-center gap-[6px] bg-[#004ea7] hover:bg-[#003d86] rounded-[8px] px-[12px] py-[6px] transition-colors"
        >
          <Plus size={12} className="text-white" />
          <span className={`${FONT} text-[11px] font-semibold text-white`}>대분류 추가</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-[10px] md:grid-cols-[repeat(auto-fill,minmax(210px,1fr))]">
        {cats.map((cat) => (
          <CategoryCard
            key={cat.id}
            cat={cat}
            onCreateSub={(category) => setSubcategoryModal({ mode: 'create', category })}
            onEditCategory={(category) => setCategoryModal({ mode: 'edit', type, category })}
            onEditSubcategory={(category, subcategory) => setSubcategoryModal({ mode: 'edit', category, subcategory })}
            onDeleteCategory={(category) => void handleDeleteCategory(category)}
            onDeleteSubcategory={(category, subcategory) => void handleDeleteSubcategory(category, subcategory)}
          />
        ))}
      </div>

      {categoryModal ? (
        <CategoryModal
          state={categoryModal}
          onClose={() => setCategoryModal(null)}
          onSubmit={async ({ name, color }) => {
            try {
              if (!name) {
                setNotice({ title: '입력값을 확인해주세요', message: '대분류 이름을 입력한 뒤 저장해주세요.' })
                return
              }
              if (categoryModal.mode === 'create') {
                await createCategory({ name, type: categoryModal.type, color })
              } else if (categoryModal.category) {
                await updateCategory(categoryModal.category.id, { name, color })
              }
              setCategoryModal(null)
              await onRefresh()
            } catch (error) {
              setNotice({
                title: '대분류 저장에 실패했습니다',
                message: error instanceof Error ? error.message : '잠시 후 다시 시도해주세요.',
              })
            }
          }}
        />
      ) : null}

      {subcategoryModal ? (
        <SubcategoryModal
          state={subcategoryModal}
          onClose={() => setSubcategoryModal(null)}
          onSubmit={async ({ name, emoji }) => {
            try {
              if (!name) {
                setNotice({ title: '입력값을 확인해주세요', message: '소분류 이름을 입력한 뒤 저장해주세요.' })
                return
              }
              if (subcategoryModal.mode === 'create') {
                await createSubcategory(subcategoryModal.category.id, name, emoji)
              } else if (subcategoryModal.subcategory) {
                await updateSubcategory(subcategoryModal.subcategory.id, name, emoji)
              }
              setSubcategoryModal(null)
              await onRefresh()
            } catch (error) {
              setNotice({
                title: '소분류 저장에 실패했습니다',
                message: error instanceof Error ? error.message : '잠시 후 다시 시도해주세요.',
              })
            }
          }}
        />
      ) : null}

      {notice ? <NoticeModal title={notice.title} message={notice.message} onClose={() => setNotice(null)} /> : null}

      {deleteCategoryTarget ? (
        <ConfirmDeleteModal
          title="대분류를 삭제할까요?"
          description={`'${deleteCategoryTarget.name}' 대분류와 연결된 미사용 소분류가 함께 삭제됩니다.`}
          onCancel={() => setDeleteCategoryTarget(null)}
          onConfirm={async () => {
            await deleteCategory(deleteCategoryTarget.id)
            setDeleteCategoryTarget(null)
            await onRefresh()
          }}
        />
      ) : null}

      {deleteSubcategoryTarget ? (
        <ConfirmDeleteModal
          title="소분류를 삭제할까요?"
          description={`'${deleteSubcategoryTarget.subcategory.name}' 소분류를 삭제합니다.`}
          onCancel={() => setDeleteSubcategoryTarget(null)}
          onConfirm={async () => {
            await deleteSubcategory(deleteSubcategoryTarget.subcategory.id)
            setDeleteSubcategoryTarget(null)
            await onRefresh()
          }}
        />
      ) : null}

      {replaceSubcategoryTarget ? (
        <ReplaceSubcategoryModal
          subcategory={replaceSubcategoryTarget.subcategory}
          categories={allCategories.filter((category) => category.type === type)}
          subcategories={allSubcategories.filter((subcategory) => {
            const category = allCategories.find((item) => item.id === subcategory.category_id)
            return category?.type === type
          })}
          onClose={() => setReplaceSubcategoryTarget(null)}
          onConfirm={async (replacement) => {
            await replaceSubcategoryReferencesAndDelete(replaceSubcategoryTarget.subcategory.id, replacement)
            setReplaceSubcategoryTarget(null)
            await onRefresh()
          }}
        />
      ) : null}
    </div>
  )
}

function CategoriesPanel() {
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [incomeCats,  setIncomeCats]  = useState<CatWithSubs[]>([])
  const [expenseCats, setExpenseCats] = useState<CatWithSubs[]>([])
  const [loading,     setLoading]     = useState(true)
  const autoRecommendedRef = useRef(false)

  const load = useCallback(async () => {
    setLoading(true)
    let [cats, subs] = await Promise.all([getCategories(), getSubcategories()])

    if (!autoRecommendedRef.current) {
      const missingEmojiSubs = subs.filter((sub) => !sub.emoji)

      if (missingEmojiSubs.length > 0) {
        await Promise.all(
          missingEmojiSubs.map((sub) => {
            const parentCategory = cats.find((category) => category.id === sub.category_id)
            return updateSubcategory(
              sub.id,
              sub.name,
              recommendSubcategoryEmoji(sub.name, parentCategory?.name)
            )
          })
        )
        ;[cats, subs] = await Promise.all([getCategories(), getSubcategories()])
      }

      autoRecommendedRef.current = true
    }

    const merge = (type: 'expense' | 'income'): CatWithSubs[] =>
      cats.filter((c) => c.type === type).map((c) => ({ ...c, subs: subs.filter((s) => s.category_id === c.id) }))
    setCategories(cats)
    setSubcategories(subs)
    setIncomeCats(merge('income'))
    setExpenseCats(merge('expense'))
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <Spinner />
  return (
    <div>
      <CategorySection title="수입 분류" cats={incomeCats} type="income" allCategories={categories} allSubcategories={subcategories} onRefresh={load} />
      <CategorySection title="소비 분류" cats={expenseCats} type="expense" allCategories={categories} allSubcategories={subcategories} onRefresh={load} />
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// ── 2. 지출방식 패널 ─────────────────────────────────────────
// ════════════════════════════════════════════════════════════════
const COLOR_PALETTE = ['#86AEED','#FFD979','#FF9F73','#99D276','#AEAFAF','#F9C6C6','#DFC3F7','#CADE9F']

function PaymentEditForm({ fName, setFName, fOwner, setFOwner, fInitial, setFInitial, fColor, setFColor, onSave, onCancel }: {
  fName: string; setFName: (v: string) => void
  fOwner: string; setFOwner: (v: string) => void
  fInitial: string; setFInitial: (v: string) => void
  fColor: string; setFColor: (v: string) => void
  onSave: () => void; onCancel: () => void
}) {
  return (
    <div className="grid grid-cols-2 gap-[10px] md:flex md:items-center md:gap-[12px]">
      <div className="col-span-2 md:col-span-1 w-[48px] h-[30px] rounded-[4px] flex items-center justify-center font-bold text-[18px] text-white flex-shrink-0" style={{ backgroundColor: fColor }}>
        {fInitial || '?'}
      </div>
      <input value={fInitial} onChange={(e) => setFInitial(e.target.value.slice(0, 1).toUpperCase())}
        placeholder="이니셜" maxLength={1} className={`w-full md:w-[52px] text-center ${INPUT_SM}`} />
      <input value={fName} onChange={(e) => setFName(e.target.value)}
        placeholder="지출방식명" className={`col-span-2 md:col-span-1 flex-1 ${INPUT_SM}`} autoFocus />
      <input value={fOwner} onChange={(e) => setFOwner(e.target.value)}
        placeholder="소유주" className={`col-span-2 md:col-span-1 w-full md:w-[96px] ${INPUT_SM}`} />
      <div className="col-span-2 flex flex-wrap gap-[6px]">
        {COLOR_PALETTE.map((c) => (
          <button key={c} onClick={() => setFColor(c)}
            className={`h-[20px] w-[20px] rounded-full transition-all ${fColor === c ? 'ring-2 ring-offset-1 ring-[#004ea7]' : ''}`}
            style={{ backgroundColor: c }} />
        ))}
      </div>
      <div className="col-span-2 flex items-center justify-end gap-[12px] md:col-span-1">
        <button onClick={onSave}   className="text-[#99D276] hover:opacity-70"><Check size={16} /></button>
        <button onClick={onCancel} className="text-[#c0c8d4] hover:opacity-70"><X size={16} /></button>
      </div>
    </div>
  )
}

function PaymentPanel() {
  const [payments, setPayments] = useState<PaymentMethod[]>([])
  const [loading,  setLoading]  = useState(true)
  const [editId,   setEditId]   = useState<string | null>(null)
  const [addMode,  setAddMode]  = useState(false)
  const [error,    setError]    = useState('')

  // 편집 폼 상태
  const [fName,    setFName]    = useState('')
  const [fOwner,   setFOwner]   = useState('')
  const [fInitial, setFInitial] = useState('')
  const [fColor,   setFColor]   = useState(COLOR_PALETTE[0])

  const load = useCallback(async () => {
    setLoading(true)
    setPayments(await getPaymentMethods())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const startEdit = (p: PaymentMethod) => {
    setError('')
    setAddMode(false)
    setEditId(p.id); setFName(p.name); setFOwner(p.owner ?? ''); setFInitial(p.initial); setFColor(p.color)
  }

  const startAdd = () => {
    setError('')
    setEditId(null)
    setFName(''); setFOwner(''); setFInitial(''); setFColor(COLOR_PALETTE[0])
    setAddMode(true)
  }

  const saveEdit = async () => {
    if (!fName.trim() || !fInitial.trim()) return
    try {
      setError('')
      await updatePaymentMethod(editId!, { name: fName, owner: fOwner, initial: fInitial, color: fColor })
      setEditId(null)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : '지출방식 저장에 실패했습니다')
    }
  }

  const saveAdd = async () => {
    if (!fName.trim() || !fInitial.trim()) return
    try {
      setError('')
      await createPaymentMethod({ name: fName, owner: fOwner, initial: fInitial, color: fColor })
      setAddMode(false)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : '지출방식 저장에 실패했습니다')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return
    await deletePaymentMethod(id)
    load()
  }

  if (loading) return <Spinner />
  return (
    <div>
      <SectionHeader title="지출방식" onAdd={startAdd} />
      {error ? <p className={`${FONT} mb-[10px] text-[12px] text-[#ff786b]`}>{error}</p> : null}
      <div className="flex flex-col gap-[8px]">
        {payments.map((p) => (
          <div key={p.id} className="bg-white rounded-[16px] border border-[rgba(226,232,240,0.8)] px-[20px] py-[16px]">
            {editId === p.id ? (
              <PaymentEditForm fName={fName} setFName={setFName} fOwner={fOwner} setFOwner={setFOwner} fInitial={fInitial} setFInitial={setFInitial} fColor={fColor} setFColor={setFColor} onSave={saveEdit} onCancel={() => setEditId(null)} />
            ) : (
              <div className="flex items-center gap-[14px]">
                <div className="w-[48px] h-[30px] rounded-[4px] flex items-center justify-center font-bold text-[20px] text-white flex-shrink-0"
                  style={{ backgroundColor: p.color }}>
                  {p.initial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`${FONT} truncate font-semibold text-[14px] text-[#18202a]`}>{p.name}</p>
                  <p className={`${FONT} mt-[2px] truncate text-[11px] text-[#6c7b8e]`}>{p.owner || '소유주 미지정'}</p>
                </div>
                <div className="flex items-center gap-[10px]">
                  <button onClick={() => startEdit(p)} className="text-[#c0c8d4] hover:text-[#5898ff] transition-colors"><Pencil size={13} /></button>
                  <button onClick={() => handleDelete(p.id)} className="text-[#c0c8d4] hover:text-[#ff786b] transition-colors"><Trash2 size={13} /></button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* 추가 폼 */}
        {addMode && (
          <div className="bg-white rounded-[16px] border border-[#5898ff] px-[20px] py-[16px]">
            <PaymentEditForm fName={fName} setFName={setFName} fOwner={fOwner} setFOwner={setFOwner} fInitial={fInitial} setFInitial={setFInitial} fColor={fColor} setFColor={setFColor} onSave={saveAdd} onCancel={() => setAddMode(false)} />
          </div>
        )}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// ── 3. 지역 패널 ─────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════
function RegionPanel() {
  const [regions,  setRegions]  = useState<Region[]>([])
  const [loading,  setLoading]  = useState(true)
  const [input,    setInput]    = useState('')
  const [showHistory, setShowHistory] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setRegions(await getRegions(false))   // 전체 (삭제 포함) 로드
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const active  = regions.filter((r) => r.is_active)
  const deleted = regions.filter((r) => !r.is_active)

  const add = async () => {
    if (!input.trim()) return
    await createRegion(input.trim())
    setInput('')
    load()
  }

  const remove = async (id: string) => {
    await deleteRegion(id)
    load()
  }

  const restore = async (id: string) => {
    await restoreRegion(id)
    load()
  }

  if (loading) return <Spinner />
  return (
    <div>
      <SectionHeader title="지역" />

      {/* 활성 지역 */}
      <div className="flex flex-wrap gap-[8px] mb-[16px]">
        {active.map((r) => (
          <div key={r.id} className="flex items-center gap-[6px] bg-white border border-[rgba(226,232,240,0.8)] rounded-full px-[14px] py-[8px]">
            <span className={`${FONT} text-[13px] text-[#18202a]`}>{r.name}</span>
            <button onClick={() => remove(r.id)} className="text-[#c0c8d4] hover:text-[#ff786b] transition-colors"><X size={11} /></button>
          </div>
        ))}
        {active.length === 0 && (
          <p className={`${FONT} text-[13px] text-[#6c7b8e]`}>등록된 지역이 없습니다</p>
        )}
      </div>

      {/* 추가 입력 */}
      <div className="flex gap-[8px] mb-[24px]">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="지역 이름 입력 후 Enter"
          className={`flex-1 border border-[#e4e5e9] rounded-[10px] px-[14px] py-[10px] ${FONT} text-[13px] outline-none focus:border-[#5898ff] transition-colors`} />
        <button onClick={add}
          className={`${FONT} text-[12px] font-semibold text-white bg-[#004ea7] rounded-[10px] px-[20px] hover:bg-[#003d86] transition-colors`}>
          추가
        </button>
      </div>

      {/* 삭제 히스토리 */}
      {deleted.length > 0 && (
        <div>
          <button
            onClick={() => setShowHistory((v) => !v)}
            className={`flex items-center gap-[6px] mb-[10px] group`}
          >
            <span className={`${FONT} text-[11px] font-semibold text-[#6c7b8e] uppercase tracking-[0.8px]`}>
              삭제된 지역 히스토리
            </span>
            <span className={`${FONT} text-[10px] text-white bg-[#c0c8d4] rounded-full px-[7px] py-[1px] leading-none`}>
              {deleted.length}
            </span>
            <ChevronRight size={12} className={`text-[#c0c8d4] transition-transform ${showHistory ? 'rotate-90' : ''}`} />
          </button>
          {showHistory && (
            <div className="flex flex-wrap gap-[8px]">
              {deleted.map((r) => (
                <div key={r.id} className="flex items-center gap-[6px] bg-[#f4f4f7] border border-[#e4e5e9] rounded-full px-[14px] py-[8px]">
                  <span className={`${FONT} text-[13px] text-[#6c7b8e] line-through`}>{r.name}</span>
                  <button
                    onClick={() => restore(r.id)}
                    title="복원"
                    className="text-[#5898ff] hover:text-[#004ea7] transition-colors"
                  >
                    <RotateCcw size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// ── 4. 통화 패널 ─────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════

// 추가 가능한 보조 통화 프리셋
const CURRENCY_PRESETS: { code: string; name: string; symbol: string }[] = [
  { code: 'USD', name: '미국 달러',         symbol: '$'   },
  { code: 'JPY', name: '일본 엔',           symbol: '¥'   },
  { code: 'EUR', name: '유로',              symbol: '€'   },
  { code: 'THB', name: '태국 바트',         symbol: '฿'   },
  { code: 'SGD', name: '싱가포르 달러',     symbol: 'S$'  },
  { code: 'AUD', name: '호주 달러',         symbol: 'A$'  },
  { code: 'IDR', name: '인도네시아 루피아', symbol: 'Rp'  },
  { code: 'MYR', name: '말레이시아 링깃',  symbol: 'RM'  },
  { code: 'PHP', name: '필리핀 페소',       symbol: '₱'   },
  { code: 'VND', name: '베트남 동',        symbol: '₫'   },
  { code: 'HKD', name: '홍콩 달러',        symbol: 'HK$' },
  { code: 'CNY', name: '중국 위안',        symbol: '¥'   },
  { code: 'GBP', name: '영국 파운드',      symbol: '£'   },
  { code: 'CAD', name: '캐나다 달러',      symbol: 'C$'  },
  { code: 'NZD', name: '뉴질랜드 달러',   symbol: 'NZ$' },
  { code: 'MXN', name: '멕시코 페소',      symbol: 'MX$' },
  { code: 'INR', name: '인도 루피',        symbol: '₹'   },
  { code: 'BRL', name: '브라질 헤알',      symbol: 'R$'  },
]

function CurrencyPanel() {
  const [currencies,  setCurrencies]  = useState<Currency[]>([])
  const [loading,     setLoading]     = useState(true)
  const [showPicker,  setShowPicker]  = useState(false)
  const [adding,      setAdding]      = useState(false)
  const [customMode,  setCustomMode]  = useState(false)
  const [customCode,  setCustomCode]  = useState('')
  const [customName,  setCustomName]  = useState('')
  const [customSymbol,setCustomSymbol]= useState('')
  const [customError, setCustomError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const all = await getCurrencies()
    // KRW 최상단 고정
    const sorted = [
      ...all.filter((c) => c.code === 'KRW'),
      ...all.filter((c) => c.code !== 'KRW'),
    ]
    setCurrencies(sorted)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const existingCodes = new Set(currencies.map((c) => c.code))
  const addablePresets = CURRENCY_PRESETS.filter((p) => !existingCodes.has(p.code))

  const toggle = async (code: string, current: boolean) => {
    if (code === 'KRW') return
    setCurrencies((prev) => prev.map((c) => c.code === code ? { ...c, is_active: !current } : c))
    await toggleCurrency(code, !current)
  }

  const handleAdd = async (preset: { code: string; name: string; symbol: string }) => {
    setAdding(true)
    setShowPicker(false)
    setCustomMode(false)
    await createCurrency(preset)
    await load()
    setAdding(false)
  }

  const handleCustomAdd = async () => {
    const code = customCode.trim().toUpperCase()
    const name = customName.trim()
    const symbol = customSymbol.trim()
    if (!code || !name || !symbol) { setCustomError('코드, 이름, 기호를 모두 입력하세요'); return }
    if (existingCodes.has(code)) { setCustomError(`'${code}'는 이미 존재하는 통화입니다`); return }
    setCustomError('')
    await handleAdd({ code, name, symbol })
    setCustomCode(''); setCustomName(''); setCustomSymbol('')
  }

  const handleDelete = async (code: string) => {
    if (!confirm(`'${code}' 통화를 삭제하시겠습니까?`)) return
    await deleteCurrency(code)
    load()
  }

  if (loading) return <Spinner />
  return (
    <div>
      <div className="flex items-center justify-between mb-[20px]">
        <h2 className={`${FONT} font-bold text-[18px] text-[#18202a]`}>통화</h2>
        <div className="relative">
          <button
            onClick={() => { setShowPicker((v) => !v); setCustomMode(false) }}
            disabled={adding}
            className={`${FONT} text-[12px] font-semibold text-white bg-[#004ea7] rounded-[8px] px-[16px] py-[8px] hover:bg-[#003d86] transition-colors flex items-center gap-[6px] disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <Plus size={12} /> 보조 통화 추가
          </button>

          {showPicker && (
            <div className="absolute right-0 top-[calc(100%+6px)] z-20 bg-white rounded-[14px] shadow-[0px_8px_32px_rgba(0,0,0,0.12)] border border-[rgba(226,232,240,0.8)] w-[260px] overflow-hidden">
              {!customMode ? (
                <>
                  <div className={`${FONT} text-[10px] font-bold text-[#6c7b8e] uppercase tracking-[1px] px-[14px] py-[10px] border-b border-[#f0f2f7]`}>
                    추가할 통화 선택
                  </div>
                  <div className="max-h-[260px] overflow-y-auto">
                    {addablePresets.map((p) => (
                      <button
                        key={p.code}
                        onClick={() => handleAdd(p)}
                        className="w-full flex items-center gap-[12px] px-[14px] py-[10px] hover:bg-[#f4f8ff] transition-colors text-left"
                      >
                        <span className={`${FONT} font-bold text-[14px] text-[#5898ff] w-[36px]`}>{p.symbol}</span>
                        <div>
                          <p className={`${FONT} font-semibold text-[12px] text-[#18202a]`}>{p.code}</p>
                          <p className={`${FONT} text-[10px] text-[#6c7b8e]`}>{p.name}</p>
                        </div>
                      </button>
                    ))}
                    {addablePresets.length === 0 && (
                      <p className={`${FONT} text-[12px] text-[#6c7b8e] text-center py-[16px]`}>추가 가능한 프리셋 없음</p>
                    )}
                  </div>
                  {/* 직접 입력 진입 */}
                  <button
                    onClick={() => setCustomMode(true)}
                    className={`w-full flex items-center gap-[8px] px-[14px] py-[11px] border-t border-[#f0f2f7] hover:bg-[#f4f8ff] transition-colors`}
                  >
                    <Plus size={12} className="text-[#5898ff]" />
                    <span className={`${FONT} text-[12px] font-semibold text-[#5898ff]`}>직접 입력</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-[8px] px-[14px] py-[10px] border-b border-[#f0f2f7]">
                    <button onClick={() => { setCustomMode(false); setCustomError('') }} className="text-[#6c7b8e] hover:text-[#18202a]">
                      <X size={14} />
                    </button>
                    <span className={`${FONT} text-[10px] font-bold text-[#6c7b8e] uppercase tracking-[1px]`}>직접 입력</span>
                  </div>
                  <div className="px-[14px] py-[12px] flex flex-col gap-[8px]">
                    <div className="flex gap-[6px]">
                      <div className="flex flex-col gap-[3px] w-[72px]">
                        <label className={`${FONT} text-[9px] font-semibold text-[#6c7b8e] uppercase tracking-[0.6px]`}>코드</label>
                        <input
                          value={customCode}
                          onChange={(e) => setCustomCode(e.target.value.toUpperCase().slice(0, 5))}
                          placeholder="CHF"
                          className={`${INPUT_SM} w-full text-center`}
                        />
                      </div>
                      <div className="flex flex-col gap-[3px] w-[52px]">
                        <label className={`${FONT} text-[9px] font-semibold text-[#6c7b8e] uppercase tracking-[0.6px]`}>기호</label>
                        <input
                          value={customSymbol}
                          onChange={(e) => setCustomSymbol(e.target.value.slice(0, 4))}
                          placeholder="Fr"
                          className={`${INPUT_SM} w-full text-center`}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-[3px]">
                      <label className={`${FONT} text-[9px] font-semibold text-[#6c7b8e] uppercase tracking-[0.6px]`}>통화 이름</label>
                      <input
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="스위스 프랑"
                        className={`${INPUT_SM} w-full`}
                      />
                    </div>
                    {customError && <p className={`${FONT} text-[10px] text-[#ff786b]`}>{customError}</p>}
                    <button
                      onClick={handleCustomAdd}
                      className={`${FONT} text-[12px] font-semibold text-white bg-[#004ea7] rounded-[8px] py-[8px] hover:bg-[#003d86] transition-colors`}
                    >
                      추가
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-[8px]">
        {currencies.map((c) => (
          <div
            key={c.code}
            className={`rounded-[16px] border px-[20px] py-[14px] flex items-center justify-between transition-colors
              ${c.code === 'KRW'
                ? 'bg-[#EEF5FF] border-[#c7deff]'
                : 'bg-white border-[rgba(226,232,240,0.8)]'}`}
          >
            <div className="flex items-center gap-[14px]">
              <div className={`w-[40px] h-[40px] rounded-[10px] flex items-center justify-center flex-shrink-0
                ${c.code === 'KRW' ? 'bg-[#004ea7]' : 'bg-[#f0f4ff]'}`}>
                <span className={`${FONT} font-bold text-[15px] ${c.code === 'KRW' ? 'text-white' : 'text-[#5898ff]'}`}>
                  {c.symbol}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-[8px]">
                  <p className={`${FONT} font-semibold text-[13px] text-[#18202a]`}>{c.code}</p>
                  {c.code === 'KRW' && (
                    <span className={`${FONT} text-[10px] font-medium text-[#004ea7] bg-[#d6e8ff] px-[7px] py-[2px] rounded-full leading-none`}>
                      주 통화
                    </span>
                  )}
                </div>
                <p className={`${FONT} text-[11px] text-[#6c7b8e]`}>{c.name}</p>
              </div>
            </div>

            {c.code === 'KRW' ? (
              <span className={`${FONT} text-[11px] text-[#6c7b8e]`}>고정</span>
            ) : (
              <div className="flex items-center gap-[14px]">
                <button
                  onClick={() => toggle(c.code, c.is_active)}
                  className={`relative w-[40px] h-[22px] rounded-full transition-colors duration-200 ${c.is_active ? 'bg-[#004ea7]' : 'bg-[#d8dae6]'}`}
                >
                  <span className={`absolute top-[2px] w-[18px] h-[18px] bg-white rounded-full shadow transition-all duration-200 ${c.is_active ? 'left-[20px]' : 'left-[2px]'}`} />
                </button>
                <button onClick={() => handleDelete(c.code)} className="text-[#c0c8d4] hover:text-[#ff786b] transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* picker 외부 클릭 닫기 */}
      {showPicker && (
        <div className="fixed inset-0 z-10" onClick={() => setShowPicker(false)} />
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// ── 5. 태그 패널 ─────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════
function TagsPanel() {
  const [tags,        setTags]        = useState<Tag[]>([])
  const [loading,     setLoading]     = useState(true)
  const [input,       setInput]       = useState('')
  const [showHistory, setShowHistory] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setTags(await getTags(false))   // 전체 (삭제 포함) 로드
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const active  = tags.filter((t) => t.is_active)
  const deleted = tags.filter((t) => !t.is_active)

  const add = async () => {
    if (!input.trim()) return
    await createTag(input.trim())
    setInput('')
    load()
  }

  const remove = async (id: string) => {
    await deleteTag(id)
    load()
  }

  const restore = async (id: string) => {
    await restoreTag(id)
    load()
  }

  if (loading) return <Spinner />
  return (
    <div>
      <SectionHeader title="태그" />

      {/* 활성 태그 */}
      <div className="flex flex-wrap gap-[8px] mb-[16px]">
        {active.map((t) => (
          <div key={t.id} className="flex items-center gap-[6px] bg-white border border-[rgba(226,232,240,0.8)] rounded-full px-[14px] py-[8px]">
            <span className={`${FONT} text-[13px] text-[#18202a]`}># {t.name}</span>
            <button onClick={() => remove(t.id)} className="text-[#c0c8d4] hover:text-[#ff786b] transition-colors"><X size={11} /></button>
          </div>
        ))}
        {active.length === 0 && (
          <p className={`${FONT} text-[13px] text-[#6c7b8e]`}>등록된 태그가 없습니다</p>
        )}
      </div>

      {/* 추가 입력 */}
      <div className="flex gap-[8px] mb-[24px]">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="태그 이름 입력 후 Enter"
          className={`flex-1 border border-[#e4e5e9] rounded-[10px] px-[14px] py-[10px] ${FONT} text-[13px] outline-none focus:border-[#5898ff] transition-colors`} />
        <button onClick={add}
          className={`${FONT} text-[12px] font-semibold text-white bg-[#004ea7] rounded-[10px] px-[20px] hover:bg-[#003d86] transition-colors`}>
          추가
        </button>
      </div>

      {/* 삭제 히스토리 */}
      {deleted.length > 0 && (
        <div>
          <button
            onClick={() => setShowHistory((v) => !v)}
            className="flex items-center gap-[6px] mb-[10px]"
          >
            <span className={`${FONT} text-[11px] font-semibold text-[#6c7b8e] uppercase tracking-[0.8px]`}>
              삭제된 태그 히스토리
            </span>
            <span className={`${FONT} text-[10px] text-white bg-[#c0c8d4] rounded-full px-[7px] py-[1px] leading-none`}>
              {deleted.length}
            </span>
            <ChevronRight size={12} className={`text-[#c0c8d4] transition-transform ${showHistory ? 'rotate-90' : ''}`} />
          </button>
          {showHistory && (
            <div className="flex flex-wrap gap-[8px]">
              {deleted.map((t) => (
                <div key={t.id} className="flex items-center gap-[6px] bg-[#f4f4f7] border border-[#e4e5e9] rounded-full px-[14px] py-[8px]">
                  <span className={`${FONT} text-[13px] text-[#6c7b8e] line-through`}># {t.name}</span>
                  <button
                    onClick={() => restore(t.id)}
                    title="복원"
                    className="text-[#5898ff] hover:text-[#004ea7] transition-colors"
                  >
                    <RotateCcw size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// ── 6. 고정항목 패널 (고정지출 / 고정수입 공통) ───────────────
// ════════════════════════════════════════════════════════════════
interface FixedItemWithNames extends FixedItem {
  categoryName: string
  subcategoryName: string
}

const MONTH_LABELS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

function FixedYearlyChart({ type, items }: { type: 'expense' | 'income'; items: FixedItemWithNames[] }) {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1  // 1-12

  const [monthlyActual, setMonthlyActual] = useState<(number | null)[]>(Array(12).fill(null))
  const [loadingChart, setLoadingChart] = useState(true)

  useEffect(() => {
    const fetchActual = async () => {
      setLoadingChart(true)
      const txs = await getTransactions({
        type,
        dateFrom: `${currentYear}-01-01`,
        dateTo:   `${currentYear}-12-31`,
      })
      const fixedTxs = txs.filter(t => t.is_fixed)
      const sums: (number | null)[] = Array(12).fill(null)
      fixedTxs.forEach(t => {
        const m = new Date(t.date + 'T00:00:00').getMonth()  // 0-based
        sums[m] = (sums[m] ?? 0) + t.amount
      })
      setMonthlyActual(sums)
      setLoadingChart(false)
    }
    fetchActual()
  }, [type, currentYear])

  const projectedAmount = items.reduce((s, i) => s + i.amount, 0)

  // 각 월의 표시 값: 과거 = 실제, 현재+미래 = 프로젝션
  const displayValues = MONTH_LABELS.map((_, idx) => {
    const m = idx + 1
    if (m < currentMonth) return monthlyActual[idx] ?? 0
    if (m === currentMonth) return monthlyActual[idx] ?? projectedAmount
    return projectedAmount
  })

  const maxVal = Math.max(...displayValues, 1)

  if (loadingChart) return <div className="flex items-center justify-center py-[24px]"><Loader2 size={16} className="animate-spin text-[#5898ff]" /></div>

  return (
    <div className="bg-white rounded-[16px] border border-[rgba(226,232,240,0.8)] px-[20px] py-[16px] mb-[16px]">
      <div className="flex items-center justify-between mb-[14px]">
        <p className={`${FONT} font-bold text-[13px] text-[#18202a]`}>{currentYear}년 월별 현황</p>
        <p className={`${FONT} text-[10px] text-[#6c7b8e]`}>과거: 실제 · 미래: 예정</p>
      </div>
      <div className="flex items-end gap-[6px] h-[80px]">
        {displayValues.map((val, idx) => {
          const m = idx + 1
          const isPast    = m < currentMonth
          const isCurrent = m === currentMonth
          const pct = maxVal > 0 ? (val / maxVal) * 100 : 0
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-[3px]">
              <div className="relative w-full flex items-end" style={{ height: 60 }}>
                <div
                  className="w-full rounded-[4px] transition-all"
                  style={{
                    height: `${Math.max(pct, val > 0 ? 8 : 2)}%`,
                    backgroundColor: isPast ? '#5898ff' : isCurrent ? '#004ea7' : '#c7deff',
                  }}
                />
                {val > 0 && (
                  <div className="absolute bottom-full mb-[2px] left-0 right-0 flex justify-center">
                    <span className={`${FONT} text-[7px] text-[#6c7b8e] whitespace-nowrap`}>
                      {val >= 1_000_000 ? `${(val/1_000_000).toFixed(1)}M` : val >= 10_000 ? `${Math.round(val/10_000)}만` : val.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
              <span className={`${FONT} text-[8px] ${isCurrent ? 'font-bold text-[#004ea7]' : 'text-[#6c7b8e]'}`}>
                {idx + 1}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FixedItemsPanel({ type }: { type: 'expense' | 'income' }) {
  const title = type === 'expense' ? '고정지출' : '고정수입'

  const [items,      setItems]      = useState<FixedItemWithNames[]>([])
  const [currentMonthActual, setCurrentMonthActual] = useState(0)
  const [categories, setCategories] = useState<Category[]>([])
  const [allSubs,    setAllSubs]    = useState<Subcategory[]>([])
  const [payments,   setPayments]   = useState<PaymentMethod[]>([])
  const [loading,    setLoading]    = useState(true)
  const [addMode,    setAddMode]    = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)

  // 추가 폼 상태
  const [fCatId,     setFCatId]     = useState('')
  const [fSubId,     setFSubId]     = useState('')
  const [fDesc,      setFDesc]      = useState('')
  const [fAmount,    setFAmount]    = useState('')
  const [fDay,       setFDay]       = useState('')
  const [fPaymentId, setFPaymentId] = useState('')

  const filteredSubs = allSubs.filter((s) => s.category_id === fCatId)

  const load = useCallback(async () => {
    setLoading(true)
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const monthStart = `${year}-${String(month).padStart(2, '0')}-01`
    const monthEnd = `${year}-${String(month).padStart(2, '0')}-${String(new Date(year, month, 0).getDate()).padStart(2, '0')}`
    const [rawItems, cats, subs, pm] = await Promise.all([
      getFixedItems(type),
      getCategories(type),
      getSubcategories(),
      type === 'expense' ? getPaymentMethods() : Promise.resolve([]),
    ])
    const monthTxs = await getTransactions({
      type,
      dateFrom: monthStart,
      dateTo: monthEnd,
    })
    const named: FixedItemWithNames[] = rawItems.map((item) => ({
      ...item,
      categoryName:    cats.find((c) => c.id === item.category_id)?.name    ?? '-',
      subcategoryName: subs.find((s) => s.id === item.subcategory_id)?.name ?? '-',
    }))
    setItems(named)
    setCurrentMonthActual(monthTxs.filter((tx) => tx.is_fixed).reduce((sum, tx) => sum + tx.amount, 0))
    setCategories(cats)
    setAllSubs(subs)
    setPayments(pm as PaymentMethod[])
    setLoading(false)
  }, [type])

  useEffect(() => { load() }, [load])

  const resetForm = () => {
    setFCatId(''); setFSubId(''); setFDesc(''); setFAmount(''); setFDay(''); setFPaymentId('')
  }

  const closeForm = () => {
    resetForm()
    setAddMode(false)
    setEditingItemId(null)
  }

  const handleEditStart = (item: FixedItemWithNames) => {
    setFCatId(item.category_id)
    setFSubId(item.subcategory_id)
    setFDesc(item.description)
    setFAmount(String(item.amount))
    setFDay(item.day_of_month ? String(item.day_of_month) : '')
    setFPaymentId(item.payment_method_id ?? '')
    setAddMode(false)
    setEditingItemId(item.id)
  }

  const handleSave = async () => {
    if (!fCatId || !fSubId || !fDesc || !fAmount) return
    const payload = {
      type,
      category_id:       fCatId,
      subcategory_id:    fSubId,
      description:       fDesc,
      amount:            Number(fAmount.replace(/,/g, '')),
      currency:          'KRW',
      payment_method_id: type === 'expense' ? fPaymentId || null : null,
      day_of_month:      fDay ? Number(fDay) : null,
      is_active:         true,
    }

    if (editingItemId) {
      await updateFixedItem(editingItemId, payload)
    } else {
      await createFixedItem(payload)
    }

    closeForm()
    await load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('고정항목을 해제하시겠습니까?')) return
    await deactivateFixedItem(id)
    load()
  }

  if (loading) return <Spinner />

  return (
    <div>
      <SectionHeader title={title} onAdd={() => { resetForm(); setEditingItemId(null); setAddMode(true) }} />

      {/* 이번 달 합계 */}
      {items.length > 0 && (
        <div className="flex items-center gap-[16px] mb-[16px] bg-white rounded-[16px] border border-[rgba(226,232,240,0.8)] px-[20px] py-[14px]">
          <div>
            <p className={`${FONT} text-[10px] font-semibold text-[#6c7b8e] uppercase tracking-[0.8px]`}>이번 달 실행 합계</p>
            <p className={`${FONT} font-bold text-[22px] text-[#18202a] mt-[2px]`}>{fmt(currentMonthActual)}</p>
          </div>
          <div className="h-[40px] w-[1px] bg-[#e4e5e9] mx-[8px]" />
          <div>
            <p className={`${FONT} text-[10px] font-semibold text-[#6c7b8e] uppercase tracking-[0.8px]`}>항목 수</p>
            <p className={`${FONT} font-bold text-[22px] text-[#18202a] mt-[2px]`}>{items.length}개</p>
          </div>
        </div>
      )}

      {/* 연간 월별 차트 */}
      {items.length > 0 && <FixedYearlyChart type={type} items={items} />}

      {/* 목록 테이블 */}
      <div className="bg-white rounded-[16px] border border-[rgba(226,232,240,0.8)] overflow-hidden mb-[16px]">
        <div className="bg-[#18202a] flex items-center h-[40px] gap-[8px] px-[12px] md:gap-[12px] md:px-[20px]">
          {['예정일','등록일','대분류','소분류','내역','금액',''].map((h, i) => (
            <div key={i} className={`${FONT} font-bold text-[10px] text-[#e6e8f1] tracking-[0.9px] uppercase ${
              h === ''        ? 'w-[52px] md:w-[64px] flex-shrink-0' :
              h === '예정일' ? 'w-[40px] flex-shrink-0 text-center' :
              h === '등록일' ? 'w-[62px] md:w-[72px] flex-shrink-0 text-center' :
              h === '대분류' ? 'w-[52px] md:w-[64px] flex-shrink-0' :
              h === '소분류' ? 'w-[60px] md:w-[80px] flex-shrink-0' :
              h === '금액'   ? 'w-[74px] md:w-[100px] flex-shrink-0 text-right' :
              'flex-1 min-w-0'
            }`}>{h}</div>
          ))}
        </div>

        {items.length === 0 ? (
          <div className={`${FONT} text-[13px] text-[#6c7b8e] text-center py-[24px]`}>
            등록된 {title} 항목이 없습니다
          </div>
        ) : items.map((item, i) => (
          <div key={item.id}
            className={`flex items-center h-[48px] gap-[8px] px-[12px] md:gap-[12px] md:px-[20px] ${i < items.length - 1 ? 'border-b border-[#f0f2f7]' : ''}`}>
            <div className={`w-[40px] flex-shrink-0 text-center ${FONT} text-[13px] text-[#FF786B] font-semibold`}>
              {item.day_of_month ?? '-'}
            </div>
            <div className={`w-[62px] md:w-[72px] flex-shrink-0 text-center ${FONT} text-[10px] md:text-[11px] text-[#6c7b8e]`}>
              {fmtShortDate(item.created_at)}
            </div>
            <div className={`w-[52px] md:w-[64px] flex-shrink-0 ${FONT} text-[11px] md:text-[12px] text-[#18202a] truncate`}>{item.categoryName}</div>
            <div className={`w-[60px] md:w-[80px] flex-shrink-0 ${FONT} text-[11px] md:text-[12px] text-[#18202a] truncate`}>{item.subcategoryName}</div>
            <div className={`flex-1 min-w-0 ${FONT} text-[12px] text-[#18202a] truncate`}>{item.description}</div>
            <div className={`w-[74px] md:w-[100px] flex-shrink-0 text-right ${FONT} font-bold text-[11px] md:text-[12px] text-[#18202a]`}>{fmt(item.amount)}</div>
            <div className="w-[52px] md:w-[64px] flex-shrink-0 flex items-center justify-end gap-[10px] overflow-visible">
              <button onClick={() => handleEditStart(item)} className="text-[#c0c8d4] hover:text-[#004ea7] transition-colors" title="수정">
                <Pencil size={12} />
              </button>
              <button onClick={() => handleDelete(item.id)} className="text-[#c0c8d4] hover:text-[#ff786b] transition-colors" title="해제">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 추가 폼 */}
      {(addMode || editingItemId) && (
        <div className="bg-white rounded-[16px] border border-[#5898ff] px-[20px] py-[16px]">
          <p className={`${FONT} font-bold text-[13px] text-[#18202a] mb-[14px]`}>{title} {editingItemId ? '수정' : '추가'}</p>
          <div className="flex flex-wrap gap-[10px] items-end">

            {/* 대분류 */}
            <div className="flex flex-col gap-[4px]">
              <label className={`${FONT} text-[10px] font-semibold text-[#6c7b8e] uppercase tracking-[0.6px]`}>대분류</label>
              <select value={fCatId} onChange={(e) => { setFCatId(e.target.value); setFSubId('') }} className={`${INPUT_SM} w-[120px]`}>
                <option value="">선택</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* 소분류 */}
            <div className="flex flex-col gap-[4px]">
              <label className={`${FONT} text-[10px] font-semibold text-[#6c7b8e] uppercase tracking-[0.6px]`}>소분류</label>
              <select value={fSubId} onChange={(e) => setFSubId(e.target.value)} className={`${INPUT_SM} w-[120px]`} disabled={!fCatId}>
                <option value="">선택</option>
                {filteredSubs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            {/* 내역 */}
            <div className="flex flex-col gap-[4px] flex-1 min-w-[140px]">
              <label className={`${FONT} text-[10px] font-semibold text-[#6c7b8e] uppercase tracking-[0.6px]`}>내역</label>
              <input value={fDesc} onChange={(e) => setFDesc(e.target.value)} placeholder="내역 입력" className={`${INPUT_SM} w-full`} />
            </div>

            {/* 금액 */}
            <div className="flex flex-col gap-[4px]">
              <label className={`${FONT} text-[10px] font-semibold text-[#6c7b8e] uppercase tracking-[0.6px]`}>금액</label>
              <input value={fAmount} onChange={(e) => setFAmount(e.target.value)} placeholder="0" className={`${INPUT_SM} w-[110px]`} />
            </div>

            {/* 예정일 */}
            <div className="flex flex-col gap-[4px]">
              <label className={`${FONT} text-[10px] font-semibold text-[#6c7b8e] uppercase tracking-[0.6px]`}>예정일</label>
              <select value={fDay} onChange={(e) => setFDay(e.target.value)} className={`${INPUT_SM} w-[80px]`}>
                <option value="">없음</option>
                {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}일</option>)}
              </select>
            </div>

            {/* 지출방식 (지출만) */}
            {type === 'expense' && (
              <div className="flex flex-col gap-[4px]">
                <label className={`${FONT} text-[10px] font-semibold text-[#6c7b8e] uppercase tracking-[0.6px]`}>지출방식</label>
                <select value={fPaymentId} onChange={(e) => setFPaymentId(e.target.value)} className={`${INPUT_SM} w-[120px]`}>
                  <option value="">없음</option>
                  {payments.map((p) => <option key={p.id} value={p.id}>{formatPaymentMethodLabel(p)}</option>)}
                </select>
              </div>
            )}

            {/* 저장/취소 */}
            <div className="flex gap-[8px]">
              <button onClick={handleSave}
                className={`${FONT} text-[12px] font-semibold text-white bg-[#004ea7] rounded-[8px] px-[16px] h-[34px] hover:bg-[#003d86] transition-colors`}>
                저장
              </button>
              <button onClick={closeForm}
                className={`${FONT} text-[12px] font-semibold text-[#6c7b8e] bg-[#f4f4f7] rounded-[8px] px-[16px] h-[34px] hover:bg-[#e6e8f1] transition-colors`}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// ── 패널 렌더러 + 메인 ───────────────────────────────────────
// ════════════════════════════════════════════════════════════════
function ContentPanel({ menuKey }: { menuKey: MenuKey }) {
  switch (menuKey) {
    case 'categories':    return <CategoriesPanel />
    case 'payment':       return <PaymentPanel />
    case 'region':        return <RegionPanel />
    case 'currency':      return <CurrencyPanel />
    case 'tags':          return <TagsPanel />
    case 'fixed-expense': return <FixedItemsPanel type="expense" />
    case 'fixed-income':  return <FixedItemsPanel type="income" />
  }
}

export default function ManagePage() {
  const [active, setActive] = useState<MenuKey>('categories')
  const [mobileActive, setMobileActive] = useState<MobileManageKey>('taxonomy')
  const [contentScrolled, setContentScrolled] = useState(false)

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* 상단 탭 바 */}
      <div className={`relative z-10 flex-shrink-0 bg-[#f4f4f7] px-[16px] pt-[12px] pb-[8px] md:px-[32px] md:pt-[16px] transition-shadow ${contentScrolled ? 'shadow-[0_8px_18px_rgba(24,32,42,0.08)]' : ''}`}>
        <div className="relative hidden md:flex items-center p-[4px] rounded-[9999px] w-full">
          <div aria-hidden className="absolute bg-[#e6e8f1] inset-0 pointer-events-none rounded-[9999px] shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]" />
          {MENU_ITEMS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`relative flex-1 py-[8px] rounded-[9999px] transition-all ${active === key ? 'bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]' : ''}`}
            >
              <span className={`${FONT} text-[14px] whitespace-nowrap`}
                style={{ fontWeight: active === key ? 700 : 500, color: active === key ? '#004EA7' : '#6C7B8E' }}>
                {label}
              </span>
            </button>
          ))}
        </div>

        <div className="relative flex md:hidden items-center p-[4px] rounded-[9999px] w-full">
          <div aria-hidden className="absolute bg-[#e6e8f1] inset-0 pointer-events-none rounded-[9999px] shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]" />
          {MOBILE_MENU_ITEMS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setMobileActive(key)}
              className={`relative flex-1 py-[8px] rounded-[9999px] transition-all ${mobileActive === key ? 'bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]' : ''}`}
            >
              <span
                className={`${FONT} text-[12px] whitespace-nowrap`}
                style={{ fontWeight: mobileActive === key ? 700 : 500, color: mobileActive === key ? '#004EA7' : '#6C7B8E' }}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 컨텐츠 */}
      <div
        className="flex-1 overflow-y-auto px-[16px] py-[16px] md:px-[36px] md:py-[24px]"
        onScroll={(e) => setContentScrolled(e.currentTarget.scrollTop > 0)}
      >
        <div className="hidden md:block">
          <ContentPanel menuKey={active} />
        </div>

        <div className="flex flex-col gap-[20px] md:hidden">
          {mobileActive === 'taxonomy' ? (
            <CategoriesPanel />
          ) : null}

          {mobileActive === 'settings' ? (
            <>
              <PaymentPanel />
              <MobileGroupDivider title="세부 설정" />
              <CurrencyPanel />
              <MobileGroupDivider title="지역 / 태그" />
              <RegionPanel />
              <TagsPanel />
            </>
          ) : null}

          {mobileActive === 'fixed' ? (
            <>
              <FixedItemsPanel type="expense" />
              <MobileGroupDivider title="고정 수입" />
              <FixedItemsPanel type="income" />
            </>
          ) : null}
        </div>
      </div>

      <GlobalTransactionFab />
    </div>
  )
}
