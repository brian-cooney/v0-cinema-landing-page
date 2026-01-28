"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Calendar, Clock, MapPin, Pencil, Trash2, Loader2, X, Check } from "lucide-react"
import { cancelBooking, updateBooking, getAvailableSeats } from "@/app/actions"

interface Showtime {
  id: string
  movie_title: string
  showtime: string
  movie_description: string
  image_url: string | null
  running_time: number | null
}

interface Booking {
  id: string
  seat_number: number
  customer_name: string
  created_at: string
  showtimes: Showtime
}

interface BookingCardProps {
  booking: Booking
  seatLabels: string[]
}

export function BookingCard({ booking, seatLabels }: BookingCardProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [customerName, setCustomerName] = useState(booking.customer_name)
  const [seatNumber, setSeatNumber] = useState(booking.seat_number)
  const [availableSeats, setAvailableSeats] = useState<number[]>([])
  const [bookedSeats, setBookedSeats] = useState<number[]>([])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const handleStartEdit = async () => {
    setError(null)
    // Fetch available seats
    const { availableSeats: available, bookedSeats: booked } = await getAvailableSeats(
      booking.showtimes.id,
      booking.id
    )
    setAvailableSeats(available)
    setBookedSeats(booked)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setCustomerName(booking.customer_name)
    setSeatNumber(booking.seat_number)
    setError(null)
  }

  const handleUpdate = async () => {
    setIsUpdating(true)
    setError(null)

    const result = await updateBooking({
      bookingId: booking.id,
      customerName,
      seatNumber,
    })

    if (result.error) {
      setError(result.error)
      setIsUpdating(false)
      return
    }

    setIsEditing(false)
    setIsUpdating(false)
    router.refresh()
  }

  const handleCancel = async () => {
    setIsCancelling(true)
    setError(null)

    const result = await cancelBooking(booking.id)

    if (result.error) {
      setError(result.error)
      setIsCancelling(false)
      return
    }

    router.refresh()
  }

  if (isEditing) {
    return (
      <Card className="overflow-hidden border-primary">
        {booking.showtimes.image_url && (
          <div className="aspect-video w-full overflow-hidden opacity-50">
            <img
              src={booking.showtimes.image_url}
              alt={booking.showtimes.movie_title}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="line-clamp-1">
            Edit Booking
          </CardTitle>
          <CardDescription>
            {booking.showtimes.movie_title}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="customerName">Name</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <Label>Select Seat</Label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((seat) => {
                const isBooked = bookedSeats.includes(seat)
                const isSelected = seatNumber === seat
                const isCurrentSeat = booking.seat_number === seat

                return (
                  <button
                    key={seat}
                    type="button"
                    disabled={isBooked}
                    onClick={() => setSeatNumber(seat)}
                    className={`
                      rounded-md border p-2 text-sm font-medium transition-colors
                      ${isSelected 
                        ? "border-primary bg-primary text-primary-foreground" 
                        : isBooked
                          ? "cursor-not-allowed border-muted bg-muted text-muted-foreground"
                          : "border-border hover:border-primary hover:bg-primary/10"
                      }
                      ${isCurrentSeat && !isSelected ? "ring-1 ring-primary/50" : ""}
                    `}
                  >
                    {seatLabels[seat - 1]}
                    {isCurrentSeat && !isSelected && (
                      <span className="ml-1 text-xs text-muted-foreground">(current)</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCancelEdit}
              disabled={isUpdating}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleUpdate}
              disabled={isUpdating || !customerName.trim()}
            >
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      {booking.showtimes.image_url && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={booking.showtimes.image_url}
            alt={booking.showtimes.movie_title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="line-clamp-1">
          {booking.showtimes.movie_title}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {booking.showtimes.movie_description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{formatDate(booking.showtimes.showtime)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{formatTime(booking.showtimes.showtime)}</span>
          {booking.showtimes.running_time && (
            <span className="text-muted-foreground">
              ({booking.showtimes.running_time} min)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>Seat {seatLabels[booking.seat_number - 1]}</span>
        </div>
        <div className="mt-4 rounded-md bg-primary/10 p-3 text-center">
          <p className="text-xs text-muted-foreground">Booked for</p>
          <p className="font-medium">{booking.customer_name}</p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleStartEdit}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                {isCancelling ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Cancel
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel your booking for{" "}
                  <strong>{booking.showtimes.movie_title}</strong>? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancel}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isCancelling ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Cancel Booking
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
