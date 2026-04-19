import React from 'react';

interface NavLinkProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function NavLink({ children, icon, active = false, onClick, className = '' }: NavLinkProps) {
  const baseStyles = "relative shrink-0 w-full rounded-[100px] transition-all";
  const activeStyles = active
    ? "bg-[#33445a]"
    : "";

  return (
    <div className={`${baseStyles} ${activeStyles} ${className}`} onClick={onClick}>
      <div className="flex flex-row items-center size-full cursor-pointer">
        <div className="content-stretch flex gap-[12px] items-center px-[24px] py-[12px] relative w-full">
          {icon && (
            <div className="relative shrink-0 size-[20px]">
              {icon}
            </div>
          )}
          <div className={`flex flex-col font-['Pretendard:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[18px] tracking-[-0.4px] whitespace-nowrap ${active ? 'text-white' : 'text-[#6c7b8e]'}`}>
            <p className="leading-[24px]">{children}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SidebarProps {
  children: React.ReactNode;
  logo?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Sidebar({ children, logo, footer, className = '' }: SidebarProps) {
  return (
    <div className={`absolute content-stretch flex h-full items-center left-0 pl-[24px] py-[24px] top-0 w-[256px] ${className}`}>
      <div className="bg-[#18202a] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[24px] shadow-[4px_4px_8px_0px_rgba(25,28,30,0.16)]">
        <div className="content-stretch flex flex-col items-start justify-between py-[32px] relative size-full">
          <div className="content-stretch flex flex-col gap-[36px] items-start relative shrink-0 w-full">
            {logo}
            <div className="relative shrink-0 w-full">
              <div className="content-stretch flex flex-col items-start px-[12px] relative w-full">
                {children}
              </div>
            </div>
          </div>
          {footer}
        </div>
      </div>
    </div>
  );
}

interface LogoProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function Logo({ title, subtitle, className = '' }: LogoProps) {
  return (
    <div className={`relative shrink-0 w-full ${className}`}>
      <div className="content-stretch flex flex-col gap-[4px] items-start leading-[0] not-italic px-[24px] relative text-center w-full">
        <div className="flex flex-col font-['Pretendard:ExtraBold',sans-serif] justify-center relative shrink-0 text-[#5898ff] text-[22px] tracking-[-1px] w-full">
          <p className="leading-[28px]">{title}</p>
        </div>
        {subtitle && (
          <div className="flex flex-col font-['Pretendard:Regular',sans-serif] justify-center relative shrink-0 text-[#6c7b8e] text-[12px] tracking-[1px] uppercase w-full">
            <p className="leading-[15px]">{subtitle}</p>
          </div>
        )}
      </div>
    </div>
  );
}
