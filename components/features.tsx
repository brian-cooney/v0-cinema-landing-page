const features = [
  {
    title: "Intimate Setting",
    description:
      "Just 6 carefully arranged seats ensure an exclusive, personal viewing experience for every guest.",
  },
  {
    title: "Curated Selection",
    description:
      "From timeless classics to hidden gems, our programming celebrates the art of cinema.",
  },
  {
    title: "Premium Sound",
    description:
      "Crystal-clear audio designed for a small space—hear every whisper and score note.",
  },
  {
    title: "Always Free",
    description:
      "We believe great cinema should be accessible to everyone. No tickets, just pure enjoyment.",
  },
]

export function Features() {
  return (
    <section id="about" className="scroll-mt-24 border-t-2 border-black bg-brand-pink px-4 py-16 sm:px-6">
      <h2 className="mb-10 text-center text-4xl font-semibold uppercase leading-none tracking-tight sm:text-5xl">
        Why Embassy <span aria-hidden="true">↓</span>
      </h2>
      <div className="mx-auto grid max-w-6xl border-l-2 border-t-2 border-black sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => (
          <div key={feature.title} className="border-b-2 border-r-2 border-black p-6">
            <p className="font-mono text-sm font-bold">{String(index + 1).padStart(2, "0")}</p>
            <h3 className="mt-6 text-2xl font-semibold uppercase leading-none tracking-tight">
              {feature.title}
            </h3>
            <p className="mt-3 font-mono text-sm leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
