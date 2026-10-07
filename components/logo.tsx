import Link from "next/link"
import { cn } from "@/lib/utils"

// Black square with the name stacked in a heavy serif, like a printed stamp
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Embassy Cinema home"
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
