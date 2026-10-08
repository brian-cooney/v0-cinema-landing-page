"use client"

import Link from "next/link"
import { useDictionary } from "@/lib/i18n/client"
import { cn } from "@/lib/utils"

// Black square with the name stacked in a heavy serif, like a printed stamp
export function Logo({ className }: { className?: string }) {
  const t = useDictionary()
  return (
    <Link
      href="/"
      aria-label={t.common.homeLabel}
      className={cn(
        "inline-flex flex-col justify-center bg-black px-2.5 py-2 font-logo text-[17px] leading-[0.95] font-black uppercase tracking-tight text-white sm:text-[22px]",
        className,
      )}
    >
      <span>Embassy</span>
      <span>Cinema</span>
    </Link>
  )
}
