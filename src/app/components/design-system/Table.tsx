import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className={`bg-white relative rounded-[24px] shadow-[0px_8px_24px_0px_rgba(25,28,30,0.04)] shrink-0 w-full ${className}`}>
      <div className="content-stretch flex flex-col items-start overflow-clip p-px relative rounded-[inherit] w-full">
        {children}
      </div>
      <div
        aria-hidden="true"
        className="absolute border border-[rgba(226,232,240,0.6)] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_8px_24px_0px_rgba(25,28,30,0.04)]"
      />
    </div>
  );
}

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function TableHeader({ children, className = '' }: TableHeaderProps) {
  return (
    <div className={`bg-[#18202a] relative shrink-0 w-full ${className}`}>
      <div aria-hidden="true" className="absolute border-[#f1f5f9] border-b border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex font-['Pretendard:Bold',sans-serif] gap-[12px] items-start leading-[0] not-italic pb-[13px] pt-[12px] px-[24px] relative text-[#e6e8f1] text-[12px] text-center tracking-[0.9px] uppercase w-full">
        {children}
      </div>
    </div>
  );
}

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function TableBody({ children, className = '' }: TableBodyProps) {
  return (
    <div className={`relative shrink-0 w-full ${className}`}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        {children}
      </div>
    </div>
  );
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'disabled';
}

export function TableRow({ children, className = '', variant = 'default' }: TableRowProps) {
  const opacityClass = variant === 'disabled' ? 'opacity-40' : '';

  return (
    <div className={`h-[48px] relative shrink-0 w-full ${opacityClass} ${className}`}>
      <div aria-hidden="true" className="absolute border-[#d8e9fd] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[24px] py-[8px] relative size-full">
          {children}
        </div>
      </div>
    </div>
  );
}

interface TableCellProps {
  children: React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export function TableCell({ children, width, align = 'left', className = '' }: TableCellProps) {
  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : '';
  const widthClass = width ? `w-[${width}]` : '';

  return (
    <div className={`flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[10px] ${widthClass} ${alignClass} ${className}`}>
      {children}
    </div>
  );
}
