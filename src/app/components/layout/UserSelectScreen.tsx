'use client'

import { useState, useEffect } from 'react'
import { Plus, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { getProfiles, createProfile, migrateExistingData, type Profile } from '@/lib/api/users'
import { setCurrentUser, getAvatarColor, type UserSession } from '@/lib/userContext'

const USER_COLORS = [
  '#004ea7','#5898ff','#a27cda','#f6728e','#ff786b','#fe9e59',
  '#99d276','#75cd10','#00b4d8','#2a9d8f','#e07a5f','#3d405b',
  '#e9c46a','#457b9d','#f4a261','#264653',
]

const FONT = "font-['Pretendard_Variable',sans-serif]"

interface Props {
  onSelect: (user: UserSession) => void
}

function Avatar({ name, userId, color, size = 48 }: { name: string; userId: string; color?: string | null; size?: number }) {
  const bgColor = getAvatarColor(userId, color)
  return (
    <div
      style={{ width: size, height: size, backgroundColor: bgColor, borderRadius: '50%', fontSize: size * 0.4 }}
      className="flex items-center justify-center text-white font-bold flex-shrink-0"
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

// PIN 입력 화면
function PinVerify({ profile, onSuccess, onCancel }: {
  profile: Profile; onSuccess: () => void; onCancel: () => void
}) {
  const [pin, setPin] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')

  function verify() {
    if (btoa(pin) === profile.pin_hash) {
      onSuccess()
    } else {
      setError('비밀번호가 올바르지 않습니다')
      setPin('')
    }
  }

  return (
    <div className="flex flex-col items-center gap-[24px]">
      <Avatar name={profile.name} userId={profile.id} color={profile.color} size={64} />
      <div className="text-center">
        <p className={`${FONT} font-bold text-[20px] text-[#18202a]`}>{profile.name}</p>
        <p className={`${FONT} text-[13px] text-[#6c7b8e] mt-[4px]`}>비밀번호를 입력하세요</p>
      </div>
      <div className="w-full max-w-[280px] flex flex-col gap-[10px]">
        <div className="relative">
          <input
            type={show ? 'text' : 'password'}
            value={pin}
            onChange={e => { setPin(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && verify()}
            placeholder="비밀번호"
            autoFocus
            className={`${FONT} w-full border rounded-[12px] px-[16px] py-[12px] text-[15px] text-[#18202a] outline-none pr-[44px]
              ${error ? 'border-[#ff786b] focus:border-[#ff786b]' : 'border-[#e4e5e9] focus:border-[#5898ff]'}`}
          />
          <button onClick={() => setShow(v => !v)} className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[#6c7b8e]">
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {error && <p className={`${FONT} text-[12px] text-[#ff786b]`}>{error}</p>}
        <button
          onClick={verify}
          className={`${FONT} font-semibold text-[14px] text-white bg-[#004ea7] rounded-[12px] py-[12px]`}>
          확인
        </button>
        <button
          onClick={onCancel}
          className={`${FONT} font-semibold text-[13px] text-[#6c7b8e] bg-[#f4f4f7] rounded-[12px] py-[10px]`}>
          뒤로
        </button>
      </div>
    </div>
  )
}

// 새 사용자 추가 폼
function AddUserForm({ onDone, onCancel, isFirst }: {
  onDone: (profile: Profile) => void; onCancel?: () => void; isFirst: boolean
}) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(USER_COLORS[0])
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [usePin, setUsePin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate() {
    if (!name.trim()) { setError('이름을 입력하세요'); return }
    if (usePin && pin.length < 4) { setError('비밀번호는 4자리 이상이어야 합니다'); return }
    if (usePin && pin !== pinConfirm) { setError('비밀번호가 일치하지 않습니다'); return }

    setLoading(true)
    setError('')
    try {
      const pinHash = usePin ? btoa(pin) : undefined
      const profile = await createProfile(name.trim(), pinHash, color)
      if (isFirst) {
        await migrateExistingData(profile.id)
      }
      onDone(profile)
    } catch (e) {
      const msg = e instanceof Error ? e.message : (e as { message?: string })?.message ?? JSON.stringify(e)
      setError('사용자 생성 실패: ' + msg)
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-[20px] w-full max-w-[320px]">
      <div className="text-center">
        <p className={`${FONT} font-bold text-[20px] text-[#18202a]`}>
          {isFirst ? '첫 번째 사용자를 만드세요' : '새 사용자 추가'}
        </p>
        {isFirst && <p className={`${FONT} text-[13px] text-[#6c7b8e] mt-[4px]`}>앱을 사용할 사용자 프로필을 생성합니다</p>}
      </div>

      <div className="flex flex-col gap-[12px]">
        <div className="flex flex-col gap-[6px]">
          <label className={`${FONT} text-[11px] font-semibold text-[#6c7b8e] uppercase tracking-[0.8px]`}>이름</label>
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && !usePin && handleCreate()}
            placeholder="사용자 이름"
            autoFocus
            className={`${FONT} border border-[#e4e5e9] rounded-[12px] px-[16px] py-[12px] text-[15px] text-[#18202a] outline-none focus:border-[#5898ff]`}
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

        <label className="flex items-center gap-[10px] cursor-pointer">
          <div
            onClick={() => setUsePin(v => !v)}
            className={`w-[36px] h-[20px] rounded-full transition-colors duration-200 flex-shrink-0 relative
              ${usePin ? 'bg-[#004ea7]' : 'bg-[#d8dae6]'}`}
          >
            <span className={`absolute top-[2px] w-[16px] h-[16px] bg-white rounded-full shadow transition-transform duration-200
              ${usePin ? 'left-[18px]' : 'left-[2px]'}`} />
          </div>
          <span className={`${FONT} text-[13px] text-[#18202a]`}>비밀번호 설정</span>
        </label>

        {usePin && (
          <>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={e => { setPin(e.target.value); setError('') }}
                placeholder="비밀번호 (4자리 이상)"
                className={`${FONT} w-full border border-[#e4e5e9] rounded-[12px] px-[16px] py-[12px] text-[15px] text-[#18202a] outline-none focus:border-[#5898ff] pr-[44px]`}
              />
              <button onClick={() => setShowPin(v => !v)} className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[#6c7b8e]">
                {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <input
              type={showPin ? 'text' : 'password'}
              value={pinConfirm}
              onChange={e => { setPinConfirm(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="비밀번호 확인"
              className={`${FONT} border border-[#e4e5e9] rounded-[12px] px-[16px] py-[12px] text-[15px] text-[#18202a] outline-none focus:border-[#5898ff]`}
            />
          </>
        )}

        {error && <p className={`${FONT} text-[12px] text-[#ff786b]`}>{error}</p>}
      </div>

      <div className="flex gap-[8px]">
        {onCancel && (
          <button onClick={onCancel}
            className={`${FONT} flex-1 font-semibold text-[13px] text-[#6c7b8e] bg-[#f4f4f7] rounded-[12px] py-[12px]`}>
            취소
          </button>
        )}
        <button
          onClick={handleCreate}
          disabled={loading}
          className={`${FONT} flex-1 font-semibold text-[14px] text-white bg-[#004ea7] rounded-[12px] py-[12px]
            ${loading ? 'opacity-50' : ''}`}>
          {loading ? '생성 중...' : '만들기'}
        </button>
      </div>
    </div>
  )
}

export function UserSelectScreen({ onSelect }: Props) {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'list' | 'pin' | 'add'>('list')
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)

  useEffect(() => {
    getProfiles().then(p => { setProfiles(p); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  function selectUser(profile: Profile) {
    const session: UserSession = { id: profile.id, name: profile.name, color: profile.color ?? undefined }
    setCurrentUser(session)
    onSelect(session)
  }

  function handleProfileClick(profile: Profile) {
    if (profile.pin_hash) {
      setSelectedProfile(profile)
      setView('pin')
    } else {
      selectUser(profile)
    }
  }

  function handlePinSuccess() {
    if (selectedProfile) selectUser(selectedProfile)
  }

  function handleNewUser(profile: Profile) {
    selectUser(profile)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#f4f4f7] flex items-center justify-center">
        <div className="w-[40px] h-[40px] border-4 border-[#004ea7] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-[#f4f4f7] flex flex-col items-center justify-center p-[32px]">

      {/* 로고 */}
      <div className="absolute top-[32px] left-1/2 -translate-x-1/2 text-center">
        <p className={`${FONT} font-extrabold text-[22px] text-[#004ea7] tracking-[-1px]`}>NOMAD_POCKET</p>
        <p className={`${FONT} text-[11px] text-[#6c7b8e] tracking-[1px] uppercase mt-[2px]`}>Financial Precision</p>
      </div>

      <div className="w-full max-w-[400px] flex flex-col items-center gap-[32px]">

        {/* 빈 상태 or 사용자 추가 폼 */}
        {(profiles.length === 0 || view === 'add') && (
          <AddUserForm
            isFirst={profiles.length === 0}
            onDone={handleNewUser}
            onCancel={profiles.length > 0 ? () => setView('list') : undefined}
          />
        )}

        {/* PIN 입력 */}
        {view === 'pin' && selectedProfile && (
          <PinVerify
            profile={selectedProfile}
            onSuccess={handlePinSuccess}
            onCancel={() => setView('list')}
          />
        )}

        {/* 사용자 목록 */}
        {view === 'list' && profiles.length > 0 && (
          <div className="w-full flex flex-col gap-[16px]">
            <p className={`${FONT} font-bold text-[22px] text-[#18202a] text-center`}>사용자 선택</p>

            <div className="flex flex-col gap-[8px]">
              {profiles.map(profile => (
                <button
                  key={profile.id}
                  onClick={() => handleProfileClick(profile)}
                  className="w-full flex items-center gap-[16px] bg-white rounded-[16px] px-[20px] py-[16px] shadow-[0px_4px_12px_0px_rgba(25,28,30,0.06)] hover:shadow-[0px_4px_16px_0px_rgba(0,78,167,0.12)] transition-all text-left"
                >
                  <Avatar name={profile.name} userId={profile.id} color={profile.color} size={48} />
                  <div className="flex-1">
                    <p className={`${FONT} font-semibold text-[16px] text-[#18202a]`}>{profile.name}</p>
                    <p className={`${FONT} text-[12px] text-[#6c7b8e] mt-[2px]`}>
                      {profile.pin_hash ? '비밀번호 보호됨' : '비밀번호 없음'}
                    </p>
                  </div>
                  <CheckCircle2 size={20} className="text-[#d8dae6]" />
                </button>
              ))}
            </div>

            <button
              onClick={() => setView('add')}
              className={`${FONT} font-semibold text-[14px] text-[#004ea7] border-2 border-dashed border-[#5898ff] rounded-[16px] py-[14px] flex items-center justify-center gap-[8px] hover:bg-[#f0f4ff] transition-colors`}
            >
              <Plus size={18} />
              사용자 추가
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
