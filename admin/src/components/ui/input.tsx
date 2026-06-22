import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-xl border border-input/80 bg-background/60 px-3.5 py-2 text-sm text-foreground shadow-xs backdrop-blur-sm transition-[color,background-color,border-color,box-shadow] duration-200 ease-out outline-none",
        "placeholder:text-muted-foreground",
        "hover:border-primary/30 hover:bg-background/80",
        "focus-visible:border-primary/50 focus-visible:bg-background focus-visible:ring-[3px] focus-visible:ring-primary/15",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted/40 disabled:opacity-60",
        "aria-invalid:border-destructive/70 aria-invalid:ring-[3px] aria-invalid:ring-destructive/15",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "dark:bg-input/25 dark:hover:bg-input/35 dark:focus-visible:bg-input/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
