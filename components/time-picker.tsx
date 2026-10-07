"use client"

import { useLayoutEffect, useRef, useState } from "react"
import { Clock } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// Times are passed around as 24-hour "HH:mm" strings (what romeTimeToISO expects).
// With nothing picked yet, open around a typical evening showing.
const DEFAULT_HOUR = "20"
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"))
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"))

interface TimePickerProps {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function TimePicker({
  id,
  value,
  onChange,
  placeholder = "hh:mm",
  className,
}: TimePickerProps) {
  const [open, setOpen] = useState(false)
  const [hour, minute] = value ? value.split(":") : ["", ""]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <Clock />
          {value || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-auto gap-1 p-2" align="start">
        <TimeColumn
          label="Hour"
          options={HOURS}
          selected={hour}
          scrollToIfEmpty={DEFAULT_HOUR}
          onSelect={(h) => onChange(`${h}:${minute || "00"}`)}
        />
        <div className="w-px bg-border" />
        <TimeColumn
          label="Minute"
          options={MINUTES}
          selected={minute}
          onSelect={(m) => {
            onChange(`${hour || DEFAULT_HOUR}:${m}`)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

interface TimeColumnProps {
  label: string
  options: string[]
  selected: string
  scrollToIfEmpty?: string
  onSelect: (value: string) => void
}

function TimeColumn({ label, options, selected, scrollToIfEmpty, onSelect }: TimeColumnProps) {
  const listRef = useRef<HTMLDivElement>(null)

  // Centre the current selection (or the default) when the popover opens
  useLayoutEffect(() => {
    const list = listRef.current
    const target = selected || scrollToIfEmpty
    const current = list?.querySelector<HTMLElement>(`[data-value="${target}"]`)
    if (list && current) {
      list.scrollTop = current.offsetTop - list.clientHeight / 2 + current.clientHeight / 2
    }
  }, [])

  return (
    <div className="flex flex-col items-center">
      <span className="px-2 pb-1 text-xs text-muted-foreground">{label}</span>
      <div
        ref={listRef}
        role="group"
        aria-label={label}
        className="relative flex h-56 flex-col gap-0.5 overflow-y-auto px-1 [scrollbar-color:var(--color-border)_transparent] [scrollbar-width:thin]"
      >
        {options.map((option) => {
          const isSelected = option === selected
          return (
            <button
              key={option}
              type="button"
              data-value={option}
              aria-pressed={isSelected}
              onClick={() => onSelect(option)}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "w-12 shrink-0 font-normal tabular-nums",
                isSelected &&
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              )}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}
