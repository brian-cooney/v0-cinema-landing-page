"use client"

import React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Calendar, Clock, Edit2, Trash2, X, Check, Upload, ImageIcon, Users, Plus, ChevronDown, ChevronUp, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { updateShowtime, deleteShowtime, adminBookSeat, adminDeleteBooking, getShowtimeBookings } from "@/app/actions"

interface Booking {
  id: string
  seat_number: number
  customer_name: string
  customer_email: string
  created_at: string
}

interface Showtime {
  id: string
  movie_title: string
  movie_description: string
  showtime: string
  image_url: string | null
  running_time: number | null
}

interface AdminShowtimeListProps {
  showtimes: Showtime[]
}

export function AdminShowtimeList({ showtimes }: AdminShowtimeListProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    movieTitle: "",
    movieDescription: "",
    date: "",
    time: "",
    imageUrl: null as string | null,
    imagePreview: null as string | null,
    runningTime: null as number | null,
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  
  // Booking management state
  const [expandedShowtime, setExpandedShowtime] = useState<string | null>(null)
  const [bookings, setBookings] = useState<Record<string, Booking[]>>({})
  const [loadingBookings, setLoadingBookings] = useState<string | null>(null)
  const [showAddBooking, setShowAddBooking] = useState<string | null>(null)
  const [addBookingForm, setAddBookingForm] = useState({
    customerName: "",
    customerEmail: "",
    seatNumber: 1,
    sendEmail: true,
  })
  const [isAddingBooking, setIsAddingBooking] = useState(false)
  const [isDeletingBooking, setIsDeletingBooking] = useState<string | null>(null)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "Europe/Rome",
    })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Europe/Rome",
    })
  }

  const startEdit = (showtime: Showtime) => {
    const date = new Date(showtime.showtime)
    // Format date and time in Italian timezone for editing
    const dateInItaly = date.toLocaleDateString("sv-SE", { timeZone: "Europe/Rome" }) // sv-SE gives YYYY-MM-DD format
    const timeInItaly = date.toLocaleTimeString("en-GB", { 
      hour: "2-digit", 
      minute: "2-digit", 
      hour12: false,
      timeZone: "Europe/Rome" 
    })
    setEditingId(showtime.id)
    setEditForm({
      movieTitle: showtime.movie_title,
      movieDescription: showtime.movie_description,
      date: dateInItaly,
      time: timeInItaly,
      imageUrl: showtime.image_url,
      imagePreview: showtime.image_url,
      runningTime: showtime.running_time,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({ movieTitle: "", movieDescription: "", date: "", time: "", imageUrl: null, imagePreview: null, runningTime: null })
  }

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setEditForm(prev => ({ ...prev, imagePreview: reader.result as string }))
    }
    reader.readAsDataURL(file)

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Upload failed")

      const data = await res.json()
      setEditForm(prev => ({ ...prev, imageUrl: data.url }))
    } catch {
      setEditForm(prev => ({ ...prev, imagePreview: prev.imageUrl }))
    } finally {
      setIsUploading(false)
    }
  }

  const removeEditImage = () => {
    setEditForm(prev => ({ ...prev, imageUrl: null, imagePreview: null }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUpdate = async (id: string) => {
    setIsUpdating(true)
    // Combine date and time with explicit Italian timezone
    const showtime = `${editForm.date}T${editForm.time}:00+01:00`

    const result = await updateShowtime({
      id,
      movieTitle: editForm.movieTitle,
      movieDescription: editForm.movieDescription,
      showtime,
      imageUrl: editForm.imageUrl,
      runningTime: editForm.runningTime,
    })

    if (!result.error) {
      setEditingId(null)
      router.refresh()
    }

    setIsUpdating(false)
  }

  const handleDelete = async (id: string) => {
    setIsDeleting(id)
    const result = await deleteShowtime(id)

    if (!result.error) {
      router.refresh()
    }

    setIsDeleting(null)
  }

  const isPast = (dateStr: string) => {
    return new Date(dateStr) < new Date()
  }

  const toggleBookings = async (showtimeId: string) => {
    if (expandedShowtime === showtimeId) {
      setExpandedShowtime(null)
      return
    }
    
    setExpandedShowtime(showtimeId)
    
    // Load bookings if not already loaded
    if (!bookings[showtimeId]) {
      setLoadingBookings(showtimeId)
      const result = await getShowtimeBookings(showtimeId)
      if (result.success && result.bookings) {
        setBookings(prev => ({ ...prev, [showtimeId]: result.bookings }))
      }
      setLoadingBookings(null)
    }
  }

  const handleAddBooking = async (showtimeId: string) => {
    setIsAddingBooking(true)
    
    const result = await adminBookSeat({
      showtimeId,
      seatNumber: addBookingForm.seatNumber,
      customerName: addBookingForm.customerName,
      customerEmail: addBookingForm.customerEmail,
      sendEmail: addBookingForm.sendEmail,
    })
    
    if (result.success) {
      // Refresh bookings
      const refreshResult = await getShowtimeBookings(showtimeId)
      if (refreshResult.success && refreshResult.bookings) {
        setBookings(prev => ({ ...prev, [showtimeId]: refreshResult.bookings }))
      }
      setShowAddBooking(null)
      setAddBookingForm({ customerName: "", customerEmail: "", seatNumber: 1, sendEmail: true })
      router.refresh()
    }
    
    setIsAddingBooking(false)
  }

  const handleDeleteBooking = async (bookingId: string, showtimeId: string) => {
    setIsDeletingBooking(bookingId)
    
    const result = await adminDeleteBooking(bookingId)
    
    if (result.success) {
      // Refresh bookings
      const refreshResult = await getShowtimeBookings(showtimeId)
      if (refreshResult.success && refreshResult.bookings) {
        setBookings(prev => ({ ...prev, [showtimeId]: refreshResult.bookings }))
      }
      router.refresh()
    }
    
    setIsDeletingBooking(null)
  }

  const getAvailableSeats = (showtimeId: string) => {
    const showtimeBookings = bookings[showtimeId] || []
    const bookedSeats = showtimeBookings.map(b => b.seat_number)
    return [1, 2, 3, 4, 5, 6].filter(seat => !bookedSeats.includes(seat))
  }

  if (showtimes.length === 0) {
    return (
      <Card className="border-border/50 bg-card">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            No showtimes scheduled. Add your first showtime above!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif text-2xl">
          <Calendar className="h-6 w-6 text-primary" />
          Scheduled Showtimes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {showtimes.map((showtime) => (
            <div
              key={showtime.id}
              className={`rounded-lg border border-border/50 p-4 transition-colors ${
                isPast(showtime.showtime)
                  ? "bg-muted/30 opacity-60"
                  : "bg-secondary/30"
              }`}
            >
              {editingId === showtime.id ? (
                <div className="space-y-4">
                  <Input
                    value={editForm.movieTitle}
                    onChange={(e) =>
                      setEditForm({ ...editForm, movieTitle: e.target.value })
                    }
                    placeholder="Movie title"
                    className="bg-background"
                  />
                  <Textarea
                    value={editForm.movieDescription}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        movieDescription: e.target.value,
                      })
                    }
                    placeholder="Description"
                    className="min-h-20 bg-background"
                  />
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Input
                      type="date"
                      value={editForm.date}
                      onChange={(e) =>
                        setEditForm({ ...editForm, date: e.target.value })
                      }
                      className="bg-background"
                    />
                    <Input
                      type="time"
                      value={editForm.time}
                      onChange={(e) =>
                        setEditForm({ ...editForm, time: e.target.value })
                      }
                      className="bg-background"
                    />
                    <Input
                      type="number"
                      min="1"
                      placeholder="Running time (min)"
                      value={editForm.runningTime || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, runningTime: e.target.value ? parseInt(e.target.value, 10) : null })
                      }
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <p className="mb-2 text-sm text-muted-foreground">Film Poster</p>
                    {editForm.imagePreview ? (
                      <div className="relative inline-block">
                        <div className="relative h-24 w-16 overflow-hidden rounded border border-border/50">
                          <Image
                            src={editForm.imagePreview || "/placeholder.svg"}
                            alt="Film poster"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute -right-2 -top-2 h-6 w-6 rounded-full p-0 bg-transparent"
                          onClick={removeEditImage}
                          disabled={isUploading}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        {isUploading && (
                          <div className="absolute inset-0 flex h-24 w-16 items-center justify-center rounded bg-background/80">
                            <span className="text-xs">...</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        <Upload className="mr-1 h-4 w-4" />
                        Upload Image
                      </Button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleEditImageUpload}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleUpdate(showtime.id)}
                      disabled={isUpdating}
                    >
                      <Check className="mr-1 h-4 w-4" />
                      {isUpdating ? "Saving..." : "Save"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                      <X className="mr-1 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-4">
                    {showtime.image_url ? (
                      <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded border border-border/50">
                        <Image
                          src={showtime.image_url || "/placeholder.svg"}
                          alt={showtime.movie_title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded border border-border/50 bg-muted/50">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-serif text-lg font-medium">
                        {showtime.movie_title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {showtime.movie_description}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-primary" />
                          {formatDate(showtime.showtime)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-primary" />
                          {formatTime(showtime.showtime)}
                        </span>
                        {showtime.running_time && (
                          <span className="flex items-center gap-1.5">
                            <Timer className="h-4 w-4 text-primary" />
                            {showtime.running_time} min
                          </span>
                        )}
                        {isPast(showtime.showtime) && (
                          <span className="rounded bg-muted px-2 py-0.5 text-xs">
                            Past
                          </span>
)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleBookings(showtime.id)}
                    >
                      <Users className="mr-1 h-4 w-4" />
                      Bookings
                      {expandedShowtime === showtime.id ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(showtime)}
                    >
                      <Edit2 className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Trash2 className="mr-1 h-4 w-4" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Showtime?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete &quot;{showtime.movie_title}&quot;
                              and all associated bookings. This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(showtime.id)}
                              disabled={isDeleting === showtime.id}
                            >
                              {isDeleting === showtime.id
                                ? "Deleting..."
                                : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
              )}
              
              {/* Bookings Management Section */}
              {expandedShowtime === showtime.id && (
                <div className="mt-4 border-t border-border/50 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Seat Bookings ({bookings[showtime.id]?.length || 0}/6)
                    </h4>
                    {getAvailableSeats(showtime.id).length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowAddBooking(showtime.id)
                          setAddBookingForm(prev => ({
                            ...prev,
                            seatNumber: getAvailableSeats(showtime.id)[0] || 1
                          }))
                        }}
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Add Booking
                      </Button>
                    )}
                  </div>
                  
                  {loadingBookings === showtime.id ? (
                    <p className="text-sm text-muted-foreground">Loading bookings...</p>
                  ) : (
                    <>
                      {/* Add Booking Form */}
                      {showAddBooking === showtime.id && (
                        <div className="mb-4 p-4 rounded-lg bg-background border border-border/50">
                          <h5 className="font-medium text-sm mb-3">Add New Booking</h5>
                          <div className="grid gap-3">
                            <div className="grid gap-2">
                              <Label htmlFor="customerName" className="text-sm">Customer Name</Label>
                              <Input
                                id="customerName"
                                value={addBookingForm.customerName}
                                onChange={(e) => setAddBookingForm(prev => ({ ...prev, customerName: e.target.value }))}
                                placeholder="Enter customer name"
                                className="bg-background"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="customerEmail" className="text-sm">Customer Email</Label>
                              <Input
                                id="customerEmail"
                                type="email"
                                value={addBookingForm.customerEmail}
                                onChange={(e) => setAddBookingForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                                placeholder="Enter customer email"
                                className="bg-background"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="seatNumber" className="text-sm">Seat Number</Label>
                              <select
                                id="seatNumber"
                                value={addBookingForm.seatNumber}
                                onChange={(e) => setAddBookingForm(prev => ({ ...prev, seatNumber: parseInt(e.target.value) }))}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              >
                                {getAvailableSeats(showtime.id).map(seat => (
                                  <option key={seat} value={seat}>Seat {seat}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="sendEmail"
                                checked={addBookingForm.sendEmail}
                                onChange={(e) => setAddBookingForm(prev => ({ ...prev, sendEmail: e.target.checked }))}
                                className="h-4 w-4 rounded border-input"
                              />
                              <Label htmlFor="sendEmail" className="text-sm font-normal">Send confirmation email</Label>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                onClick={() => handleAddBooking(showtime.id)}
                                disabled={isAddingBooking || !addBookingForm.customerName || !addBookingForm.customerEmail}
                              >
                                {isAddingBooking ? "Adding..." : "Add Booking"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setShowAddBooking(null)
                                  setAddBookingForm({ customerName: "", customerEmail: "", seatNumber: 1, sendEmail: true })
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Bookings List */}
                      {bookings[showtime.id]?.length > 0 ? (
                        <div className="space-y-2">
                          {bookings[showtime.id].map((booking) => (
                            <div
                              key={booking.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/50"
                            >
                              <div className="flex items-center gap-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                                  {booking.seat_number}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{booking.customer_name}</p>
                                  <p className="text-xs text-muted-foreground">{booking.customer_email}</p>
                                </div>
                              </div>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Booking?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will remove the booking for {booking.customer_name} (Seat {booking.seat_number}).
                                      The customer will not be notified automatically.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteBooking(booking.id, showtime.id)}
                                      disabled={isDeletingBooking === booking.id}
                                    >
                                      {isDeletingBooking === booking.id ? "Removing..." : "Remove"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No bookings yet for this showtime.</p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
