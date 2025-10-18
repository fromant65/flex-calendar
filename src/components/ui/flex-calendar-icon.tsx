import { forwardRef } from "react"
import type { LucideProps } from "lucide-react"

export const FlexCalendarIcon = forwardRef<SVGSVGElement, LucideProps>((props, ref) => {
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Flexible/Bendy Calendar Shape - Taller and larger */}
      {/* Top edge curved inward */}
      <path d="M 3 5 Q 12 3 21 5" />
      
      {/* Left side bending */}
      <path d="M 3 5 Q 1.5 12 3 21" />
      
      {/* Bottom edge curved outward */}
      <path d="M 3 21 Q 12 23 21 21" />
      
      {/* Right side bending */}
      <path d="M 21 5 Q 22.5 12 21 21" />
      
      {/* Top header separator line (curved) */}
      <path d="M 3 9 Q 12 8 21 9" />
      
      {/* Binding rings at top */}
      <line x1="7" y1="2.5" x2="7" y2="5.5" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="17" y1="2.5" x2="17" y2="5.5" />
      
      {/* Calendar grid dots (minimal) - more spread out vertically */}
      <circle cx="7" cy="13" r="0.6" fill="currentColor" />
      <circle cx="12" cy="13" r="0.6" fill="currentColor" />
      <circle cx="17" cy="13" r="0.6" fill="currentColor" />
      
      <circle cx="7" cy="17" r="0.6" fill="currentColor" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" />
      <circle cx="17" cy="17" r="0.6" fill="currentColor" />
    </svg>
  )
})

FlexCalendarIcon.displayName = "FlexCalendarIcon"
