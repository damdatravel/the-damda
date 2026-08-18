function DamdaSymbol({ id, size = 40 }: { id: string; size?: number }) {
  const h = Math.round(size * 170 / 140)
  return (
    <svg viewBox="0 0 140 170" width={size} height={h} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Front-arc clip: left side of stem, mid-height — makes orbit appear to wrap in front */}
        <clipPath id={`${id}-fc`}>
          <rect x="0" y="55" width="63" height="88"/>
        </clipPath>
      </defs>

      {/* ── Orbit ring (back, drawn first) ── */}
      <ellipse cx="61" cy="91" rx="74" ry="17"
        transform="rotate(-20 61 91)"
        stroke="white" strokeWidth="1.8" fill="none"/>

      {/* ── T horizontal bar ── */}
      {/* Background fill erases orbit behind bar */}
      <polygon points="4,12 108,29 108,51 4,34" fill="#0A0F1E"/>
      {/* Outer stroke */}
      <polygon points="4,12 108,29 108,51 4,34" stroke="white" strokeWidth="1.8" fill="none"/>
      {/* Inner double-line */}
      <polygon points="10,16 102,32 102,47 10,30" stroke="white" strokeWidth="0.9" fill="none"/>

      {/* ── T vertical stem ── */}
      {/* Background fill */}
      <rect x="46" y="48" width="28" height="116" fill="#0A0F1E"/>
      {/* Outer stroke */}
      <rect x="46" y="48" width="28" height="116" stroke="white" strokeWidth="1.8" fill="none"/>
      {/* Inner double-line */}
      <rect x="52" y="53" width="16" height="106" stroke="white" strokeWidth="0.9" fill="none"/>

      {/* ── Orbit ring (front arc, left of stem) ── */}
      <ellipse cx="61" cy="91" rx="74" ry="17"
        transform="rotate(-20 61 91)"
        stroke="white" strokeWidth="1.8" fill="none"
        clipPath={`url(#${id}-fc)`}/>
    </svg>
  )
}

interface DamdaLogoProps {
  id: string
  symbolSize?: number
  large?: boolean
  showTagline?: boolean
}

export default function DamdaLogo({ id, symbolSize = 36, large = false, showTagline = true }: DamdaLogoProps) {
  return (
    <div className="flex items-center gap-3">
      <DamdaSymbol id={id} size={symbolSize} />
      <div>
        <div
          className="font-black text-white leading-none"
          style={{ fontSize: large ? '22px' : '18px', letterSpacing: '3px' }}
        >
          THE <span className="text-[#10E096]">DAMDA</span>
        </div>
        {showTagline && (
          <div
            className="font-semibold uppercase text-[#10E096]/55"
            style={{ fontSize: large ? '9px' : '7px', letterSpacing: '3px', marginTop: '5px' }}
          >
            TIME TO VALUE
          </div>
        )}
      </div>
    </div>
  )
}
