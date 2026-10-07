"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Calendar, Clock, MapPin, Trash2, Loader2 } from "lucide-react"
import { cancelBooking } from "@/app/actions"
import { CINEMA_TIME_ZONE } from "@/lib/utils"

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
  const [isCancelling, setIsCancelling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: CINEMA_TIME_ZONE,
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: CINEMA_TIME_ZONE,
    })
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

        <div className="pt-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                {isCancelling ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Cancel Booking
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
