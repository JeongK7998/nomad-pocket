import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'active' | 'inactive';
  size?: 'sm' | 'md';
  onClick?: () => void;
  className?: string;
}

export function TabButton({
  children,
  variant = 'inactive',
  size = 'md',
  onClick,
  className = ''
}: ButtonProps) {
  const baseStyles = "flex flex-col items-center justify-center px-[24px] py-[8px] relative shrink-0 w-[100px] transition-all";

  const variantStyles = variant === 'active'
    ? "bg-white text-[#004ea7] rounded-[9999px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] font-['Pretendard:SemiBold',sans-serif]"
    : "text-[#6c7b8e] font-['Pretendard:Medium',sans-serif]";

  const sizeStyles = size === 'sm'
    ? "text-[10px]"
    : "text-[12px]";

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
    >
      <div className="flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-center whitespace-nowrap">
        <p className="leading-[16px]">{children}</p>
      </div>
    </button>
  );
}

interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function ButtonGroup({ children, className = '' }: ButtonGroupProps) {
  return (
    <div className={`flex items-start p-[4px] relative rounded-[9999px] ${className}`}>
      <div aria-hidden="true" className="absolute bg-[#e6e8f1] inset-0 pointer-events-none rounded-[9999px]" />
      {children}
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]" />
    </div>
  );
}
