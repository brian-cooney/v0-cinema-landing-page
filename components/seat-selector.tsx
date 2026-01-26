"use client"

import React from "react"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { bookSeat } from "@/app/actions"

interface Booking {
  seat_number: number
}

const TOTAL_SEATS = 6
const SEAT_LABELS = ["A1", "A2", "A3", "B1", "B2", "B3"]

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

interface SeatSelectorProps {
  showtimeId: string
}

export function SeatSelector({ showtimeId }: SeatSelectorProps) {
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data, isLoading } = useSWR<{ bookings: Booking[] }>(
    `/api/bookings?showtimeId=${showtimeId}`,
    fetcher,
    { refreshInterval: 5000 }
  )

  const bookedSeats = new Set(data?.bookings?.map((b) => b.seat_number) || [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSeat || !name.trim() || !email.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await bookSeat({
        showtimeId,
        seatNumber: selectedSeat,
        customerName: name.trim(),
        customerEmail: email.trim(),
      })

      if (result.error) {
        setError(result.error)
      } else {
        setBookingSuccess(true)
        mutate(`/api/bookings?showtimeId=${showtimeId}`)
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (bookingSuccess) {
    return (
      <div className="rounded-lg border border-primary/30 bg-card p-8 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-primary" />
        <h3 className="font-serif text-2xl font-semibold">
          Booking Confirmed!
        </h3>
        <p className="mt-2 text-muted-foreground">
          Your seat {SEAT_LABELS[selectedSeat! - 1]} has been reserved. A
          confirmation has been sent to {email}.
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
            setEmail("")
          }}
        >
          Book Another Seat
        </Button>
      </div>
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
                    aria-label={`Seat ${SEAT_LABELS[seatNum - 1]}${isBooked ? " (booked)" : ""}`}
                  >
                    <span className="text-sm font-medium">
                      {SEAT_LABELS[seatNum - 1]}
                    </span>
                    {isBooked && (
                      <span className="text-[10px] uppercase">Taken</span>
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
                    aria-label={`Seat ${SEAT_LABELS[seatNum - 1]}${isBooked ? " (booked)" : ""}`}
                  >
                    <span className="text-sm font-medium">
                      {SEAT_LABELS[seatNum - 1]}
                    </span>
                    {isBooked && (
                      <span className="text-[10px] uppercase">Taken</span>
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-lg border border-primary/30 bg-card p-6">
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Selected seat:{" "}
              <span className="font-semibold text-primary">
                {SEAT_LABELS[selectedSeat - 1]}
              </span>
            </p>

            <div className="space-y-4">
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

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <p className="mt-4 text-center text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="mt-6 w-full"
              disabled={isSubmitting || !name.trim() || !email.trim()}
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
          </div>
        </form>
      )}
    </div>
  )
}
