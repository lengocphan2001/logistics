import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Badges carry state, not decoration: stock, discount, order stage. Squared
 * off (2px) so they read as a stamp against the rounded controls rather than
 * as another pill in a pill kit.
 */
const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-[2px] border border-transparent px-1.5 text-xs font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--manifest-navy)] [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-[var(--manifest-navy)] text-white",
        secondary: "bg-[var(--wash)] text-[var(--graphite)]",
        /** Price cut, promotional saving. */
        discount: "bg-[var(--seal-red)] text-white",
        /** In stock, paid, delivered. */
        success: "bg-[var(--green-wash)] text-[var(--ledger-green)]",
        destructive: "bg-[var(--red-wash)] text-[var(--seal-red)]",
        outline: "border-[var(--rule-strong)] text-[var(--graphite)]",
        ghost: "text-[var(--graphite)] hover:bg-[var(--wash)]",
        link: "text-[var(--manifest-navy)] underline underline-offset-4",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
