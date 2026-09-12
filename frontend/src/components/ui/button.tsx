import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Controls use a 6px radius — softer than the square product media, tighter
 * than a pill. Only colour transitions; no lift, no shadow, no translate.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-control)] border border-transparent text-sm font-semibold whitespace-nowrap outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--manifest-navy)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45 aria-invalid:border-[var(--seal-red)] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        /** Structural action: navigate, confirm, submit a form. */
        default:
          "bg-[var(--manifest-navy)] text-white hover:bg-[var(--navy-deep)]",
        /** Commerce action: buy, add to cart, place order. Seal Red only here. */
        commerce:
          "bg-[var(--seal-red)] text-white hover:bg-[#8f0f1f] focus-visible:outline-[var(--seal-red)]",
        outline:
          "border-[var(--rule-strong)] bg-[var(--sheet-white)] text-[var(--ink)] hover:border-[var(--manifest-navy)] hover:text-[var(--manifest-navy)]",
        secondary:
          "bg-[var(--wash)] text-[var(--ink)] hover:bg-[var(--navy-wash)] hover:text-[var(--manifest-navy)]",
        ghost:
          "text-[var(--graphite)] hover:bg-[var(--wash)] hover:text-[var(--ink)]",
        destructive:
          "bg-[var(--red-wash)] text-[var(--seal-red)] hover:bg-[var(--seal-red)] hover:text-white focus-visible:outline-[var(--seal-red)]",
        link: "h-auto p-0 text-[var(--manifest-navy)] underline underline-offset-4 hover:text-[var(--navy-deep)]",
      },
      size: {
        default: "h-10 px-4",
        xs: "h-6 gap-1 px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 px-3 text-[0.8125rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 px-6 text-[0.9375rem]",
        icon: "size-9",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-10 [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
