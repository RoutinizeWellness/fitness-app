"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonGroupVariants = cva(
  "inline-flex",
  {
    variants: {
      variant: {
        default: "[&>*:not(:first-child)]:border-l-0 [&>*:first-child]:rounded-r-none [&>*:last-child]:rounded-l-none [&>*:not(:first-child):not(:last-child)]:rounded-none",
        attached: "[&>*]:border-r-0 [&>*:last-child]:border-r [&>*:first-child]:rounded-r-none [&>*:last-child]:rounded-l-none [&>*:not(:first-child):not(:last-child)]:rounded-none",
        spaced: "gap-1 [&>*]:rounded",
        pills: "p-1 bg-gray-100 rounded-full [&>*.active]:bg-white [&>*.active]:shadow-sm [&>*]:rounded-full",
      },
      orientation: {
        horizontal: "flex-row",
        vertical: "flex-col [&>*:not(:first-child)]:border-t-0 [&>*:first-child]:rounded-b-none [&>*:last-child]:rounded-t-none [&>*:not(:first-child):not(:last-child)]:rounded-none",
      },
      size: {
        default: "",
        sm: "[&>*]:text-xs [&>*]:py-1 [&>*]:px-2",
        lg: "[&>*]:text-base [&>*]:py-2.5 [&>*]:px-4",
      },
      fullWidth: {
        true: "w-full [&>*]:flex-1",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      orientation: "horizontal",
      size: "default",
      fullWidth: false,
    },
  }
)

export interface ButtonGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof buttonGroupVariants> {
  children: React.ReactNode
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ 
    className, 
    variant, 
    orientation,
    size,
    fullWidth,
    children,
    ...props 
  }, ref) => {
    return (
      <div
        className={cn(
          buttonGroupVariants({ 
            variant, 
            orientation,
            size,
            fullWidth,
            className 
          })
        )}
        ref={ref}
        role="group"
        {...props}
      >
        {children}
      </div>
    )
  }
)
ButtonGroup.displayName = "ButtonGroup"

export { ButtonGroup, buttonGroupVariants }
