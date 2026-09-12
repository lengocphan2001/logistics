import * as React from "react"
import { Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      className={cn("relative flex w-full items-center", className)}
      {...props}
    />
  )
}

function InputGroupIcon({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="input-group-icon"
      className={cn(
        "pointer-events-none absolute left-3 z-10 flex size-4 items-center justify-center text-[var(--graphite)]",
        className
      )}
      {...props}
    />
  )
}

function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return <Input className={className} {...props} />
}

function InputGroupAction({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="input-group-action"
      className={cn(
        "absolute right-2 z-10 flex size-8 items-center justify-center rounded-[var(--radius-control)] text-[var(--graphite)] hover:bg-[var(--wash)] hover:text-[var(--ink)]",
        className
      )}
      {...props}
    />
  )
}

export { InputGroup, InputGroupIcon, InputGroupInput, InputGroupAction }

function SearchInput({ className, ...props }: React.ComponentProps<typeof Input>) {
  return (
    <InputGroup>
      <InputGroupIcon>
        <Search className="size-4" />
      </InputGroupIcon>
      <InputGroupInput className={cn("pl-9", className)} {...props} />
    </InputGroup>
  )
}

export { SearchInput }
