"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import useSWR, { mutate } from "swr"
import { CheckCircle2, Loader2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { bookSeat } from "@/app/actions"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface Booking {
  seat_number: number
  customer_name: string
}

const TOTAL_SEATS = 6
const SEAT_LABELS = ["A1", "A2", "A3", "B1", "B2", "B3"]

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
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null)
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

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
    data?.bookings?.map((b) => [b.seat_number, b.customer_name]) || []
  )
  const bookedSeats = new Set(data?.bookings?.map((b) => b.seat_number) || [])

  const getFirstName = (fullName: string) => {
    const firstName = fullName.split(" ")[0]
    return firstName.length > 6 ? firstName.slice(0, 5) + "..." : firstName
  }

  const handleSignIn = () => {
    // Create redirect URL with current showtime AND selected seat
    const params = new URLSearchParams()
    // Use the showtimeId prop to ensure the correct film is pre-selected
    params.set("showtime", showtimeId)
    if (selectedSeat) {
      params.set("seat", selectedSeat.toString())
    }
    const redirectUrl = `/book?${params.toString()}`
    router.push(`/auth/user-login?redirectTo=${encodeURIComponent(redirectUrl)}`)
  }

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
        customerEmail: user.email,
        userId: user.id,
      })

      if (result.error) {
        setError(result.error)
      } else {
        setShowConfetti(true)
        setBookingSuccess(true)
        mutate(`/api/bookings?showtimeId=${showtimeId}`)
        setTimeout(() => setShowConfetti(false), 4000)
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (bookingSuccess) {
    return (
      <>
        <PopcornConfetti show={showConfetti} />
        <div className="rounded-lg border border-primary/30 bg-card p-8 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-primary" />
        <h3 className="font-serif text-2xl font-semibold">
          Booking Confirmed!
        </h3>
        <p className="mt-2 text-muted-foreground">
          Your seat {SEAT_LABELS[selectedSeat! - 1]} has been reserved. A
          confirmation has been sent to {user?.email}.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Remember: All screenings are free. Just show up and enjoy the film!
        </p>
        <Button
          className="mt-6"
          onClick={() => {
            setBookingSuccess(false)
            setSelectedSeat(null)
            setName("")
          }}
        >
          Book Another Seat
        </Button>
      </div>
      </>
    )
  }

  return (
    <div className="space-y-8">
      {/* Screen */}
      <div className="text-center">
        <div className="mx-auto mb-2 h-2 w-48 rounded-full bg-primary/30" />
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Screen
        </p>
      </div>

      {/* Seats */}
      <div className="flex flex-col items-center gap-4 py-8">
        {isLoading ? (
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        ) : (
          <>
            {/* Row A (seats 1-3) */}
            <div className="flex gap-4">
              {[1, 2, 3].map((seatNum) => {
                const isBooked = bookedSeats.has(seatNum)
                const isSelected = selectedSeat === seatNum
                return (
                  <button
                    key={seatNum}
                    disabled={isBooked}
                    onClick={() => setSelectedSeat(seatNum)}
                    className={`flex h-16 w-16 flex-col items-center justify-center rounded-lg border-2 transition-all ${
                      isBooked
                        ? "cursor-not-allowed border-border bg-muted text-muted-foreground"
                        : isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-foreground hover:border-primary/50"
                    }`}
                    aria-label={`Seat ${SEAT_LABELS[seatNum - 1]}${isBooked ? ` (booked by ${bookingsMap.get(seatNum)})` : ""}`}
                  >
                    <span className="text-sm font-medium">
                      {SEAT_LABELS[seatNum - 1]}
                    </span>
                    {isBooked && (
                      <span className="text-[10px] truncate max-w-full px-1">
                        {getFirstName(bookingsMap.get(seatNum) || "")}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Row B (seats 4-6) */}
            <div className="flex gap-4">
              {[4, 5, 6].map((seatNum) => {
                const isBooked = bookedSeats.has(seatNum)
                const isSelected = selectedSeat === seatNum
                return (
                  <button
                    key={seatNum}
                    disabled={isBooked}
                    onClick={() => setSelectedSeat(seatNum)}
                    className={`flex h-16 w-16 flex-col items-center justify-center rounded-lg border-2 transition-all ${
                      isBooked
                        ? "cursor-not-allowed border-border bg-muted text-muted-foreground"
                        : isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-foreground hover:border-primary/50"
                    }`}
                    aria-label={`Seat ${SEAT_LABELS[seatNum - 1]}${isBooked ? ` (booked by ${bookingsMap.get(seatNum)})` : ""}`}
                  >
                    <span className="text-sm font-medium">
                      {SEAT_LABELS[seatNum - 1]}
                    </span>
                    {isBooked && (
                      <span className="text-[10px] truncate max-w-full px-1">
                        {getFirstName(bookingsMap.get(seatNum) || "")}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border-2 border-border bg-card" />
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border-2 border-primary bg-primary" />
          <span className="text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border-2 border-border bg-muted" />
          <span className="text-muted-foreground">Taken</span>
        </div>
      </div>

      {/* Booking Form */}
      {selectedSeat && (
        <div className="space-y-6">
          <div className="rounded-lg border border-primary/30 bg-card p-6">
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Selected seat:{" "}
              <span className="font-semibold text-primary">
                {SEAT_LABELS[selectedSeat - 1]}
              </span>
            </p>

            {isCheckingAuth ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !user ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Sign in to complete your booking
                </p>
                <Button onClick={handleSignIn} className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  Sign In with Email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="rounded-md bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Signed in as</p>
                  <p className="text-sm font-medium">{user.email}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <p className="text-center text-sm text-destructive">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !name.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
