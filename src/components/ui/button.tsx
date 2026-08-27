import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 font-sans tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-white shadow-xs hover:bg-slate-800 active:bg-slate-950",
        outline:
          "border-slate-300 bg-transparent text-slate-800 hover:bg-slate-100 hover:text-slate-950 active:bg-slate-200",
        secondary:
          "bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300",
        tonal:
          "bg-blue-50 text-blue-900 hover:bg-blue-100 active:bg-blue-200 border border-blue-200/50",
        ghost:
          "hover:bg-slate-100/80 text-slate-700 hover:text-slate-950 active:bg-slate-200",
        destructive:
          "bg-red-50 text-red-700 hover:bg-red-100 active:bg-red-200 border border-red-200/60",
        link: "text-blue-600 underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 gap-2 px-4 has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5 text-xs sm:text-sm font-medium",
        xs: "h-6 gap-1 rounded-full px-2.5 text-[11px] font-medium [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7.5 gap-1.5 rounded-full px-3 text-xs font-medium [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2.5 px-5 text-sm font-semibold rounded-full",
        icon: "size-9 rounded-full",
        "icon-xs":
          "size-6 rounded-full [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7.5 rounded-full",
        "icon-lg": "size-11 rounded-full",
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
