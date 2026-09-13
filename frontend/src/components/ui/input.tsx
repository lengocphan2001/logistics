import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-[var(--radius-control)] border border-[var(--rule-strong)] bg-[var(--sheet-white)] px-3 py-2 text-base text-[var(--ink)] outline-none sm:text-sm",
        "placeholder:text-[var(--graphite)]/70",
        "hover:border-[var(--graphite)]",
        "focus-visible:border-[var(--manifest-navy)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--manifest-navy)]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[var(--wash)] disabled:opacity-60",
        "aria-invalid:border-[var(--seal-red)] aria-invalid:focus-visible:outline-[var(--seal-red)]",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[var(--ink)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
