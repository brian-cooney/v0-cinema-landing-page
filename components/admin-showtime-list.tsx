"use client"

import React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Calendar, Clock, Edit2, Trash2, X, Check, Upload, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { updateShowtime, deleteShowtime } from "@/app/actions"

interface Showtime {
  id: string
  movie_title: string
  movie_description: string
  showtime: string
  image_url: string | null
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
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const startEdit = (showtime: Showtime) => {
    const date = new Date(showtime.showtime)
    setEditingId(showtime.id)
    setEditForm({
      movieTitle: showtime.movie_title,
      movieDescription: showtime.movie_description,
      date: date.toISOString().split("T")[0],
      time: date.toTimeString().slice(0, 5),
      imageUrl: showtime.image_url,
      imagePreview: showtime.image_url,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({ movieTitle: "", movieDescription: "", date: "", time: "", imageUrl: null, imagePreview: null })
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
    const showtime = new Date(`${editForm.date}T${editForm.time}`).toISOString()

    const result = await updateShowtime({
      id,
      movieTitle: editForm.movieTitle,
      movieDescription: editForm.movieDescription,
      showtime,
      imageUrl: editForm.imageUrl,
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
                  <div className="grid gap-4 sm:grid-cols-2">
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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
