import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-xl border border-input/80 bg-background/60 px-3.5 py-3 text-sm text-foreground shadow-xs backdrop-blur-sm transition-[color,background-color,border-color,box-shadow] duration-200 ease-out outline-none",
        "placeholder:text-muted-foreground",
        "hover:border-primary/30 hover:bg-background/80",
        "focus-visible:border-primary/50 focus-visible:bg-background focus-visible:ring-[3px] focus-visible:ring-primary/15",
        "disabled:cursor-not-allowed disabled:bg-muted/40 disabled:opacity-60",
        "aria-invalid:border-destructive/70 aria-invalid:ring-[3px] aria-invalid:ring-destructive/15",
        "dark:bg-input/25 dark:hover:bg-input/35 dark:focus-visible:bg-input/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
