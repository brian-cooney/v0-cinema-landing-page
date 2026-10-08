import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

// Share card in the zine look: yellow page, the black logo stamp, a heavy
// grotesk headline and the cinema photo on the right edge
export const alt = "Embassy Cinema — six seats, one screen, in Finalborgo"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const asset = (file: string) => readFile(join(process.cwd(), "assets/og", file))

export default async function Image() {
  const [playfair, archivo, plexMono, hero] = await Promise.all([
    asset("PlayfairDisplay-Black.ttf"),
    asset("Archivo-ExtraBold.ttf"),
    asset("IBMPlexMono-Medium.ttf"),
    asset("hero.jpg"),
  ])
  const heroSrc = `data:image/jpeg;base64,${hero.toString("base64")}`

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#fcd450" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 680,
            padding: 56,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignSelf: "flex-start",
              background: "#000",
              color: "#fff",
              padding: "18px 22px",
              fontFamily: "Playfair",
              fontSize: 56,
              lineHeight: 0.95,
              textTransform: "uppercase",
              letterSpacing: -1,
            }}
          >
            <span>Embassy</span>
            <span>Cinema</span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontFamily: "Archivo",
              fontSize: 68,
              lineHeight: 0.95,
              letterSpacing: -2,
              textTransform: "uppercase",
              color: "#000",
            }}
          >
            <span>Six seats.</span>
            <span>One screen.</span>
            <span>Free to book.</span>
          </div>

          <div
            style={{
              display: "flex",
              fontFamily: "Plex Mono",
              fontSize: 22,
              textTransform: "uppercase",
              letterSpacing: 1,
              color: "#000",
            }}
          >
            Finalborgo · embassycinema.com
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, borderLeft: "6px solid #000" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroSrc} alt="" width={520} height={630} style={{ objectFit: "cover" }} />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Playfair", data: playfair, weight: 900, style: "normal" },
        { name: "Archivo", data: archivo, weight: 800, style: "normal" },
        { name: "Plex Mono", data: plexMono, weight: 500, style: "normal" },
      ],
    },
  )
}
