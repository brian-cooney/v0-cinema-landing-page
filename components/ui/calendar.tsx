'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'relative flex flex-col gap-4 sm:flex-row',
        month: 'flex w-full flex-col gap-4',
        nav: 'absolute inset-x-0 top-0 flex items-center justify-between',
        button_previous: cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }), 'z-10'),
        button_next: cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }), 'z-10'),
        month_caption: 'flex h-8 items-center justify-center',
        caption_label: 'text-sm font-medium',
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'w-9 text-[0.8rem] font-normal text-muted-foreground',
        week: 'mt-2 flex w-full',
        day: 'relative size-9 p-0 text-center text-sm',
        day_button: cn(buttonVariants({ variant: 'ghost' }), 'size-9 p-0 font-normal'),
        selected:
          '[&>button]:bg-primary [&>button]:text-primary-foreground [&>button:hover]:bg-primary [&>button:hover]:text-primary-foreground',
        today: '[&>button]:ring-1 [&>button]:ring-primary/60',
        outside: 'text-muted-foreground opacity-50',
        disabled: 'text-muted-foreground',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className }) =>
          orientation === 'left' ? (
            <ChevronLeft className={cn('size-4', className)} />
          ) : (
            <ChevronRight className={cn('size-4', className)} />
          ),
      }}
      {...props}
    />
  )
}

export { Calendar }
