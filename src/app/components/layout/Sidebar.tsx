'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Settings, X } from 'lucide-react'
import { IconDashboard } from '@/app/components/icons/IconDashboard'
import { IconTransactions } from '@/app/components/icons/IconTransactions'
import { IconBudget } from '@/app/components/icons/IconBudget'
import { IconManage } from '@/app/components/icons/IconManage'
import { getAvatarColor, type UserSession } from '@/lib/userContext'


const NAV_ITEMS = [
  { href: '/',             label: 'Dashboard',    icon: IconDashboard    },
  { href: '/transactions', label: 'Transactions', icon: IconTransactions },
  { href: '/budget',       label: 'Budget',       icon: IconBudget       },
  { href: '/manage',       label: 'Manage',       icon: IconManage       },
  { href: '/settings',     label: 'Setting',      icon: Settings         },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  currentUser?: UserSession | null
  currentUserNumber?: number
  canCycleUser?: boolean
  onCycleUser?: () => void
  onLogout?: () => void
}

function UserPanel({
  user,
  userNumber = 1,
  canCycleUser,
  onCycleUser,
  onLogout,
}: {
  user: UserSession
  userNumber?: number
  canCycleUser?: boolean
  onCycleUser?: () => void
  onLogout?: () => void
}) {
  const color = getAvatarColor(user.id, user.color)
  const userLabel = `USER${String(userNumber).padStart(2, '0')}`
  return (
    <div className="w-full px-[24px]">
      <div className="mb-[12px] h-[1px] bg-[#4a555d]" />
      <div className="mb-[12px] flex items-center gap-[12px] py-[12px]">
        <div
          style={{ backgroundColor: color }}
          className="flex h-[36px] w-[36px] flex-shrink-0 items-center justify-center rounded-full text-[16px] font-bold text-white"
        >
          {user.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-['Pretendard_Variable',sans-serif] truncate text-[16px] font-medium leading-none text-[#e6e8f1]">
            {userLabel} : {user.name}
          </p>
          <p className="font-['Pretendard_Variable',sans-serif] mt-[4px] text-[12px] leading-none text-[#6c7b8e]">
            현재 사용자
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-[8px]">
        <button
          onClick={onCycleUser}
          disabled={!canCycleUser}
          className={`flex h-[36px] w-full items-center justify-center rounded-[10px] border border-[#4a555d] bg-[#18202a] px-[19px] text-center transition-colors ${canCycleUser ? 'text-white hover:bg-[#202935]' : 'cursor-not-allowed text-[#6c7b8e]'}`}
        >
          <span className="font-['Pretendard_Variable',sans-serif] text-[14px] font-medium">사용자 전환</span>
        </button>
        <button
          onClick={onLogout}
          className="flex h-[36px] w-full items-center justify-center rounded-[10px] border border-[#4a555d] bg-black px-[19px] text-center text-white transition-colors hover:bg-[#111111]"
        >
          <span className="font-['Pretendard_Variable',sans-serif] text-[14px] font-medium tracking-[-0.4px]">로그 아웃</span>
        </button>
      </div>
    </div>
  )
}

export function Sidebar({ isOpen = false, onClose, currentUser, currentUserNumber = 1, canCycleUser, onCycleUser, onLogout }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const inner = (
    <div className="bg-[#18202a] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[24px] shadow-[4px_4px_8px_0px_rgba(25,28,30,0.16)]">
      <div className="content-stretch flex flex-col items-start justify-between py-[24px] relative size-full">

        {/* 상단: 로고 + 네비게이션 */}
        <div className="content-stretch flex flex-col gap-[36px] items-start relative shrink-0 w-full">

          {/* 로고 영역 */}
          <div className="relative shrink-0 w-full">
            <div className="content-stretch flex flex-col gap-[4px] items-start leading-[0] not-italic px-[24px] relative text-left w-full">
              <div className="flex flex-col font-['Pretendard_Variable',sans-serif] font-extrabold justify-center relative shrink-0 text-[#5898ff] text-[22px] tracking-[-1px] w-full">
                <p className="leading-[28px]">NOMAD_POCKET</p>
              </div>
              <div className="flex flex-col font-['Pretendard_Variable',sans-serif] font-normal justify-center relative shrink-0 text-[#6c7b8e] text-[12px] tracking-[1px] uppercase w-full">
                <p className="leading-[15px]">Financial Precision</p>
              </div>
              <div className="flex items-center gap-[8px]">
                <div className="h-[10px] w-[10px] rounded-full border border-[#ff786b] text-[#ff786b] flex items-center justify-center">
                  <div className="h-[4px] w-[4px] rounded-full bg-[#ff786b]" />
                </div>
                <div className="flex flex-col font-['Pretendard_Variable',sans-serif] font-normal justify-center relative shrink-0 text-[#ff786b] text-[12px] tracking-[1px] uppercase">
                  <p className="leading-[15px]">V. 1.04</p>
                </div>
              </div>
            </div>
          </div>

          {/* 메인 네비게이션 */}
          <div className="relative shrink-0 w-full">
            <div className="content-stretch flex flex-col items-start px-[14px] relative w-full">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const active = isActive(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className={`relative shrink-0 w-full rounded-[100px] transition-all ${
                      active ? 'bg-[#33445a]' : 'hover:bg-[#33445a]/22'
                    }`}
                  >
                    <div className="content-stretch flex gap-[12px] items-center px-[24px] py-[12px] relative w-full">
                      <div className="relative shrink-0 size-[20px]">
                        <Icon size={20} className={active ? 'text-white' : 'text-[#6c7b8e]'} />
                      </div>
                      <span className={`font-['Pretendard_Variable',sans-serif] text-[18px] tracking-[-0.4px] leading-[24px] whitespace-nowrap
                        ${active ? 'font-semibold text-white' : 'font-medium text-[#6c7b8e]'}`}>
                        {label}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* 하단: 사용자 */}
        <div className="relative shrink-0 w-full pb-[0px]">
          {currentUser && (
            <UserPanel
              user={currentUser}
              userNumber={currentUserNumber}
              canCycleUser={canCycleUser}
              onCycleUser={onCycleUser}
              onLogout={onLogout}
            />
          )}
        </div>

      </div>

      {/* 모바일 닫기 버튼 */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-[16px] right-[16px] md:hidden w-[28px] h-[28px] flex items-center justify-center rounded-full bg-[#33445a] text-[#6c7b8e] hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* 데스크톱 */}
      <div className="hidden md:flex absolute content-stretch items-center left-0 pl-[24px] py-[24px] top-0 h-full w-[256px] z-10">
        {inner}
      </div>

      {/* 모바일 drawer */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-[256px] flex items-center pl-[16px] py-[16px]
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {inner}
      </div>
    </>
  )
}
