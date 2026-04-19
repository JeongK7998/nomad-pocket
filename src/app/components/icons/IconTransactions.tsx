export function IconTransactions({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M5 10H12.5M5 6.875H12.5M13.75 6.875H15M13.75 10H15M13.75 13.125H15M5 13.125H12.5M3.125 3.125H16.875V16.875H3.125V3.125Z" stroke="currentColor" strokeLinejoin="round"/>
    </svg>
  )
}
