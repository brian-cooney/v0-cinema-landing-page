"use client"

import React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Plus, History, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createShowtime } from "@/app/actions"
import { romeTimeToISO } from "@/lib/utils"

export function AddPastScreeningForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload
    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        throw new Error("Upload failed")
      }

      const data = await res.json()
      setImageUrl(data.url)
    } catch {
      setError("Failed to upload image. Please try again.")
      setImagePreview(null)
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = () => {
    setImageUrl(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const movieTitle = formData.get("movieTitle") as string
    const movieDescription = formData.get("movieDescription") as string
    const date = formData.get("date") as string
    const time = formData.get("time") as string
    const runningTimeStr = formData.get("runningTime") as string
    const runningTime = runningTimeStr ? parseInt(runningTimeStr, 10) : null

    if (!movieTitle || !movieDescription || !date || !time) {
      setError("Please fill in all fields")
      setIsSubmitting(false)
      return
    }

    // Validate that the date is in the past
    const selectedDate = new Date(`${date}T${time}:00`)
    const now = new Date()
    if (selectedDate >= now) {
      setError("Please select a date in the past for past screenings")
      setIsSubmitting(false)
      return
    }

    // Interpret the entered date and time as Rome time (handles summer time)
    const showtime = romeTimeToISO(date, time)

    const result = await createShowtime({
      movieTitle,
      movieDescription,
      showtime,
      imageUrl: imageUrl || undefined,
      runningTime: runningTime || undefined,
    })

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      ;(e.target as HTMLFormElement).reset()
      setImageUrl(null)
      setImagePreview(null)
      router.refresh()
    }

    setIsSubmitting(false)
  }

  // Get yesterday's date as the max date for the date input
  const getMaxDate = () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday.toISOString().split("T")[0]
  }

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif text-2xl">
          <History className="h-6 w-6 text-primary" />
          Add Past Screening
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pastMovieTitle">Movie Title</Label>
            <Input
              id="pastMovieTitle"
              name="movieTitle"
              placeholder="Enter movie title"
              className="bg-secondary/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pastMovieDescription">Description</Label>
            <Textarea
              id="pastMovieDescription"
              name="movieDescription"
              placeholder="Enter a brief description of the film"
              className="min-h-24 bg-secondary/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Film Poster (Optional)</Label>
            {imagePreview ? (
              <div className="relative">
                <div className="relative aspect-[2/3] w-40 overflow-hidden rounded-lg border border-border/50">
                  <Image
                    src={imagePreview || "/placeholder.svg"}
                    alt="Film poster preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="absolute -right-2 -top-2 h-8 w-8 rounded-full p-0 bg-transparent"
                  onClick={removeImage}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
                {isUploading && (
                  <div className="absolute inset-0 flex w-40 items-center justify-center rounded-lg bg-background/80">
                    <span className="text-sm">Uploading...</span>
                  </div>
                )}
              </div>
            ) : (
              <div
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/50 bg-secondary/30 p-6 transition-colors hover:border-primary/50"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload film poster
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  JPG, PNG up to 10MB
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pastRunningTime">Running Time (minutes)</Label>
            <Input
              id="pastRunningTime"
              name="runningTime"
              type="number"
              min="1"
              placeholder="e.g. 120"
              className="bg-secondary/50"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pastDate">Date Screened</Label>
              <Input
                id="pastDate"
                name="date"
                type="date"
                max={getMaxDate()}
                className="bg-secondary/50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pastTime">Time</Label>
              <Input
                id="pastTime"
                name="time"
                type="time"
                className="bg-secondary/50"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {success && (
            <p className="text-sm text-primary">Past screening added successfully!</p>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            {isSubmitting ? "Adding..." : "Add Past Screening"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
