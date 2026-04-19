'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  ChevronRight, Database, Sliders, Info,
  Download, Upload, Trash2, Lock, Users,
  Calendar, X, Eye, EyeOff, CheckCircle2, AlertTriangle, LayoutDashboard,
  Plus, Pencil,
} from 'lucide-react'
import {
  exportAllDataAsJSON,
  exportAllDataAsExcel,
  importFromJSON,
  deleteAllData,
} from '@/lib/api/settings'
import {
  getProfiles,
  createProfile,
  updateProfile,
  updateAllProfilesPinHash,
  deleteProfile,
  type Profile,
} from '@/lib/api/users'
import {
  getCurrentUser,
  setCurrentUser,
  getAvatarColor,
  type UserSession,
} from '@/lib/userContext'

const FONT = "font-['Pretendard_Variable',sans-serif]"
const SETTINGS_KEY = 'nomad_pocket_settings'

function loadSettings() {
  if (typeof window === 'undefined') return defaultSettings()
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? { ...defaultSettings(), ...JSON.parse(raw) } : defaultSettings()
  } catch {
    return defaultSettings()
  }
}

function defaultSettings() {
  return { startDay: '1', weekStartDay: 'mon', dashboardDefaultMode: 'MONTHLY' }
}

function saveSettings(data: Record<string, unknown>) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(data))
}

// ── 공통 컴포넌트 ─────────────────────────────────────────────

const USER_COLORS = [
  '#004ea7','#5898ff','#a27cda','#f6728e','#ff786b','#fe9e59',
  '#99d276','#75cd10','#00b4d8','#2a9d8f','#e07a5f','#3d405b',
  '#e9c46a','#457b9d','#f4a261','#264653',
]

function Avatar({ name, userId, color, size = 36 }: { name: string; userId: string; color?: string | null; size?: number }) {
  const bgColor = getAvatarColor(userId, color)
  return (
    <div
      style={{ width: size, height: size, backgroundColor: bgColor, borderRadius: '50%', fontSize: size * 0.38 }}
      className="flex items-center justify-center text-white font-bold flex-shrink-0"
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function SettingRow({
  icon, label, sub, value, onClick, danger = false, disabled = false,
}: {
  icon: React.ReactNode; label: string; sub?: string; value?: string
  onClick?: () => void; danger?: boolean; disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-[16px] px-[20px] py-[16px] text-left transition-colors
        ${danger ? 'hover:bg-[#fff5f5]' : 'hover:bg-[#fafafa]'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className={`w-[36px] h-[36px] rounded-[10px] flex items-center justify-center flex-shrink-0
        ${danger ? 'bg-[#fff0ee] text-[#ff786b]' : 'bg-[#f0f4ff] text-[#5898ff]'}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`${FONT} font-semibold text-[13px] ${danger ? 'text-[#ff786b]' : 'text-[#18202a]'}`}>{label}</p>
        {sub && <p className={`${FONT} text-[11px] text-[#6c7b8e] mt-[1px]`}>{sub}</p>}
      </div>
      {value && <span className={`${FONT} text-[12px] text-[#6c7b8e] flex-shrink-0`}>{value}</span>}
      {onClick && !danger && <ChevronRight size={14} className="text-[#c0c8d4] flex-shrink-0" />}
    </button>
  )
}

function Divider() {
  return <div className="h-[1px] bg-[#f0f2f7] mx-[20px]" />
}

function SettingSection({ icon, title, children }: {
  icon: React.ReactNode; title: string; children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-[24px] shadow-[0px_8px_24px_0px_rgba(25,28,30,0.04)] border border-[rgba(226,232,240,0.6)]">
      <div className="flex items-center gap-[10px] px-[20px] py-[14px] border-b border-[#f0f2f7] rounded-t-[24px]">
        <span className="text-[#6c7b8e]">{icon}</span>
        <span className={`${FONT} font-bold text-[11px] uppercase tracking-[1.2px] text-[#6c7b8e]`}>{title}</span>
      </div>
      <div className="rounded-b-[24px] overflow-hidden">
        {children}
      </div>
    </div>
  )
}

function SelectRow({ icon, label, sub, value, onChange, options }: {
  icon: React.ReactNode; label: string; sub?: string
  value: string; onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="flex items-center gap-[16px] px-[20px] py-[16px]">
      <div className="w-[36px] h-[36px] rounded-[10px] bg-[#f0f4ff] text-[#5898ff] flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`${FONT} font-semibold text-[13px] text-[#18202a]`}>{label}</p>
        {sub && <p className={`${FONT} text-[11px] text-[#6c7b8e] mt-[1px]`}>{sub}</p>}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`border border-[#e4e5e9] rounded-[8px] px-[12px] py-[6px] ${FONT} text-[13px] text-[#18202a] outline-none focus:border-[#5898ff] bg-white flex-shrink-0`}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

// ── 모달 ────────────────────────────────────────────────────────

function ModalOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(24,32,42,0.45)' }}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  )
}

// ── 사용자 추가/수정 모달 ─────────────────────────────────────

function UserEditModal({
  mode, profile, sharedPinHash, onClose, onDone,
}: {
  mode: 'add' | 'edit'
  profile?: Profile
  sharedPinHash?: string | null
  onClose: () => void
  onDone: (p: Profile) => void
}) {
  const [name, setName] = useState(profile?.name ?? '')
  const [color, setColor] = useState<string>(profile?.color ?? USER_COLORS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSave() {
    if (!name.trim()) { setError('이름을 입력하세요'); return }

    setLoading(true)
    setError('')
    try {
      let result: Profile
      if (mode === 'add') {
        result = await createProfile(name.trim(), sharedPinHash ?? undefined, color)
      } else {
        const updates: { name?: string; color?: string } = { name: name.trim(), color }
        result = await updateProfile(profile!.id, updates)
      }
      setDone(true)
      setTimeout(() => { onDone(result); onClose() }, 800)
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장 실패')
    }
    setLoading(false)
  }

  if (done) {
    return (
      <ModalOverlay onClose={onClose}>
        <div className="bg-white rounded-[20px] shadow-xl w-[360px] p-[32px] flex flex-col items-center gap-[16px]">
          <CheckCircle2 size={40} className="text-[#99d276]" />
          <p className={`${FONT} font-bold text-[16px] text-[#18202a]`}>
            {mode === 'add' ? '사용자가 추가되었습니다' : '수정되었습니다'}
          </p>
        </div>
      </ModalOverlay>
    )
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-[20px] shadow-xl w-[380px] p-[32px] flex flex-col gap-[20px]">
        <div className="flex items-center justify-between">
          <h2 className={`${FONT} font-bold text-[16px] text-[#18202a]`}>
            {mode === 'add' ? '사용자 추가' : '사용자 수정'}
          </h2>
          <button onClick={onClose}><X size={18} className="text-[#6c7b8e]" /></button>
        </div>

        <div className="flex flex-col gap-[12px]">
          <div className="flex flex-col gap-[6px]">
            <label className={`${FONT} text-[11px] font-semibold text-[#6c7b8e] uppercase tracking-[0.8px]`}>이름</label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              placeholder="사용자 이름"
              autoFocus
              className={`${FONT} border border-[#e4e5e9] rounded-[10px] px-[14px] py-[10px] text-[14px] text-[#18202a] outline-none focus:border-[#5898ff]`}
            />
          </div>

          <div className="flex flex-col gap-[8px]">
            <label className={`${FONT} text-[11px] font-semibold text-[#6c7b8e] uppercase tracking-[0.8px]`}>색상</label>
            <div className="grid grid-cols-8 gap-[6px]">
              {USER_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-[32px] h-[32px] rounded-[8px] flex items-center justify-center transition-all
                    ${color === c ? 'ring-2 ring-offset-1 ring-[#004ea7] scale-110' : 'hover:scale-105'}`}
                >
                  {color === c && <span className="w-[10px] h-[10px] rounded-full bg-white/80" />}
                </button>
              ))}
            </div>
          </div>

          {error && <p className={`${FONT} text-[12px] text-[#ff786b]`}>{error}</p>}
        </div>

        <div className="flex gap-[8px]">
          <button onClick={onClose}
            className={`${FONT} flex-1 font-semibold text-[13px] text-[#6c7b8e] bg-[#f4f4f7] rounded-[10px] py-[10px]`}>
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className={`${FONT} flex-1 font-semibold text-[13px] text-white bg-[#004ea7] rounded-[10px] py-[10px] ${loading ? 'opacity-50' : ''}`}>
            {loading ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </ModalOverlay>
  )
}

function AppPasswordModal({
  currentHash,
  onClose,
  onDone,
}: {
  currentHash: string | null
  onClose: () => void
  onDone: () => void
}) {
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSave() {
    if (password.length < 4) {
      setError('공통 비밀번호는 4자리 이상이어야 합니다')
      return
    }
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다')
      return
    }

    setLoading(true)
    setError('')
    try {
      await updateAllProfilesPinHash(btoa(password))
      setDone(true)
      setTimeout(() => { onDone(); onClose() }, 800)
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장 실패')
    }
    setLoading(false)
  }

  if (done) {
    return (
      <ModalOverlay onClose={onClose}>
        <div className="bg-white rounded-[20px] shadow-xl w-[360px] p-[32px] flex flex-col items-center gap-[16px]">
          <CheckCircle2 size={40} className="text-[#99d276]" />
          <p className={`${FONT} font-bold text-[16px] text-[#18202a]`}>공통 비밀번호가 변경되었습니다</p>
        </div>
      </ModalOverlay>
    )
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-[20px] shadow-xl w-[380px] p-[32px] flex flex-col gap-[20px]">
        <div className="flex items-center justify-between">
          <h2 className={`${FONT} font-bold text-[16px] text-[#18202a]`}>공통 비밀번호 설정</h2>
          <button onClick={onClose}><X size={18} className="text-[#6c7b8e]" /></button>
        </div>
        <div className="rounded-[12px] bg-[#f7fbff] p-[14px]">
          <p className={`${FONT} text-[12px] leading-[1.6] text-[#6c7b8e]`}>
            이 비밀번호는 모든 사용자에게 공통으로 적용되며, 로그아웃 후 다시 입장할 때 사용됩니다.
            {currentHash ? ' 변경 시 모든 사용자에 즉시 반영됩니다.' : ''}
          </p>
        </div>
        <div className="flex flex-col gap-[12px]">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              placeholder="새 공통 비밀번호"
              className={`${FONT} w-full border border-[#e4e5e9] rounded-[10px] px-[14px] py-[10px] text-[14px] text-[#18202a] outline-none focus:border-[#5898ff] pr-[40px]`}
            />
            <button onClick={() => setShowPassword((prev) => !prev)} className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[#6c7b8e]">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={passwordConfirm}
            onChange={(e) => { setPasswordConfirm(e.target.value); setError('') }}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="비밀번호 확인"
            className={`${FONT} border border-[#e4e5e9] rounded-[10px] px-[14px] py-[10px] text-[14px] text-[#18202a] outline-none focus:border-[#5898ff]`}
          />
          {error && <p className={`${FONT} text-[12px] text-[#ff786b]`}>{error}</p>}
        </div>
        <div className="flex gap-[8px]">
          <button onClick={onClose}
            className={`${FONT} flex-1 font-semibold text-[13px] text-[#6c7b8e] bg-[#f4f4f7] rounded-[10px] py-[10px]`}>
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className={`${FONT} flex-1 font-semibold text-[13px] text-white bg-[#004ea7] rounded-[10px] py-[10px] ${loading ? 'opacity-50' : ''}`}>
            {loading ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </ModalOverlay>
  )
}

// ── 사용자 삭제 확인 모달 ─────────────────────────────────────

function DeleteUserModal({ profile, onClose, onDone }: {
  profile: Profile; onClose: () => void; onDone: () => void
}) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function handleDelete() {
    if (input !== 'DELETE') return
    setLoading(true)
    try {
      await deleteProfile(profile.id)
      setResult('success')
      setTimeout(() => { onDone(); onClose() }, 800)
    } catch (e) {
      setResult('error:' + (e instanceof Error ? e.message : '삭제 실패'))
    }
    setLoading(false)
  }

  if (result === 'success') {
    return (
      <ModalOverlay onClose={onClose}>
        <div className="bg-white rounded-[20px] shadow-xl w-[380px] p-[32px] flex flex-col items-center gap-[16px]">
          <CheckCircle2 size={40} className="text-[#99d276]" />
          <p className={`${FONT} font-bold text-[16px] text-[#18202a]`}>사용자가 삭제되었습니다</p>
        </div>
      </ModalOverlay>
    )
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-[20px] shadow-xl w-[380px] p-[32px] flex flex-col gap-[20px]">
        <div className="flex items-center justify-between">
          <h2 className={`${FONT} font-bold text-[16px] text-[#ff786b]`}>사용자 삭제</h2>
          <button onClick={onClose}><X size={18} className="text-[#6c7b8e]" /></button>
        </div>
        <div className="bg-[#fff5f5] rounded-[12px] p-[14px] flex flex-col gap-[6px]">
          <div className="flex items-center gap-[8px]">
            <AlertTriangle size={14} className="text-[#ff786b] flex-shrink-0" />
            <p className={`${FONT} font-semibold text-[12px] text-[#ff786b]`}>이 작업은 되돌릴 수 없습니다</p>
          </div>
          <p className={`${FONT} text-[12px] text-[#6c7b8e]`}>
            <strong>{profile.name}</strong>의 모든 거래내역, 예산, 카테고리 등이 영구 삭제됩니다.
          </p>
        </div>
        <div className="flex flex-col gap-[8px]">
          <label className={`${FONT} text-[11px] font-semibold text-[#6c7b8e] uppercase tracking-[0.8px]`}>
            확인을 위해 <span className="text-[#ff786b] font-bold">DELETE</span> 를 입력하세요
          </label>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="DELETE"
            className={`${FONT} border border-[#e4e5e9] rounded-[10px] px-[14px] py-[10px] text-[14px] text-[#18202a] outline-none focus:border-[#ff786b]`}
          />
          {result && result.startsWith('error:') && (
            <p className={`${FONT} text-[12px] text-[#ff786b]`}>{result.replace('error:', '')}</p>
          )}
        </div>
        <div className="flex gap-[8px]">
          <button onClick={onClose}
            className={`${FONT} flex-1 font-semibold text-[13px] text-[#6c7b8e] bg-[#f4f4f7] rounded-[10px] py-[10px]`}>
            취소
          </button>
          <button
            onClick={handleDelete}
            disabled={input !== 'DELETE' || loading}
            className={`${FONT} flex-1 font-semibold text-[13px] text-white rounded-[10px] py-[10px] transition-colors
              ${input === 'DELETE' && !loading ? 'bg-[#ff786b] hover:bg-[#e55a4e]' : 'bg-[#d8dae6] cursor-not-allowed'}`}>
            {loading ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>
    </ModalOverlay>
  )
}

// ── 전체 데이터 삭제 모달 ─────────────────────────────────────

function DeleteAllDataModal({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  async function handleDelete() {
    if (input !== 'DELETE') return
    setLoading(true)
    const res = await deleteAllData()
    setResult(res)
    setLoading(false)
  }

  if (result) {
    return (
      <ModalOverlay onClose={onClose}>
        <div className="bg-white rounded-[20px] shadow-xl w-[400px] p-[32px] flex flex-col items-center gap-[16px]">
          {result.success ? <CheckCircle2 size={40} className="text-[#99d276]" /> : <AlertTriangle size={40} className="text-[#ff786b]" />}
          <p className={`${FONT} font-bold text-[16px] text-[#18202a] text-center`}>{result.message}</p>
          <button onClick={onClose} className={`${FONT} font-semibold text-[13px] text-white bg-[#004ea7] rounded-[10px] px-[24px] py-[10px]`}>확인</button>
        </div>
      </ModalOverlay>
    )
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-[20px] shadow-xl w-[400px] p-[32px] flex flex-col gap-[20px]">
        <div className="flex items-center justify-between">
          <h2 className={`${FONT} font-bold text-[16px] text-[#ff786b]`}>전체 데이터 삭제</h2>
          <button onClick={onClose}><X size={18} className="text-[#6c7b8e]" /></button>
        </div>
        <div className="bg-[#fff5f5] rounded-[12px] p-[16px] flex flex-col gap-[8px]">
          <div className="flex items-center gap-[8px]">
            <AlertTriangle size={16} className="text-[#ff786b] flex-shrink-0" />
            <p className={`${FONT} font-semibold text-[13px] text-[#ff786b]`}>이 작업은 되돌릴 수 없습니다</p>
          </div>
          <p className={`${FONT} text-[12px] text-[#6c7b8e]`}>현재 사용자의 모든 거래 내역, 예산 목표, 카테고리 등이 영구 삭제됩니다.</p>
        </div>
        <div className="flex flex-col gap-[8px]">
          <label className={`${FONT} text-[11px] font-semibold text-[#6c7b8e] uppercase tracking-[0.8px]`}>
            확인을 위해 <span className="text-[#ff786b] font-bold">DELETE</span> 를 입력하세요
          </label>
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="DELETE"
            className={`${FONT} border border-[#e4e5e9] rounded-[10px] px-[14px] py-[10px] text-[14px] text-[#18202a] outline-none focus:border-[#ff786b]`} />
        </div>
        <div className="flex gap-[8px]">
          <button onClick={onClose} className={`${FONT} flex-1 font-semibold text-[13px] text-[#6c7b8e] bg-[#f4f4f7] rounded-[10px] py-[10px]`}>취소</button>
          <button onClick={handleDelete} disabled={input !== 'DELETE' || loading}
            className={`${FONT} flex-1 font-semibold text-[13px] text-white rounded-[10px] py-[10px] transition-colors
              ${input === 'DELETE' && !loading ? 'bg-[#ff786b] hover:bg-[#e55a4e]' : 'bg-[#d8dae6] cursor-not-allowed'}`}>
            {loading ? '삭제 중...' : '전체 삭제'}
          </button>
        </div>
      </div>
    </ModalOverlay>
  )
}

// ── 데이터 가져오기 모달 ──────────────────────────────────────

function ImportModal({ mode, onClose }: { mode: 'replace' | 'add'; onClose: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; counts?: Record<string, number> } | null>(null)
  const isReplace = mode === 'replace'

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    try {
      const text = await file.text()
      if (isReplace) await deleteAllData()
      const res = await importFromJSON(text)
      setResult(res)
    } catch {
      setResult({ success: false, message: '파일 읽기 실패' })
    }
    setLoading(false)
  }

  if (result) {
    return (
      <ModalOverlay onClose={onClose}>
        <div className="bg-white rounded-[20px] shadow-xl w-[400px] p-[32px] flex flex-col items-center gap-[16px]">
          {result.success ? <CheckCircle2 size={40} className="text-[#99d276]" /> : <AlertTriangle size={40} className="text-[#ff786b]" />}
          <p className={`${FONT} font-bold text-[16px] text-[#18202a] text-center`}>{result.message}</p>
          {result.counts && (
            <div className="w-full bg-[#f4f4f7] rounded-[10px] p-[12px] flex flex-col gap-[4px]">
              {Object.entries(result.counts).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className={`${FONT} text-[12px] text-[#6c7b8e]`}>{k}</span>
                  <span className={`${FONT} text-[12px] font-semibold text-[#18202a]`}>{v}건</span>
                </div>
              ))}
            </div>
          )}
          <button onClick={onClose} className={`${FONT} font-semibold text-[13px] text-white bg-[#004ea7] rounded-[10px] px-[24px] py-[10px]`}>확인</button>
        </div>
      </ModalOverlay>
    )
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-[20px] shadow-xl w-[400px] p-[32px] flex flex-col gap-[20px]">
        <div className="flex items-center justify-between">
          <h2 className={`${FONT} font-bold text-[16px] text-[#18202a]`}>{isReplace ? '전체 데이터 변경하기' : '데이터 추가하기'}</h2>
          <button onClick={onClose}><X size={18} className="text-[#6c7b8e]" /></button>
        </div>
        {isReplace ? (
          <div className="bg-[#fff5f5] rounded-[12px] p-[14px] flex flex-col gap-[6px]">
            <div className="flex items-center gap-[8px]">
              <AlertTriangle size={14} className="text-[#ff786b] flex-shrink-0" />
              <p className={`${FONT} font-semibold text-[12px] text-[#ff786b]`}>기존 데이터가 모두 삭제됩니다</p>
            </div>
            <p className={`${FONT} text-[12px] text-[#6c7b8e]`}>JSON 파일의 데이터로 전체를 교체합니다.</p>
          </div>
        ) : (
          <div className="bg-[#f0f4ff] rounded-[12px] p-[14px]">
            <p className={`${FONT} text-[12px] text-[#5898ff]`}>Nomad Pocket에서 내보낸 <strong>.json</strong> 파일만 가져올 수 있습니다. 기존 데이터와 병합됩니다.</p>
          </div>
        )}
        <input ref={fileRef} type="file" accept=".json" onChange={handleFile} className="hidden" />
        <button onClick={() => fileRef.current?.click()} disabled={loading}
          className={`${FONT} font-semibold text-[14px] border-2 border-dashed rounded-[12px] py-[24px] flex flex-col items-center gap-[8px] transition-colors
            ${isReplace ? 'text-[#ff786b] border-[#ff786b] hover:bg-[#fff5f5]' : 'text-[#004ea7] border-[#5898ff] hover:bg-[#f0f4ff]'}
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <Upload size={24} className={isReplace ? 'text-[#ff786b]' : 'text-[#5898ff]'} />
          {loading ? '가져오는 중...' : 'JSON 파일 선택'}
        </button>
        <button onClick={onClose} className={`${FONT} font-semibold text-[13px] text-[#6c7b8e] bg-[#f4f4f7] rounded-[10px] py-[10px]`}>취소</button>
      </div>
    </ModalOverlay>
  )
}

// ── 업데이트 내역 모달 ─────────────────────────────────────────

const CHANGELOG = [
  { version: 'v1.0.4', date: '2025.04', items: ['Budget 기능 완료 (시스템 목표 자동 생성, 라인 차트, 달성 통계)', 'Settings 기능 구현', '다중 사용자 지원'] },
  { version: 'v1.0.3', date: '2025.03', items: ['Dashboard 실제 데이터 연동 (모드별 집계)', 'Top 5 Payment 썸네일 Manage 설정 반영'] },
  { version: 'v1.0.2', date: '2025.02', items: ['Transactions YEARLY/MONTHLY/WEEKLY/DAILY/CALENDAR 모드', '고정지출 Dim 처리 및 클릭 입력', '거래 수정/삭제 기능'] },
  { version: 'v1.0.1', date: '2025.01', items: ['Manage 페이지 CRUD (대분류/소분류/지출방식/지역/태그/통화/고정항목)', 'Supabase 연동 기반 구축'] },
  { version: 'v1.0.0', date: '2024.12', items: ['초기 릴리즈', 'Dashboard + Transactions + Manage 기본 레이아웃'] },
]

function ChangelogModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-[20px] shadow-xl w-[460px] p-[32px] flex flex-col gap-[20px] max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className={`${FONT} font-bold text-[16px] text-[#18202a]`}>업데이트 내역</h2>
          <button onClick={onClose}><X size={18} className="text-[#6c7b8e]" /></button>
        </div>
        <div className="flex flex-col gap-[20px]">
          {CHANGELOG.map((entry) => (
            <div key={entry.version} className="flex flex-col gap-[8px]">
              <div className="flex items-center gap-[10px]">
                <span className={`${FONT} font-bold text-[13px] text-[#004ea7]`}>{entry.version}</span>
                <span className={`${FONT} text-[11px] text-[#6c7b8e]`}>{entry.date}</span>
              </div>
              <ul className="flex flex-col gap-[4px] pl-[4px]">
                {entry.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-[8px]">
                    <span className="w-[4px] h-[4px] rounded-full bg-[#5898ff] mt-[6px] flex-shrink-0" />
                    <span className={`${FONT} text-[12px] text-[#6c7b8e]`}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </ModalOverlay>
  )
}

// ── 토스트 알림 ────────────────────────────────────────────────

function Toast({ message, type, onDone }: { message: string; type: 'success' | 'error'; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div className={`fixed bottom-[32px] left-1/2 -translate-x-1/2 z-[100] flex items-center gap-[10px] px-[20px] py-[12px] rounded-[12px] shadow-xl
      ${type === 'success' ? 'bg-[#18202a] text-white' : 'bg-[#ff786b] text-white'}`}>
      {type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
      <span className={`${FONT} font-semibold text-[13px]`}>{message}</span>
    </div>
  )
}

// ── 메인 페이지 ─────────────────────────────────────────────

type ModalType = 'add-user' | 'edit-user' | 'delete-user' | 'delete-all' | 'import-replace' | 'import-add' | 'changelog' | 'app-password' | null

export default function SettingsPage() {
  const [hydrated, setHydrated] = useState(false)
  const [currentUser, setUser] = useState<UserSession | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [startDay, setStartDay] = useState('1')
  const [weekStartDay, setWeekStartDay] = useState('mon')
  const [dashboardDefaultMode, setDashboardDefaultMode] = useState('MONTHLY')

  const [modal, setModal] = useState<ModalType>(null)
  const [targetProfile, setTargetProfile] = useState<Profile | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [exporting, setExporting] = useState<'excel' | 'json' | null>(null)
  const sharedPinHash = profiles.find((profile) => profile.pin_hash)?.pin_hash ?? null

  const loadProfiles = useCallback(async () => {
    try {
      const ps = await getProfiles()
      setProfiles(ps)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    const s = loadSettings()
    setStartDay(s.startDay ?? '1')
    setWeekStartDay(s.weekStartDay ?? 'mon')
    setDashboardDefaultMode(s.dashboardDefaultMode ?? 'MONTHLY')
    setUser(getCurrentUser())
    setHydrated(true)
    loadProfiles()
  }, [loadProfiles])

  useEffect(() => {
    if (!hydrated) return
    saveSettings({ startDay, weekStartDay, dashboardDefaultMode })
  }, [startDay, weekStartDay, dashboardDefaultMode, hydrated])

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type })
  }

  function switchToUser(profile: Profile) {
    const session: UserSession = { id: profile.id, name: profile.name, color: profile.color ?? undefined }
    setCurrentUser(session)
    setUser(session)
    showToast(`${profile.name}으로 전환되었습니다`)
    // 페이지 데이터 새로고침
    window.location.href = '/'
  }

  async function handleExportJSON() {
    if (exporting) return
    setExporting('json')
    try {
      const json = await exportAllDataAsJSON()
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `nomad_pocket_${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      showToast('JSON 파일이 저장되었습니다')
    } catch {
      showToast('내보내기 실패', 'error')
    }
    setExporting(null)
  }

  async function handleExportExcel() {
    if (exporting) return
    setExporting('excel')
    try {
      const blob = await exportAllDataAsExcel()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `nomad_pocket_${new Date().toISOString().slice(0, 10)}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      showToast('Excel 파일이 저장되었습니다')
    } catch {
      showToast('내보내기 실패', 'error')
    }
    setExporting(null)
  }

  const DASHBOARD_MODE_OPTIONS = [
    { value: 'YEARLY',  label: 'YEARLY' },
    { value: 'MONTHLY', label: 'MONTHLY' },
    { value: 'WEEKLY',  label: 'WEEKLY' },
    { value: 'REGION',  label: 'REGION' },
    { value: 'TAGGING', label: 'TAGGING' },
  ]
  const WEEK_START_OPTIONS  = [{ value: 'sun', label: '일요일' }, { value: 'mon', label: '월요일' }]
  const MONTH_START_OPTIONS = Array.from({ length: 28 }, (_, i) => ({ value: String(i + 1), label: `${i + 1}일` }))

  return (
    <div className="h-full overflow-y-auto px-[32px] py-[24px] flex flex-col gap-[24px]">

      <div>
        <h1 className={`${FONT} font-bold text-[28px] text-[#18202a] uppercase tracking-[-0.5px]`}>Settings</h1>
        <p className={`${FONT} text-[13px] text-[#6c7b8e] mt-[4px]`}>앱 환경 및 데이터를 관리하세요</p>
      </div>

      {/* ── 사용자 관리 ── */}
      <SettingSection icon={<Users size={14} />} title="사용자 관리">
        {profiles.map((profile, idx) => {
          const isCurrent = profile.id === currentUser?.id
          return (
            <div key={profile.id}>
              {idx > 0 && <Divider />}
              <div className="flex items-center gap-[14px] px-[20px] py-[14px]">
                <Avatar name={profile.name} userId={profile.id} color={profile.color} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-[8px]">
                    <p className={`${FONT} font-semibold text-[13px] text-[#18202a]`}>{profile.name}</p>
                    {isCurrent && (
                      <span className={`${FONT} text-[10px] font-semibold bg-[#004ea7] text-white px-[6px] py-[1px] rounded-[4px] uppercase tracking-[0.5px]`}>
                        현재
                      </span>
                    )}
                  </div>
                  <p className={`${FONT} text-[11px] text-[#6c7b8e] mt-[1px]`}>
                    작성자 표시와 사용자 전환에 사용
                  </p>
                </div>
                <div className="flex items-center gap-[6px]">
                  {!isCurrent && (
                    <button
                      onClick={() => switchToUser(profile)}
                      title="이 사용자로 전환"
                      className="flex items-center gap-[4px] px-[10px] py-[5px] rounded-[8px] bg-[#f0f4ff] text-[#004ea7] hover:bg-[#dde8ff] transition-colors"
                    >
                      <Users size={12} />
                      <span className={`${FONT} text-[11px] font-semibold`}>전환</span>
                    </button>
                  )}
                  <button
                    onClick={() => { setTargetProfile(profile); setModal('edit-user') }}
                    title="수정"
                    className="w-[30px] h-[30px] rounded-[8px] bg-[#f4f4f7] flex items-center justify-center text-[#6c7b8e] hover:text-[#18202a] hover:bg-[#e6e8f1] transition-colors"
                  >
                    <Pencil size={13} />
                  </button>
                  {profiles.length > 1 && !isCurrent && (
                    <button
                      onClick={() => { setTargetProfile(profile); setModal('delete-user') }}
                      title="삭제"
                      className="w-[30px] h-[30px] rounded-[8px] bg-[#fff0ee] flex items-center justify-center text-[#ff786b] hover:bg-[#ffe0dc] transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* 사용자 추가 버튼 */}
        {profiles.length > 0 && <Divider />}
        <button
          onClick={() => setModal('add-user')}
          className="w-full flex items-center gap-[14px] px-[20px] py-[14px] hover:bg-[#fafafa] transition-colors"
        >
          <div className="w-[40px] h-[40px] rounded-full border-2 border-dashed border-[#d8dae6] flex items-center justify-center flex-shrink-0">
            <Plus size={16} className="text-[#6c7b8e]" />
          </div>
          <p className={`${FONT} font-semibold text-[13px] text-[#6c7b8e]`}>사용자 추가</p>
        </button>
      </SettingSection>

      <SettingSection icon={<Lock size={14} />} title="앱 잠금">
        <SettingRow
          icon={<Lock size={16} />}
          label={sharedPinHash ? '공통 비밀번호 변경' : '공통 비밀번호 설정'}
          sub="로그아웃 후 모든 사용자가 같은 비밀번호로 다시 입장합니다"
          onClick={() => setModal('app-password')}
        />
      </SettingSection>

      {/* ── 데이터 ── */}
      <SettingSection icon={<Database size={14} />} title="데이터">
        <SettingRow
          icon={<Download size={16} />}
          label={exporting === 'excel' ? 'Excel 내보내는 중...' : 'Excel로 내보내기'}
          sub="모든 거래 내역을 .xlsx 파일로 저장"
          onClick={handleExportExcel}
          disabled={exporting !== null}
        />
        <Divider />
        <SettingRow
          icon={<Download size={16} />}
          label={exporting === 'json' ? 'JSON 내보내는 중...' : 'JSON으로 내보내기'}
          sub="앱 전체 데이터를 .json 파일로 저장"
          onClick={handleExportJSON}
          disabled={exporting !== null}
        />
        <Divider />
        <SettingRow
          icon={<Upload size={16} />}
          label="전체 데이터 변경하기"
          sub="JSON 파일로 전체 교체 (기존 데이터 삭제 후 덮어씀)"
          onClick={() => setModal('import-replace')}
          danger
        />
        <Divider />
        <SettingRow
          icon={<Upload size={16} />}
          label="데이터 추가하기"
          sub="JSON 파일을 기존 데이터에 병합"
          onClick={() => setModal('import-add')}
        />
        <Divider />
        <SettingRow
          icon={<Trash2 size={16} />}
          label="전체 데이터 삭제"
          sub="현재 사용자의 모든 거래 내역과 설정이 삭제됩니다"
          onClick={() => setModal('delete-all')}
          danger
        />
      </SettingSection>

      {/* ── 환경설정 ── */}
      <SettingSection icon={<Sliders size={14} />} title="환경설정">
        <SelectRow
          icon={<Calendar size={16} />}
          label="월 시작일"
          sub="한 달의 시작일 설정"
          value={startDay}
          onChange={setStartDay}
          options={MONTH_START_OPTIONS}
        />
        <Divider />
        <SelectRow
          icon={<Calendar size={16} />}
          label="주 시작일"
          sub="한 주의 시작 요일 설정"
          value={weekStartDay}
          onChange={setWeekStartDay}
          options={WEEK_START_OPTIONS}
        />
        <Divider />
        <SelectRow
          icon={<LayoutDashboard size={16} />}
          label="대시보드 기본 모드"
          sub="앱 시작 시 대시보드의 기본 보기 모드"
          value={dashboardDefaultMode}
          onChange={setDashboardDefaultMode}
          options={DASHBOARD_MODE_OPTIONS}
        />
      </SettingSection>

      {/* ── 앱 정보 ── */}
      <SettingSection icon={<Info size={14} />} title="앱 정보">
        <SettingRow
          icon={<Info size={16} />}
          label="앱 업데이트 내역"
          sub="최신 변경사항 확인"
          onClick={() => setModal('changelog')}
        />
        <Divider />
        <div className="flex items-center gap-[16px] px-[20px] py-[16px]">
          <div className="w-[36px] h-[36px] rounded-[10px] bg-[#f0f4ff] text-[#5898ff] flex items-center justify-center flex-shrink-0">
            <Info size={16} />
          </div>
          <div className="flex-1">
            <p className={`${FONT} font-semibold text-[13px] text-[#18202a]`}>버전 정보</p>
            <p className={`${FONT} text-[11px] text-[#6c7b8e] mt-[1px]`}>Nomad Pocket</p>
          </div>
          <span className={`${FONT} text-[12px] text-[#6c7b8e]`}>v1.0.4</span>
        </div>
      </SettingSection>

      <div className="pb-[16px]" />

      {/* 모달 */}
      {modal === 'add-user' && (
        <UserEditModal
          mode="add"
          sharedPinHash={sharedPinHash}
          onClose={() => setModal(null)}
          onDone={() => { loadProfiles(); showToast('사용자가 추가되었습니다') }}
        />
      )}
      {modal === 'edit-user' && targetProfile && (
        <UserEditModal mode="edit" profile={targetProfile} onClose={() => setModal(null)}
          onDone={(updated) => {
            loadProfiles()
            if (updated.id === currentUser?.id) {
              const session: UserSession = { id: updated.id, name: updated.name, color: updated.color ?? undefined }
              setCurrentUser(session)
              setUser(session)
            }
            showToast('수정되었습니다')
          }}
        />
      )}
      {modal === 'delete-user' && targetProfile && (
        <DeleteUserModal profile={targetProfile} onClose={() => setModal(null)} onDone={() => { loadProfiles(); showToast('사용자가 삭제되었습니다') }} />
      )}
      {modal === 'delete-all' && <DeleteAllDataModal onClose={() => setModal(null)} />}
      {modal === 'import-replace' && <ImportModal mode="replace" onClose={() => setModal(null)} />}
      {modal === 'import-add' && <ImportModal mode="add" onClose={() => setModal(null)} />}
      {modal === 'changelog' && <ChangelogModal onClose={() => setModal(null)} />}
      {modal === 'app-password' && (
        <AppPasswordModal
          currentHash={sharedPinHash}
          onClose={() => setModal(null)}
          onDone={() => {
            loadProfiles()
            showToast('공통 비밀번호가 저장되었습니다')
          }}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  )
}
