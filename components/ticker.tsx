const ITEMS = [
  "Italy's smallest cinema",
  "Six seats",
  "One screen",
  "Every Wednesday in Finalborgo",
  "Always free",
]

// Black strip of scrolling text under the hero (uses .animate-marquee)
export function Ticker() {
  const row = (
    <div className="flex shrink-0 items-center" aria-hidden="true">
      {ITEMS.map((item) => (
        <span key={item} className="flex items-center whitespace-nowrap">
          <span className="px-6">{item}</span>
          <span className="text-brand-pink">✦</span>
        </span>
      ))}
    </div>
  )

  return (
    <div className="overflow-hidden border-y-2 border-black bg-black py-3 font-mono text-sm font-bold uppercase text-brand-yellow sm:text-base">
      <p className="sr-only">{ITEMS.join(". ")}.</p>
      <div className="flex w-max animate-marquee motion-reduce:animate-none">
        {row}
        {row}
      </div>
    </div>
  )
}
