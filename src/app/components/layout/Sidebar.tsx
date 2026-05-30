'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Settings, X, LogOut } from 'lucide-react'
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
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  currentUser?: UserSession | null
  onSwitchUser?: () => void
}

function UserBadge({ user, onSwitch }: { user: UserSession; onSwitch?: () => void }) {
  const color = getAvatarColor(user.id, user.color)
  return (
    <div className="flex items-center gap-[10px] px-[12px] py-[8px]">
      <div
        style={{ backgroundColor: color }}
        className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-white font-bold text-[13px] flex-shrink-0"
      >
        {user.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-['Pretendard_Variable',sans-serif] text-[13px] font-semibold text-white truncate leading-tight">
          {user.name}
        </p>
        <p className="font-['Pretendard_Variable',sans-serif] text-[10px] text-[#6c7b8e] uppercase tracking-[0.5px] leading-tight">
          현재 사용자
        </p>
      </div>
      {onSwitch && (
        <button
          onClick={onSwitch}
          title="사용자 전환"
          className="w-[28px] h-[28px] rounded-full bg-[#33445a] hover:bg-[#4a5f7a] flex items-center justify-center transition-colors flex-shrink-0"
        >
          <LogOut size={12} className="text-[#6c7b8e]" />
        </button>
      )}
    </div>
  )
}

export function Sidebar({ isOpen = false, onClose, currentUser, onSwitchUser }: SidebarProps) {
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

        {/* 하단: 사용자 + Settings + 버전 */}
        <div className="relative shrink-0 w-full px-[12px]">
          <div className="content-stretch flex flex-col gap-[4px] items-start relative w-full">

            {/* 현재 사용자 */}
            {currentUser && (
              <>
                <div className="w-full px-[12px] mb-[4px]">
                  <div className="h-[1px] bg-[#33445a]" />
                </div>
                <UserBadge user={currentUser} onSwitch={onSwitchUser} />
                <div className="w-full px-[12px] mb-[4px]">
                  <div className="h-[1px] bg-[#33445a]" />
                </div>
              </>
            )}

            <Link
              href="/settings"
              onClick={onClose}
              className={`relative shrink-0 w-full rounded-[100px] transition-all
                ${pathname === '/settings' ? 'bg-[#33445a]' : 'hover:bg-[#33445a]/40'}`}
            >
              <div className="content-stretch flex gap-[12px] items-center px-[24px] py-[12px] relative w-full">
                <Settings size={20} className={pathname === '/settings' ? 'text-white' : 'text-[#6c7b8e]'} />
                <span className={`font-['Pretendard_Variable',sans-serif] text-[18px] tracking-[-0.4px] leading-[24px] whitespace-nowrap
                  ${pathname === '/settings' ? 'font-semibold text-white' : 'font-medium text-[#6c7b8e]'}`}>
                  Settings
                </span>
              </div>
            </Link>

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
