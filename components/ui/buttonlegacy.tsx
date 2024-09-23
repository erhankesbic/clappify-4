import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/utils/cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-zinc-950 dark:focus-visible:ring-purple-300",
  {
    variants: {
      variant: {
        default: "bg-purple-500 text-white hover:bg-purple-600 dark:bg-purple-300 dark:text-zinc-900 dark:hover:bg-purple-400",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 dark:bg-red-700 dark:text-white dark:hover:bg-red-800",
        outline:
          "border border-purple-500 text-purple-500 hover:bg-purple-50 dark:border-purple-300 dark:text-purple-300 dark:hover:bg-purple-700 dark:hover:text-white",
        secondary:
          "bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-800 dark:text-purple-300 dark:hover:bg-purple-700",
        ghost: "hover:bg-purple-50 dark:hover:bg-purple-800 dark:hover:text-purple-300",
        link: "text-purple-500 underline-offset-4 hover:underline dark:text-purple-300",
        lavender: "bg-purple-400 text-white hover:bg-purple-500 dark:bg-purple-600 dark:text-white dark:hover:bg-purple-700",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "lavender",
      size: "default",
    },
  }
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
