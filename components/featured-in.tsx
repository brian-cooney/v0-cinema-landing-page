"use client"

const publications = [
  {
    name: "The Guardian",
    color: "#052962",
  },
  {
    name: "Sight & Sound",
    color: "#E31837",
  },
  {
    name: "The New York Times",
    color: "#000000",
  },
  {
    name: "Variety",
    color: "#000000",
  },
  {
    name: "Empire",
    color: "#DC0000",
  },
  {
    name: "Time Out",
    color: "#E31837",
  },
]

function GuardianLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 295 48"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M24.5 4.5V0h-3v4.5H18v3h3.5v29.7c0 6.9 3.7 10.8 10.3 10.8 2.2 0 4.4-.4 6-1.1v-3.4c-1.4.6-3.1 1-4.9 1-4.6 0-6.4-2.8-6.4-7.5V7.5h11.3v-3H24.5zM0 44.5h3.3V20.3c2-4.4 5.5-7.1 9.8-7.1 1.3 0 2.5.2 3.6.5V10c-.9-.2-1.9-.3-2.9-.3-4.7 0-8.5 3.1-10.5 7.9V4.5H0v40zM71.8 44.5h3.3V20.3c2-4.4 5.5-7.1 9.8-7.1 1.3 0 2.5.2 3.6.5V10c-.9-.2-1.9-.3-2.9-.3-4.7 0-8.5 3.1-10.5 7.9V4.5h-3.3v40zM43.2 4.5h-3.3v16.7c-2.4-4.7-6.6-7.5-11.8-7.5C19.9 13.7 14 21 14 31.1c0 10.1 5.9 17.4 14.1 17.4 5.2 0 9.4-2.8 11.8-7.5v6.5h3.3V4.5zm-14.4 40.7c-7 0-11.4-6-11.4-14.1 0-8.1 4.4-14.1 11.4-14.1 7 0 11.4 6 11.4 14.1 0 8.1-4.4 14.1-11.4 14.1zM92.4 4.5h-3.3v40h3.3V4.5z" />
      <text x="100" y="36" fontSize="32" fontWeight="700" fontFamily="Georgia, serif">
        Guardian
      </text>
    </svg>
  )
}

function SightSoundLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 180 48"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <text x="0" y="34" fontSize="28" fontWeight="700" fontFamily="Georgia, serif" letterSpacing="-1">
        Sight & Sound
      </text>
    </svg>
  )
}

function NYTimesLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 48"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <text x="0" y="35" fontSize="24" fontWeight="700" fontFamily="Georgia, serif" fontStyle="italic">
        The New York Times
      </text>
    </svg>
  )
}

function VarietyLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 140 48"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <text x="0" y="38" fontSize="36" fontWeight="700" fontFamily="Georgia, serif" fontStyle="italic">
        Variety
      </text>
    </svg>
  )
}

function EmpireLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 130 48"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <text x="0" y="36" fontSize="32" fontWeight="900" fontFamily="Arial, sans-serif" letterSpacing="3">
        EMPIRE
      </text>
    </svg>
  )
}

function TimeOutLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 140 48"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <text x="0" y="36" fontSize="32" fontWeight="900" fontFamily="Arial, sans-serif">
        Time Out
      </text>
    </svg>
  )
}

const logoComponents = [
  { Component: GuardianLogo, name: "The Guardian", color: "#052962" },
  { Component: SightSoundLogo, name: "Sight & Sound", color: "#E31837" },
  { Component: NYTimesLogo, name: "The New York Times", color: "#121212" },
  { Component: VarietyLogo, name: "Variety", color: "#1a1a1a" },
  { Component: EmpireLogo, name: "Empire", color: "#DC0000" },
  { Component: TimeOutLogo, name: "Time Out", color: "#E31837" },
]

export function FeaturedIn() {
  return (
    <section className="border-t border-border/50 bg-background py-16">
      <div className="mx-auto max-w-6xl px-4">
        <p className="mb-10 text-center text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          As Featured In
        </p>

        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 md:gap-x-16">
          {logoComponents.map(({ Component, name, color }) => (
            <div
              key={name}
              className="group relative flex items-center justify-center"
            >
              <Component
                className="h-8 w-auto text-muted-foreground/50 transition-all duration-300 group-hover:text-foreground md:h-10"
              />
              <span className="sr-only">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
