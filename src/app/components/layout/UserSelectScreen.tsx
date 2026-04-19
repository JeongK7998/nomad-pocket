'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Eye, EyeOff, Plus, X } from 'lucide-react'
import { createProfile, getProfiles, migrateExistingData, type Profile } from '@/lib/api/users'
import { getAvatarColor, markAuthenticatedAccess, setCurrentUser, type UserSession } from '@/lib/userContext'

const USER_COLORS = [
  '#004ea7','#5898ff','#a27cda','#f6728e','#ff786b','#fe9e59',
  '#99d276','#75cd10','#00b4d8','#2a9d8f','#e07a5f','#3d405b',
  '#e9c46a','#457b9d','#f4a261','#264653',
]

const FONT = "font-['Pretendard_Variable',sans-serif]"

interface Props {
  onSelect: (user: UserSession) => void
}

function getSharedPinHash(profiles: Profile[]): string | null {
  return profiles.find((profile) => profile.pin_hash)?.pin_hash ?? null
}

function Avatar({
  name,
  userId,
  color,
  size = 48,
}: {
  name: string
  userId: string
  color?: string | null
  size?: number
}) {
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

function AddUserModal({
  isFirst,
  sharedPinHash,
  onClose,
  onDone,
}: {
  isFirst: boolean
  sharedPinHash: string | null
  onClose: () => void
  onDone: (profile: Profile) => void
}) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(USER_COLORS[0])
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate() {
    if (!name.trim()) {
      setError('이름을 입력하세요')
      return
    }

    if (isFirst) {
      if (password.length < 4) {
        setError('공통 비밀번호는 4자리 이상이어야 합니다')
        return
      }
      if (password !== passwordConfirm) {
        setError('비밀번호가 일치하지 않습니다')
        return
      }
    }

    setLoading(true)
    setError('')

    try {
      const pinHash = isFirst ? btoa(password) : sharedPinHash ?? null
      const profile = await createProfile(name.trim(), pinHash ?? undefined, color)
      if (isFirst) {
        await migrateExistingData(profile.id)
      }
      onDone(profile)
    } catch (e) {
      const message = e instanceof Error ? e.message : '사용자 생성 실패'
      setError(message)
    }

    setLoading(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(24,32,42,0.45)] p-[24px]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] rounded-[24px] bg-white p-[28px] shadow-[0px_24px_60px_0px_rgba(25,28,30,0.18)]"
      >
        <div className="mb-[20px] flex items-center justify-between">
          <div>
            <h2 className={`${FONT} text-[20px] font-bold text-[#18202a]`}>
              {isFirst ? '첫 사용자 만들기' : '사용자 추가'}
            </h2>
            <p className={`${FONT} mt-[4px] text-[12px] text-[#6c7b8e]`}>
              {isFirst ? '이름과 앱 공통 비밀번호를 설정합니다' : '공유 데이터에 함께 참여할 사용자를 추가합니다'}
            </p>
          </div>
          <button onClick={onClose} className="rounded-[10px] p-[6px] text-[#6c7b8e] hover:bg-[#f4f4f7]">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-[14px]">
          <div className="flex flex-col gap-[6px]">
            <label className={`${FONT} text-[11px] font-semibold uppercase tracking-[0.8px] text-[#6c7b8e]`}>사용자 이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              placeholder="이름"
              autoFocus
              className={`${FONT} rounded-[12px] border border-[#e4e5e9] px-[16px] py-[12px] text-[15px] text-[#18202a] outline-none focus:border-[#5898ff]`}
            />
          </div>

          <div className="flex flex-col gap-[8px]">
            <label className={`${FONT} text-[11px] font-semibold uppercase tracking-[0.8px] text-[#6c7b8e]`}>사용자 색상</label>
            <div className="grid grid-cols-8 gap-[8px]">
              {USER_COLORS.map((value) => (
                <button
                  key={value}
                  onClick={() => setColor(value)}
                  style={{ backgroundColor: value }}
                  className={`flex h-[34px] w-[34px] items-center justify-center rounded-[9px] transition-all ${color === value ? 'ring-2 ring-[#004ea7] ring-offset-2' : 'hover:scale-105'}`}
                >
                  {color === value && <span className="h-[10px] w-[10px] rounded-full bg-white/90" />}
                </button>
              ))}
            </div>
          </div>

          {isFirst && (
            <>
              <div className="flex flex-col gap-[6px]">
                <label className={`${FONT} text-[11px] font-semibold uppercase tracking-[0.8px] text-[#6c7b8e]`}>앱 공통 비밀번호</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError('') }}
                    placeholder="4자리 이상"
                    className={`${FONT} w-full rounded-[12px] border border-[#e4e5e9] px-[16px] py-[12px] pr-[44px] text-[15px] text-[#18202a] outline-none focus:border-[#5898ff]`}
                  />
                  <button
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[#6c7b8e]"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-[6px]">
                <label className={`${FONT} text-[11px] font-semibold uppercase tracking-[0.8px] text-[#6c7b8e]`}>비밀번호 확인</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordConfirm}
                  onChange={(e) => { setPasswordConfirm(e.target.value); setError('') }}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  placeholder="다시 입력"
                  className={`${FONT} rounded-[12px] border border-[#e4e5e9] px-[16px] py-[12px] text-[15px] text-[#18202a] outline-none focus:border-[#5898ff]`}
                />
              </div>
            </>
          )}

          {error && <p className={`${FONT} text-[12px] text-[#ff786b]`}>{error}</p>}
        </div>

        <div className="mt-[22px] flex gap-[8px]">
          <button
            onClick={onClose}
            className={`${FONT} flex-1 rounded-[12px] bg-[#f4f4f7] py-[12px] text-[14px] font-semibold text-[#6c7b8e]`}
          >
            취소
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className={`${FONT} flex-1 rounded-[12px] bg-[#004ea7] py-[12px] text-[14px] font-semibold text-white ${loading ? 'opacity-50' : ''}`}
          >
            {loading ? '생성 중...' : '완료'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function UserSelectScreen({ onSelect }: Props) {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    getProfiles()
      .then((items) => {
        setProfiles(items)
        setSelectedProfileId(items[0]?.id ?? null)
      })
      .finally(() => setLoading(false))
  }, [])

  const sharedPinHash = useMemo(() => getSharedPinHash(profiles), [profiles])
  const selectedProfile = profiles.find((profile) => profile.id === selectedProfileId) ?? null

  function enterWithProfile(profile: Profile) {
    const session: UserSession = { id: profile.id, name: profile.name, color: profile.color ?? undefined }
    setCurrentUser(session)
    markAuthenticatedAccess()
    onSelect(session)
  }

  function handleLogin() {
    if (!selectedProfile) {
      setError('입장할 사용자를 선택하세요')
      return
    }
    if (!sharedPinHash) {
      setError('공통 비밀번호가 아직 설정되지 않았습니다')
      return
    }
    if (btoa(password) !== sharedPinHash) {
      setError('비밀번호가 올바르지 않습니다')
      return
    }
    enterWithProfile(selectedProfile)
  }

  function handleNewUser(profile: Profile) {
    setProfiles((prev) => [...prev, profile])
    setSelectedProfileId(profile.id)
    setShowAddModal(false)
    setPassword('')
    setError('')
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#f4f4f7]">
        <div className="h-[40px] w-[40px] animate-spin rounded-full border-4 border-[#004ea7] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-[#f4f4f7] px-[24px] py-[32px]">
      <div className="absolute left-1/2 top-[32px] -translate-x-1/2 text-center">
        <p className={`${FONT} text-[22px] font-extrabold tracking-[-1px] text-[#004ea7]`}>NOMAD_POCKET</p>
        <p className={`${FONT} mt-[2px] text-[11px] uppercase tracking-[1px] text-[#6c7b8e]`}>Financial Precision</p>
      </div>

      <div className="mx-auto flex h-full max-w-[920px] items-center justify-center">
        <div className="grid w-full gap-[20px] md:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] bg-white p-[24px] shadow-[0px_16px_50px_0px_rgba(25,28,30,0.08)]">
            <div className="mb-[18px] flex items-start justify-between gap-[12px]">
              <div>
                <h1 className={`${FONT} text-[24px] font-bold text-[#18202a]`}>사용자 선택</h1>
                <p className={`${FONT} mt-[4px] text-[13px] text-[#6c7b8e]`}>
                  {profiles.length > 0 ? '같은 데이터를 함께 관리할 사용자를 선택하세요' : '먼저 사용할 사용자를 추가해 주세요'}
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className={`${FONT} flex items-center gap-[6px] rounded-[14px] border border-[#d8e9fd] px-[14px] py-[10px] text-[13px] font-semibold text-[#004ea7] hover:bg-[#f0f4ff]`}
              >
                <Plus size={16} />
                사용자 추가
              </button>
            </div>

            {profiles.length === 0 ? (
              <div className="flex min-h-[280px] items-center justify-center rounded-[20px] border-2 border-dashed border-[#d8dae6] bg-[#fafbfd] p-[24px] text-center">
                <div>
                  <p className={`${FONT} text-[16px] font-semibold text-[#18202a]`}>아직 생성된 사용자가 없어요</p>
                  <p className={`${FONT} mt-[6px] text-[13px] text-[#6c7b8e]`}>
                    첫 사용자를 만들고 공통 비밀번호를 설정한 뒤 입장할 수 있습니다.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-[10px]">
                {profiles.map((profile) => {
                  const selected = profile.id === selectedProfileId
                  return (
                    <button
                      key={profile.id}
                      onClick={() => { setSelectedProfileId(profile.id); setError('') }}
                      className={`flex w-full items-center gap-[16px] rounded-[18px] border px-[18px] py-[16px] text-left transition-all ${selected ? 'border-[#5898ff] bg-[#f7fbff] shadow-[0px_8px_24px_0px_rgba(0,78,167,0.10)]' : 'border-transparent bg-[#fbfbfc] hover:border-[#d8e9fd]'}`}
                    >
                      <Avatar name={profile.name} userId={profile.id} color={profile.color} size={50} />
                      <div className="min-w-0 flex-1">
                        <p className={`${FONT} truncate text-[16px] font-semibold text-[#18202a]`}>{profile.name}</p>
                        <p className={`${FONT} mt-[2px] text-[12px] text-[#6c7b8e]`}>작성자 표시와 사용자 전환에 사용됩니다</p>
                      </div>
                      <CheckCircle2 size={20} className={selected ? 'text-[#004ea7]' : 'text-[#d8dae6]'} />
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="rounded-[28px] bg-[#18202a] p-[24px] shadow-[0px_16px_50px_0px_rgba(25,28,30,0.12)]">
            <div className="mb-[24px]">
              <p className={`${FONT} text-[12px] font-semibold uppercase tracking-[1.2px] text-[#5898ff]`}>Easy Access</p>
              <h2 className={`${FONT} mt-[8px] text-[24px] font-bold text-white`}>공통 비밀번호로 입장</h2>
              <p className={`${FONT} mt-[8px] text-[13px] leading-[1.6] text-[#a9b5c6]`}>
                로그인 후에는 로그아웃하기 전까지 이 기기에서 다시 비밀번호를 묻지 않습니다.
              </p>
            </div>

            <div className="mb-[16px] rounded-[20px] border border-white/10 bg-white/5 p-[16px]">
              <p className={`${FONT} text-[11px] font-semibold uppercase tracking-[0.8px] text-[#8ea1ba]`}>선택된 사용자</p>
              {selectedProfile ? (
                <div className="mt-[10px] flex items-center gap-[12px]">
                  <Avatar name={selectedProfile.name} userId={selectedProfile.id} color={selectedProfile.color} size={44} />
                  <div>
                    <p className={`${FONT} text-[16px] font-semibold text-white`}>{selectedProfile.name}</p>
                    <p className={`${FONT} mt-[2px] text-[12px] text-[#8ea1ba]`}>입장 후 작성자명으로 기록됩니다</p>
                  </div>
                </div>
              ) : (
                <p className={`${FONT} mt-[10px] text-[13px] text-[#8ea1ba]`}>먼저 사용자를 선택해 주세요</p>
              )}
            </div>

            <div className="flex flex-col gap-[10px]">
              <label className={`${FONT} text-[11px] font-semibold uppercase tracking-[0.8px] text-[#8ea1ba]`}>공통 비밀번호</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="비밀번호 입력"
                  className={`${FONT} w-full rounded-[14px] border border-white/10 bg-white px-[16px] py-[14px] pr-[44px] text-[15px] text-[#18202a] outline-none focus:border-[#5898ff]`}
                />
                <button
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[#6c7b8e]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {error && <p className={`${FONT} text-[12px] text-[#ff9c91]`}>{error}</p>}

              <button
                onClick={handleLogin}
                disabled={!selectedProfile || !sharedPinHash}
                className={`${FONT} mt-[6px] rounded-[14px] py-[14px] text-[15px] font-semibold text-white transition-colors ${selectedProfile && sharedPinHash ? 'bg-[#004ea7] hover:bg-[#0b5cbb]' : 'cursor-not-allowed bg-[#33445a] text-[#8ea1ba]'}`}
              >
                입장하기
              </button>

              {!sharedPinHash && profiles.length > 0 && (
                <p className={`${FONT} text-[12px] text-[#8ea1ba]`}>
                  공통 비밀번호가 아직 설정되지 않았습니다. 첫 사용자를 다시 만들어 비밀번호를 설정하거나 Settings에서 변경해 주세요.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddUserModal
          isFirst={profiles.length === 0}
          sharedPinHash={sharedPinHash}
          onClose={() => setShowAddModal(false)}
          onDone={handleNewUser}
        />
      )}
    </div>
  )
}
