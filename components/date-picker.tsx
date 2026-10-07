"use client"

import { useState } from "react"
import { format, parse } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { Matcher } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// Dates are passed around as "yyyy-MM-dd" strings (what romeTimeToISO expects)
// and shown to the admin as dd/MM/yyyy.
const VALUE_FORMAT = "yyyy-MM-dd"
const DISPLAY_FORMAT = "dd/MM/yyyy"

interface DatePickerProps {
  id?: string
  value: string
  onChange: (value: string) => void
  disabled?: Matcher | Matcher[]
  placeholder?: string
  className?: string
}

export function DatePicker({
  id,
  value,
  onChange,
  disabled,
  placeholder = "dd/mm/yyyy",
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const selected = value ? parse(value, VALUE_FORMAT, new Date()) : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start font-normal",
            !selected && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon />
          {selected ? format(selected, DISPLAY_FORMAT) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          onSelect={(date) => {
            if (!date) return
            onChange(format(date, VALUE_FORMAT))
            setOpen(false)
          }}
          disabled={disabled}
          weekStartsOn={1}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
