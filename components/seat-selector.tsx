"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import useSWR, { mutate } from "swr"
import Link from "next/link"
import { Check, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { bookSeat } from "@/app/actions"
import { EmailCodeSignIn } from "@/components/email-code-sign-in"
import { cn, MAX_SEATS_PER_GUEST, SEAT_LABELS } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useDictionary } from "@/lib/i18n/client"
import type { User } from "@supabase/supabase-js"

interface Booking {
  seat_number: number
  first_name: string
}

const TOTAL_SEATS = 6

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

interface PopcornPiece {
  id: number
  left: number
  delay: number
  duration: number
  size: number
  rotation: number
}

function PopcornConfetti({ show }: { show: boolean }) {
  const [pieces, setPieces] = useState<PopcornPiece[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (show) {
      const newPieces: PopcornPiece[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        size: 16 + Math.random() * 16,
        rotation: Math.random() * 360,
      }))
      setPieces(newPieces)
    } else {
      setPieces([])
    }
  }, [show])

  if (!show || pieces.length === 0) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden z-50"
      aria-hidden="true"
    >
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${piece.left}%`,
            top: "-40px",
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        >
          <svg
            width={piece.size}
            height={piece.size}
            viewBox="0 0 24 24"
            fill="none"
            style={{ transform: `rotate(${piece.rotation}deg)` }}
          >
            {/* Popcorn bucket */}
            <path
              d="M5 8h14l-2 12H7L5 8z"
              fill="#DC2626"
              stroke="#991B1B"
              strokeWidth="0.5"
            />
            {/* Red stripes on bucket */}
            <path d="M7 8v12M11 8l-1 12M13 8l1 12M17 8v12" stroke="#FEE2E2" strokeWidth="0.8" />
            {/* Popcorn pieces */}
            <circle cx="8" cy="6" r="2.5" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="0.3" />
            <circle cx="12" cy="4" r="2.8" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="0.3" />
            <circle cx="16" cy="6" r="2.5" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="0.3" />
            <circle cx="10" cy="5" r="2" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="0.3" />
            <circle cx="14" cy="5" r="2" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="0.3" />
          </svg>
        </div>
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti-fall {
          animation: confetti-fall linear forwards;
        }
      `}</style>
    </div>
  )
}

interface SeatSelectorProps {
  showtimeId: string
}

export function SeatSelector({ showtimeId }: SeatSelectorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = useDictionary()
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null)
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [myBookingCount, setMyBookingCount] = useState(0)
  const bookingPanelRef = useRef<HTMLDivElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Check authentication status
  useEffect(() => {
    const supabase = createClient()
    
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setIsCheckingAuth(false)
    }
    
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsCheckingAuth(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Restore selected seat from URL params after authentication
  useEffect(() => {
    const seatParam = searchParams.get("seat")
    if (seatParam && !selectedSeat) {
      const seatNumber = parseInt(seatParam, 10)
      if (seatNumber >= 1 && seatNumber <= 6) {
        setSelectedSeat(seatNumber)
        // Clean up the URL by removing the seat parameter
        const newParams = new URLSearchParams(searchParams.toString())
        newParams.delete("seat")
        const newUrl = newParams.toString() ? `${pathname}?${newParams.toString()}` : pathname
        router.replace(newUrl)
      }
    }
  }, [searchParams, selectedSeat, pathname, router])

  const { data, isLoading } = useSWR<{ bookings: Booking[] }>(
    `/api/bookings?showtimeId=${showtimeId}`,
    fetcher,
    { refreshInterval: 5000 }
  )

  const bookingsMap = new Map(
    data?.bookings?.map((b) => [b.seat_number, b.first_name]) || []
  )
  const bookedSeats = new Set(data?.bookings?.map((b) => b.seat_number) || [])

  const getFirstName = (fullName: string) => {
    const firstName = fullName.split(" ")[0]
    return firstName.length > 6 ? firstName.slice(0, 5) + "..." : firstName
  }

  // How many seats this guest already has for this screening (RLS only lets
  // them see their own bookings)
  useEffect(() => {
    if (!user) {
      setMyBookingCount(0)
      return
    }
    const supabase = createClient()
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("showtime_id", showtimeId)
      .eq("user_id", user.id)
      .then(({ count }) => setMyBookingCount(count ?? 0))
  }, [user, showtimeId, bookingSuccess])

  const reachedLimit = myBookingCount >= MAX_SEATS_PER_GUEST

  // Where the emailed sign-in link should bring the guest back to
  const bookingPath = `/book?showtime=${showtimeId}${selectedSeat ? `&seat=${selectedSeat}` : ""}`

  // Bring the booking panel into view as soon as a seat is picked, so the
  // next step isn't hidden below the fold
  useEffect(() => {
    if (!selectedSeat) return
    bookingPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [selectedSeat])

  // Once signed in, the only thing left is the name: put the cursor there
  useEffect(() => {
    if (selectedSeat && user) {
      nameInputRef.current?.focus({ preventScroll: true })
    }
  }, [selectedSeat, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSeat || !name.trim() || !user?.email) return

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await bookSeat({
        showtimeId,
        seatNumber: selectedSeat,
        customerName: name.trim(),
      })

      if (result.error) {
        setError(result.error)
        // If seat was taken, refresh bookings and clear selection
        if (result.seatTaken) {
          setSelectedSeat(null)
          mutate(`/api/bookings?showtimeId=${showtimeId}`)
        }
      } else {
        setShowConfetti(true)
        setBookingSuccess(true)
        mutate(`/api/bookings?showtimeId=${showtimeId}`)
        setTimeout(() => setShowConfetti(false), 4000)
      }
    } catch {
      setError(t.seats.genericError)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (bookingSuccess) {
    return (
      <>
        <PopcornConfetti show={showConfetti} />
        <div className="mx-auto max-w-md border-2 border-black bg-white p-8 text-center shadow-[6px_6px_0_0_#000]">
        <CheckCircle2 className="mx-auto mb-4 h-16 w-16" />
        <h3 className="text-3xl font-semibold uppercase leading-none tracking-tight">
          {t.seats.successTitle}
        </h3>
        <p className="mt-2 text-muted-foreground">
          {t.seats.successBody(SEAT_LABELS[selectedSeat! - 1], user?.email ?? "")}
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          {t.seats.successFree}
        </p>
        {reachedLimit ? (
          <p className="mt-6 text-sm text-muted-foreground">
            {t.seats.successLimit(MAX_SEATS_PER_GUEST)}
          </p>
        ) : (
          <Button
            className="mt-6"
            onClick={() => {
              setBookingSuccess(false)
              setSelectedSeat(null)
              setName("")
            }}
          >
            {t.seats.bookAnother}
          </Button>
        )}
      </div>
      </>
    )
  }

  return (
    <div className="space-y-8">
      {/* Screen */}
      <div className="mx-auto max-w-xs bg-black py-1.5 text-center font-mono text-xs font-bold uppercase tracking-[0.3em] text-white">
        {t.seats.screen}
      </div>

      {/* Seats: two rows of three */}
      <div className="flex flex-col items-center gap-3 py-4 sm:gap-4">
        {isLoading ? (
          <Loader2 className="h-8 w-8 animate-spin" />
        ) : (
          [[1, 2, 3], [4, 5, 6]].map((row) => (
            <div key={row[0]} className="flex gap-3 sm:gap-4">
              {row.map((seatNum) => {
                const isBooked = bookedSeats.has(seatNum)
                const isSelected = selectedSeat === seatNum
                return (
                  <button
                    key={seatNum}
                    disabled={isBooked}
                    onClick={() => setSelectedSeat(seatNum)}
                    aria-pressed={isSelected}
                    className={cn(
                      "flex h-20 w-20 flex-col items-center justify-center border-2 border-black transition-all",
                      isBooked
                        ? "cursor-not-allowed bg-brand-pink"
                        : isSelected
                          ? "bg-black text-white shadow-[4px_4px_0_0_#000]"
                          : "bg-white hover:-translate-y-0.5 hover:bg-brand-cyan",
                    )}
                    aria-label={t.seats.seatLabel(SEAT_LABELS[seatNum - 1], isBooked ? bookingsMap.get(seatNum) : undefined)}
                  >
                    <span className="text-lg font-semibold">{SEAT_LABELS[seatNum - 1]}</span>
                    {isBooked && (
                      <span className="max-w-full truncate px-1 font-mono text-[10px] font-bold uppercase">
                        {getFirstName(bookingsMap.get(seatNum) || "")}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ))
        )}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-5 font-mono text-xs font-bold uppercase">
        {[
          { label: t.seats.available, swatch: "bg-white" },
          { label: t.seats.yourPick, swatch: "bg-black" },
          { label: t.seats.taken, swatch: "bg-brand-pink" },
        ].map(({ label, swatch }) => (
          <span key={label} className="flex items-center gap-2">
            <span className={cn("h-4 w-4 border-2 border-black", swatch)} />
            {label}
          </span>
        ))}
      </div>

      {/* Booking panel */}
      {selectedSeat && (
        <div
          ref={bookingPanelRef}
          className="mx-auto w-full max-w-md scroll-mt-28 border-2 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]"
        >
          <h3 className="text-2xl font-semibold uppercase leading-none tracking-tight">{t.seats.completeTitle}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t.common.seat("")}
            <span className="font-semibold text-primary">{SEAT_LABELS[selectedSeat - 1]}</span>
            {" "}{t.seats.summary(MAX_SEATS_PER_GUEST)}
          </p>

          <ol className="mt-6 space-y-6">
            <BookingStep number={1} title={t.seats.verifyEmail} done={!!user}>
              {isCheckingAuth ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : user ? (
                <p className="text-sm text-muted-foreground">
                  {t.common.signedInAs} <span className="font-medium text-foreground">{user.email}</span>
                </p>
              ) : (
                <EmailCodeSignIn redirectTo={bookingPath} onSignedIn={() => router.refresh()} />
              )}
            </BookingStep>

            <BookingStep number={2} title={t.seats.confirmSeat} disabled={!user}>
              {user && reachedLimit ? (
                <p className="text-sm text-muted-foreground">
                  {t.seats.limitReached(MAX_SEATS_PER_GUEST)}{" "}
                  <Link href="/dashboard" className="text-primary underline underline-offset-2">
                    {t.header.myBookings}
                  </Link>
                  .
                </p>
              ) : user && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t.seats.yourName}</Label>
                    <Input
                      ref={nameInputRef}
                      id="name"
                      type="text"
                      autoComplete="name"
                      placeholder={t.seats.namePlaceholder}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      {t.seats.nameHint}
                    </p>
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting || !name.trim()}
                  >
                    {isSubmitting && <Loader2 className="animate-spin" />}
                    {isSubmitting
                      ? t.seats.booking
                      : t.seats.confirmButton(SEAT_LABELS[selectedSeat - 1])}
                  </Button>
                </form>
              )}
            </BookingStep>
          </ol>
        </div>
      )}
    </div>
  )
}

interface BookingStepProps {
  number: number
  title: string
  done?: boolean
  disabled?: boolean
  children?: React.ReactNode
}

function BookingStep({ number, title, done, disabled, children }: BookingStepProps) {
  return (
    <li className={cn("flex gap-4", disabled && "opacity-50")}>
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-medium",
          done ? "border-primary bg-primary text-primary-foreground" : "border-primary/50 text-primary",
        )}
      >
        {done ? <Check className="h-4 w-4" /> : number}
      </span>
      <div className="min-w-0 flex-1 space-y-3">
        <p className="pt-0.5 font-medium">{title}</p>
        {children}
      </div>
    </li>
  )
}
