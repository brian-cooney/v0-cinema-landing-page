import { Armchair, Sparkles, Volume2, Heart } from "lucide-react"

const features = [
  {
    icon: Armchair,
    title: "Intimate Setting",
    description:
      "Just 6 carefully arranged seats ensure an exclusive, personal viewing experience for every guest.",
  },
  {
    icon: Sparkles,
    title: "Curated Selection",
    description:
      "From timeless classics to hidden gems, our programming celebrates the art of cinema.",
  },
  {
    icon: Volume2,
    title: "Premium Sound",
    description:
      "Crystal-clear audio designed for a small space—hear every whisper and score note.",
  },
  {
    icon: Heart,
    title: "Always Free",
    description:
      "We believe great cinema should be accessible to everyone. No tickets, just pure enjoyment.",
  },
]

export function Features() {
  return (
    <section id="about" className="border-t border-border/50 bg-card/50 py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-16 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-primary">
            The Experience
          </p>
          <h2 className="font-serif text-3xl font-semibold md:text-4xl">
            Why Embassy Cinema
          </h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-lg border border-border/50 bg-card p-6 transition-all hover:border-primary/30"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-serif text-lg font-medium">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
