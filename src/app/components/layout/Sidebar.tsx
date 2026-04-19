'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Settings, X, LogOut, RefreshCcw } from 'lucide-react'
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
  { href: '/settings',     label: 'Settings',     icon: Settings         },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  currentUser?: UserSession | null
  canCycleUser?: boolean
  onCycleUser?: () => void
  onLogout?: () => void
}

function UserPanel({
  user,
  canCycleUser,
  onCycleUser,
  onLogout,
}: {
  user: UserSession
  canCycleUser?: boolean
  onCycleUser?: () => void
  onLogout?: () => void
}) {
  const color = getAvatarColor(user.id, user.color)
  return (
    <div className="w-full px-[12px] pt-[12px]">
      <div className="mb-[12px] h-[1px] bg-[#33445a]" />
      <div className="mb-[10px] flex items-center gap-[10px] px-[12px]">
        <div
          style={{ backgroundColor: color }}
          className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white"
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-['Pretendard_Variable',sans-serif] truncate text-[13px] font-semibold leading-tight text-white">
            {user.name}
          </p>
          <p className="font-['Pretendard_Variable',sans-serif] mt-[2px] text-[10px] uppercase tracking-[0.5px] text-[#6c7b8e]">
            current user
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[5px] border border-[#33445a]">
        <button
          onClick={onCycleUser}
          disabled={!canCycleUser}
          className={`flex w-full items-center justify-center gap-[8px] px-[12px] py-[10px] text-center transition-colors ${canCycleUser ? 'text-white hover:bg-[#33445a]' : 'cursor-not-allowed text-[#6c7b8e]'}`}
        >
          <RefreshCcw size={12} />
          <span className="font-['Pretendard_Variable',sans-serif] text-[12px] font-semibold">사용자 전환</span>
        </button>
        <div className="h-[1px] bg-[#33445a]" />
        <button
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-[8px] px-[12px] py-[10px] text-center text-white transition-colors hover:bg-[#33445a]"
        >
          <LogOut size={12} />
          <span className="font-['Pretendard_Variable',sans-serif] text-[12px] font-semibold">로그아웃</span>
        </button>
      </div>
    </div>
  )
}

export function Sidebar({ isOpen = false, onClose, currentUser, canCycleUser, onCycleUser, onLogout }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const inner = (
    <div className="bg-[#18202a] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[24px] shadow-[4px_4px_8px_0px_rgba(25,28,30,0.16)]">
      <div className="content-stretch flex flex-col items-start justify-between py-[32px] relative size-full">

        {/* 상단: 로고 + 네비게이션 */}
        <div className="content-stretch flex flex-col gap-[36px] items-start relative shrink-0 w-full">

          {/* 로고 영역 */}
          <div className="relative shrink-0 w-full">
            <div className="content-stretch flex flex-col gap-[4px] items-start leading-[0] not-italic px-[24px] relative text-center w-full">
              <div className="flex flex-col font-['Pretendard_Variable',sans-serif] font-extrabold justify-center relative shrink-0 text-[#5898ff] text-[22px] tracking-[-1px] w-full">
                <p className="leading-[28px]">NOMAD_POCKET</p>
              </div>
              <div className="flex flex-col font-['Pretendard_Variable',sans-serif] font-normal justify-center relative shrink-0 text-[#6c7b8e] text-[12px] tracking-[1px] uppercase w-full">
                <p className="leading-[15px]">Financial Precision</p>
              </div>
            </div>
          </div>

          {/* 메인 네비게이션 */}
          <div className="relative shrink-0 w-full">
            <div className="content-stretch flex flex-col items-start px-[12px] relative w-full gap-[2px]">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const active = isActive(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className={`relative shrink-0 w-full rounded-[100px] transition-all
                      ${active ? 'bg-[#33445a]' : 'hover:bg-[#33445a]/40'}`}
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

        {/* 하단: 사용자 + 버전 */}
        <div className="relative shrink-0 w-full px-[12px]">
          <div className="content-stretch flex flex-col gap-[4px] items-start relative w-full">
            {currentUser && (
              <UserPanel
                user={currentUser}
                canCycleUser={canCycleUser}
                onCycleUser={onCycleUser}
                onLogout={onLogout}
              />
            )}

            <div className="px-[24px] py-[8px]">
              <p className="font-['Pretendard_Variable',sans-serif] font-normal text-[11px] text-[#6c7b8e] tracking-[0.5px]">
                v1.0.4
              </p>
            </div>
          </div>
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
