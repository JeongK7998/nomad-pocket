'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Check, X, Loader2, RotateCcw, ChevronRight } from 'lucide-react'
import { GlobalTransactionFab } from '@/app/components/layout/GlobalTransactionFab'
import {
  getCategories, createCategory, updateCategory, deleteCategory,
  getSubcategories, createSubcategory, updateSubcategory, deleteSubcategory,
  getPaymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod,
  getRegions, createRegion, deleteRegion, restoreRegion,
  getTags, createTag, deleteTag, restoreTag,
  getCurrencies, toggleCurrency, createCurrency, deleteCurrency,
  getFixedItems, createFixedItem, updateFixedItem, deactivateFixedItem,
  getTransactions,
} from '@/lib/api'
import type { Category, Subcategory, PaymentMethod, Region, Tag, Currency, FixedItem } from '@/types/database'

const FONT = "font-['Pretendard_Variable',sans-serif]"
const INPUT_SM = `border border-[#e4e5e9] rounded-[8px] px-[10px] h-[34px] ${FONT} text-[12px] text-[#18202a] outline-none focus:border-[#5898ff] transition-colors bg-white`

// ── 메뉴 ──────────────────────────────────────────────────────
type MenuKey = 'categories' | 'payment' | 'region' | 'currency' | 'tags' | 'fixed-expense' | 'fixed-income'

const MENU_ITEMS: { key: MenuKey; label: string }[] = [
  { key: 'categories',    label: '대분류 / 소분류' },
  { key: 'payment',       label: '지출방식' },
  { key: 'region',        label: '지역' },
  { key: 'currency',      label: '통화' },
  { key: 'tags',          label: '태그' },
  { key: 'fixed-expense', label: '고정지출' },
  { key: 'fixed-income',  label: '고정수입' },
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

function fmt(n: number) { return '₩' + n.toLocaleString('ko-KR') }

// ── 인라인 이름 편집 입력 ─────────────────────────────────────
function InlineInput({ value, onSave, onCancel, placeholder = '이름 입력' }: {
  value: string; onSave: (v: string) => void; onCancel: () => void; placeholder?: string
}) {
  const [v, setV] = useState(value)
  return (
    <div className="flex items-center gap-[6px]">
      <input
        autoFocus
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') onSave(v); if (e.key === 'Escape') onCancel() }}
        placeholder={placeholder}
        className={`${INPUT_SM} w-[140px]`}
      />
      <button onClick={() => onSave(v)} className="text-[#99D276] hover:opacity-70"><Check size={14} /></button>
      <button onClick={onCancel} className="text-[#c0c8d4] hover:opacity-70"><X size={14} /></button>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// ── 1. 대분류 / 소분류 패널 ──────────────────────────────────
// ════════════════════════════════════════════════════════════════
interface CatWithSubs extends Category { subs: Subcategory[] }

function CategoryCard({ cat, onRefresh }: { cat: CatWithSubs; onRefresh: () => void }) {
  const [editCatId,  setEditCatId]  = useState<string | null>(null)
  const [editSubId,  setEditSubId]  = useState<string | null>(null)
  const [addingSub,  setAddingSub]  = useState(false)

  const handleDeleteCat = async () => {
    if (!confirm(`'${cat.name}' 대분류를 삭제하시겠습니까? 하위 소분류도 모두 삭제됩니다.`)) return
    await deleteCategory(cat.id)
    onRefresh()
  }

  const handleSaveCat = async (name: string) => {
    if (name.trim()) await updateCategory(cat.id, name.trim())
    setEditCatId(null)
    onRefresh()
  }

  const handleAddSub = async (name: string) => {
    if (name.trim()) await createSubcategory(cat.id, name.trim())
    setAddingSub(false)
    onRefresh()
  }

  const handleSaveSub = async (sub: Subcategory, name: string) => {
    if (name.trim()) await updateSubcategory(sub.id, name.trim())
    setEditSubId(null)
    onRefresh()
  }

  const handleDeleteSub = async (sub: Subcategory) => {
    await deleteSubcategory(sub.id)
    onRefresh()
  }

  return (
    <div className="bg-white rounded-[16px] border border-[rgba(226,232,240,0.8)] flex flex-col overflow-hidden">
      {/* 카드 헤더 */}
      <div className="flex items-center justify-between px-[14px] py-[11px] border-b border-[#f0f2f7] gap-[8px]">
        {editCatId === cat.id ? (
          <InlineInput value={cat.name} onSave={handleSaveCat} onCancel={() => setEditCatId(null)} />
        ) : (
          <>
            <span className={`${FONT} font-bold text-[13px] text-[#18202a]`}>{cat.name}</span>
            <div className="flex items-center gap-[6px]">
              <button
                onClick={() => setAddingSub(true)}
                className="flex items-center gap-[4px] bg-[#f4f4f7] hover:bg-[#e6e8f1] rounded-[7px] px-[7px] py-[4px] transition-colors"
              >
                <Plus size={10} className="text-[#5898ff]" strokeWidth={2.5} />
                <span className={`${FONT} text-[10px] font-semibold text-[#5898ff]`}>소분류</span>
              </button>
              <button onClick={() => setEditCatId(cat.id)} className="text-[#c0c8d4] hover:text-[#5898ff] transition-colors p-[2px]"><Pencil size={12} /></button>
              <button onClick={handleDeleteCat} className="text-[#c0c8d4] hover:text-[#ff786b] transition-colors p-[2px]"><Trash2 size={12} /></button>
            </div>
          </>
        )}
      </div>

      {/* 소분류 리스트 */}
      <div className="flex flex-col px-[14px] py-[8px]">
        {cat.subs.map((sub) => (
          <div key={sub.id} className="flex items-center justify-between py-[5px] group">
            {editSubId === sub.id ? (
              <InlineInput value={sub.name} onSave={(n) => handleSaveSub(sub, n)} onCancel={() => setEditSubId(null)} />
            ) : (
              <>
                <div className="flex items-center gap-[8px]">
                  <div className="w-[3px] h-[3px] rounded-full bg-[#d0d4db] flex-shrink-0" />
                  <span className={`${FONT} text-[12px] text-[#18202a]`}>{sub.name}</span>
                </div>
                <div className="flex items-center gap-[6px] opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditSubId(sub.id)} className="text-[#c0c8d4] hover:text-[#5898ff] transition-colors"><Pencil size={11} /></button>
                  <button onClick={() => handleDeleteSub(sub)} className="text-[#c0c8d4] hover:text-[#ff786b] transition-colors"><Trash2 size={11} /></button>
                </div>
              </>
            )}
          </div>
        ))}

        {/* 소분류 추가 인라인 */}
        {addingSub && (
          <div className="pt-[5px]">
            <InlineInput value="" onSave={handleAddSub} onCancel={() => setAddingSub(false)} placeholder="소분류 이름" />
          </div>
        )}
      </div>
    </div>
  )
}

function CategorySection({ title, cats, type, onRefresh }: {
  title: string; cats: CatWithSubs[]; type: 'expense' | 'income'; onRefresh: () => void
}) {
  const [adding, setAdding] = useState(false)

  const handleAdd = async (name: string) => {
    if (name.trim()) await createCategory(name.trim(), type)
    setAdding(false)
    onRefresh()
  }

  return (
    <div className="mb-[32px]">
      <div className="flex items-center justify-between mb-[14px]">
        <h3 className={`${FONT} font-bold text-[15px] text-[#18202a]`}>{title}</h3>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-[6px] bg-[#004ea7] hover:bg-[#003d86] rounded-[8px] px-[12px] py-[6px] transition-colors"
        >
          <Plus size={12} className="text-white" />
          <span className={`${FONT} text-[11px] font-semibold text-white`}>대분류 추가</span>
        </button>
      </div>

      <div className="grid gap-[10px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        {cats.map((cat) => <CategoryCard key={cat.id} cat={cat} onRefresh={onRefresh} />)}
        {adding && (
          <div className="bg-white rounded-[16px] border border-[#5898ff] flex items-center px-[14px] py-[11px]">
            <InlineInput value="" onSave={handleAdd} onCancel={() => setAdding(false)} placeholder="대분류 이름" />
          </div>
        )}
      </div>
    </div>
  )
}

function CategoriesPanel() {
  const [incomeCats,  setIncomeCats]  = useState<CatWithSubs[]>([])
  const [expenseCats, setExpenseCats] = useState<CatWithSubs[]>([])
  const [loading,     setLoading]     = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const [cats, subs] = await Promise.all([getCategories(), getSubcategories()])
    const merge = (type: 'expense' | 'income'): CatWithSubs[] =>
      cats.filter((c) => c.type === type).map((c) => ({ ...c, subs: subs.filter((s) => s.category_id === c.id) }))
    setIncomeCats(merge('income'))
    setExpenseCats(merge('expense'))
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <Spinner />
  return (
    <div>
      <CategorySection title="수입 분류"  cats={incomeCats}  type="income"  onRefresh={load} />
      <CategorySection title="소비 분류"  cats={expenseCats} type="expense" onRefresh={load} />
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// ── 2. 지출방식 패널 ─────────────────────────────────────────
// ════════════════════════════════════════════════════════════════
const COLOR_PALETTE = ['#86AEED','#FFD979','#FF9F73','#99D276','#AEAFAF','#F9C6C6','#DFC3F7','#CADE9F']

function PaymentEditForm({ fName, setFName, fInitial, setFInitial, fColor, setFColor, onSave, onCancel }: {
  fName: string; setFName: (v: string) => void
  fInitial: string; setFInitial: (v: string) => void
  fColor: string; setFColor: (v: string) => void
  onSave: () => void; onCancel: () => void
}) {
  return (
    <div className="flex items-center gap-[12px]">
      <div className="w-[48px] h-[30px] rounded-[4px] flex items-center justify-center font-bold text-[18px] text-white flex-shrink-0" style={{ backgroundColor: fColor }}>
        {fInitial || '?'}
      </div>
      <input value={fInitial} onChange={(e) => setFInitial(e.target.value.slice(0, 1).toUpperCase())}
        placeholder="이니셜" maxLength={1} className={`w-[52px] text-center ${INPUT_SM}`} />
      <input value={fName} onChange={(e) => setFName(e.target.value)}
        placeholder="지출방식명" className={`flex-1 ${INPUT_SM}`} autoFocus />
      <div className="flex gap-[4px]">
        {COLOR_PALETTE.map((c) => (
          <button key={c} onClick={() => setFColor(c)}
            className={`w-[18px] h-[18px] rounded-full transition-all ${fColor === c ? 'ring-2 ring-offset-1 ring-[#004ea7]' : ''}`}
            style={{ backgroundColor: c }} />
        ))}
      </div>
      <button onClick={onSave}   className="text-[#99D276] hover:opacity-70"><Check size={16} /></button>
      <button onClick={onCancel} className="text-[#c0c8d4] hover:opacity-70"><X size={16} /></button>
    </div>
  )
}

function PaymentPanel() {
  const [payments, setPayments] = useState<PaymentMethod[]>([])
  const [loading,  setLoading]  = useState(true)
  const [editId,   setEditId]   = useState<string | null>(null)
  const [addMode,  setAddMode]  = useState(false)

  // 편집 폼 상태
  const [fName,    setFName]    = useState('')
  const [fInitial, setFInitial] = useState('')
  const [fColor,   setFColor]   = useState(COLOR_PALETTE[0])

  const load = useCallback(async () => {
    setLoading(true)
    setPayments(await getPaymentMethods())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const startEdit = (p: PaymentMethod) => {
    setAddMode(false)
    setEditId(p.id); setFName(p.name); setFInitial(p.initial); setFColor(p.color)
  }

  const startAdd = () => {
    setEditId(null)
    setFName(''); setFInitial(''); setFColor(COLOR_PALETTE[0])
    setAddMode(true)
  }

  const saveEdit = async () => {
    if (!fName.trim() || !fInitial.trim()) return
    await updatePaymentMethod(editId!, { name: fName, initial: fInitial, color: fColor })
    setEditId(null)
    load()
  }

  const saveAdd = async () => {
    if (!fName.trim() || !fInitial.trim()) return
    await createPaymentMethod({ name: fName, initial: fInitial, color: fColor })
    setAddMode(false)
    load()
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
      <div className="flex flex-col gap-[8px]">
        {payments.map((p) => (
          <div key={p.id} className="bg-white rounded-[16px] border border-[rgba(226,232,240,0.8)] px-[20px] py-[16px]">
            {editId === p.id ? (
              <PaymentEditForm fName={fName} setFName={setFName} fInitial={fInitial} setFInitial={setFInitial} fColor={fColor} setFColor={setFColor} onSave={saveEdit} onCancel={() => setEditId(null)} />
            ) : (
              <div className="flex items-center gap-[14px]">
                <div className="w-[48px] h-[30px] rounded-[4px] flex items-center justify-center font-bold text-[20px] text-white flex-shrink-0"
                  style={{ backgroundColor: p.color }}>
                  {p.initial}
                </div>
                <span className={`${FONT} font-semibold text-[14px] text-[#18202a] flex-1`}>{p.name}</span>
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
            <PaymentEditForm fName={fName} setFName={setFName} fInitial={fInitial} setFInitial={setFInitial} fColor={fColor} setFColor={setFColor} onSave={saveAdd} onCancel={() => setAddMode(false)} />
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
  const [categories, setCategories] = useState<Category[]>([])
  const [allSubs,    setAllSubs]    = useState<Subcategory[]>([])
  const [payments,   setPayments]   = useState<PaymentMethod[]>([])
  const [loading,    setLoading]    = useState(true)
  const [addMode,    setAddMode]    = useState(false)

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
    const [rawItems, cats, subs, pm] = await Promise.all([
      getFixedItems(type),
      getCategories(type),
      getSubcategories(),
      type === 'expense' ? getPaymentMethods() : Promise.resolve([]),
    ])
    const named: FixedItemWithNames[] = rawItems.map((item) => ({
      ...item,
      categoryName:    cats.find((c) => c.id === item.category_id)?.name    ?? '-',
      subcategoryName: subs.find((s) => s.id === item.subcategory_id)?.name ?? '-',
    }))
    setItems(named)
    setCategories(cats)
    setAllSubs(subs)
    setPayments(pm as PaymentMethod[])
    setLoading(false)
  }, [type])

  useEffect(() => { load() }, [load])

  const resetForm = () => {
    setFCatId(''); setFSubId(''); setFDesc(''); setFAmount(''); setFDay(''); setFPaymentId('')
  }

  const handleAdd = async () => {
    if (!fCatId || !fSubId || !fDesc || !fAmount) return
    await createFixedItem({
      type,
      category_id:       fCatId,
      subcategory_id:    fSubId,
      description:       fDesc,
      amount:            Number(fAmount.replace(/,/g, '')),
      currency:          'KRW',
      payment_method_id: fPaymentId || null,
      day_of_month:      fDay ? Number(fDay) : null,
      is_active:         true,
    })
    resetForm()
    setAddMode(false)
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('고정항목을 해제하시겠습니까?')) return
    await deactivateFixedItem(id)
    load()
  }

  if (loading) return <Spinner />

  const totalAmount = items.reduce((s, i) => s + i.amount, 0)

  return (
    <div>
      <SectionHeader title={title} onAdd={() => { resetForm(); setAddMode(true) }} />

      {/* 이번 달 합계 */}
      {items.length > 0 && (
        <div className="flex items-center gap-[16px] mb-[16px] bg-white rounded-[16px] border border-[rgba(226,232,240,0.8)] px-[20px] py-[14px]">
          <div>
            <p className={`${FONT} text-[10px] font-semibold text-[#6c7b8e] uppercase tracking-[0.8px]`}>이번 달 예정 합계</p>
            <p className={`${FONT} font-bold text-[22px] text-[#18202a] mt-[2px]`}>{fmt(totalAmount)}</p>
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
        <div className="bg-[#18202a] flex items-center h-[40px] gap-[12px] px-[20px]">
          {['일자','대분류','소분류','내역','금액',''].map((h, i) => (
            <div key={i} className={`${FONT} font-bold text-[10px] text-[#e6e8f1] tracking-[0.9px] uppercase ${
              h === ''        ? 'w-[56px] flex-shrink-0' :
              h === '일자'   ? 'w-[32px] flex-shrink-0 text-center' :
              h === '대분류' ? 'w-[64px] flex-shrink-0' :
              h === '소분류' ? 'w-[80px] flex-shrink-0' :
              h === '금액'   ? 'w-[100px] flex-shrink-0 text-right' :
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
            className={`flex items-center h-[48px] gap-[12px] px-[20px] ${i < items.length - 1 ? 'border-b border-[#f0f2f7]' : ''}`}>
            <div className={`w-[32px] flex-shrink-0 text-center ${FONT} text-[13px] text-[#FF786B] font-semibold`}>
              {item.day_of_month ?? '-'}
            </div>
            <div className={`w-[64px] flex-shrink-0 ${FONT} text-[12px] text-[#18202a]`}>{item.categoryName}</div>
            <div className={`w-[80px] flex-shrink-0 ${FONT} text-[12px] text-[#18202a]`}>{item.subcategoryName}</div>
            <div className={`flex-1 min-w-0 ${FONT} text-[12px] text-[#18202a] truncate`}>{item.description}</div>
            <div className={`w-[100px] flex-shrink-0 text-right ${FONT} font-bold text-[12px] text-[#18202a]`}>{fmt(item.amount)}</div>
            <div className="w-[56px] flex-shrink-0 flex items-center justify-end gap-[10px]">
              <button onClick={() => handleDelete(item.id)} className="text-[#c0c8d4] hover:text-[#ff786b] transition-colors" title="해제">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 추가 폼 */}
      {addMode && (
        <div className="bg-white rounded-[16px] border border-[#5898ff] px-[20px] py-[16px]">
          <p className={`${FONT} font-bold text-[13px] text-[#18202a] mb-[14px]`}>{title} 추가</p>
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
                  {payments.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            )}

            {/* 저장/취소 */}
            <div className="flex gap-[8px]">
              <button onClick={handleAdd}
                className={`${FONT} text-[12px] font-semibold text-white bg-[#004ea7] rounded-[8px] px-[16px] h-[34px] hover:bg-[#003d86] transition-colors`}>
                저장
              </button>
              <button onClick={() => { resetForm(); setAddMode(false) }}
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

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* 상단 탭 바 */}
      <div className="flex-shrink-0 bg-[#f4f4f7] px-[32px] pt-[16px] pb-[0]">
        <div className="relative flex items-center p-[4px] rounded-[9999px] w-full">
          <div aria-hidden className="absolute bg-[#e6e8f1] inset-0 pointer-events-none rounded-[9999px] shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]" />
          {MENU_ITEMS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`relative flex-1 py-[8px] rounded-[9999px] transition-all ${active === key ? 'bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]' : ''}`}
            >
              <span className={`${FONT} text-[12px] whitespace-nowrap`}
                style={{ fontWeight: active === key ? 700 : 500, color: active === key ? '#004EA7' : '#6C7B8E' }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="flex-1 overflow-y-auto px-[36px] py-[24px]">
        <ContentPanel menuKey={active} />
      </div>

      <GlobalTransactionFab />
    </div>
  )
}
