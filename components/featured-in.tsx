"use client"

function GuardianLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 40"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <text x="0" y="30" fontSize="28" fontWeight="700" fontFamily="Georgia, serif">
        The Guardian
      </text>
    </svg>
  )
}

function SightSoundLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 180 40"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <text x="0" y="28" fontSize="24" fontWeight="700" fontFamily="Georgia, serif" letterSpacing="-1">
        Sight & Sound
      </text>
    </svg>
  )
}

function NYTimesLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 260 40"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <text x="0" y="28" fontSize="22" fontWeight="700" fontFamily="Georgia, serif" fontStyle="italic">
        The New York Times
      </text>
    </svg>
  )
}

function VarietyLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 40"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <text x="0" y="30" fontSize="28" fontWeight="700" fontFamily="Georgia, serif" fontStyle="italic">
        Variety
      </text>
    </svg>
  )
}

function EmpireLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 130 40"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <text x="0" y="29" fontSize="26" fontWeight="900" fontFamily="Arial, sans-serif" letterSpacing="3">
        EMPIRE
      </text>
    </svg>
  )
}

function TimeOutLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 130 40"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <text x="0" y="29" fontSize="26" fontWeight="900" fontFamily="Arial, sans-serif">
        Time Out
      </text>
    </svg>
  )
}

const logoComponents = [
  { Component: GuardianLogo, name: "The Guardian", width: 200 },
  { Component: SightSoundLogo, name: "Sight & Sound", width: 180 },
  { Component: NYTimesLogo, name: "The New York Times", width: 260 },
  { Component: VarietyLogo, name: "Variety", width: 120 },
  { Component: EmpireLogo, name: "Empire", width: 130 },
  { Component: TimeOutLogo, name: "Time Out", width: 130 },
]

export function FeaturedIn() {
  return (
    <section className="border-t border-border/50 bg-background py-16 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4">
        <p className="mb-10 text-center text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          As Featured In
        </p>
      </div>

      <div className="relative w-full">
        {/* Gradient masks for smooth fade effect */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-background to-transparent" />

        {/* Marquee container */}
        <div className="flex animate-marquee">
          {/* First set of logos */}
          <div className="flex shrink-0 items-center gap-16 px-8">
            {logoComponents.map(({ Component, name, width }) => (
              <div
                key={name}
                className="flex shrink-0 items-center justify-center"
                style={{ width: width * 0.6 }}
              >
                <Component className="h-8 w-full text-muted-foreground/60" />
                <span className="sr-only">{name}</span>
              </div>
            ))}
          </div>

          {/* Duplicate set for seamless loop */}
          <div className="flex shrink-0 items-center gap-16 px-8">
            {logoComponents.map(({ Component, name, width }) => (
              <div
                key={`${name}-duplicate`}
                className="flex shrink-0 items-center justify-center"
                style={{ width: width * 0.6 }}
              >
                <Component className="h-8 w-full text-muted-foreground/60" />
                <span className="sr-only">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
