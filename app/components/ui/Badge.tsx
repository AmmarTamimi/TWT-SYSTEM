import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#2c6e49] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#2c6e49] text-white shadow hover:bg-[#1f5234]",
        secondary:
          "border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200",
        destructive:
          "border-transparent bg-red-500 text-white shadow hover:bg-red-600",
        outline: "text-gray-800 border-gray-300",
        success: "border-transparent bg-green-100 text-green-700",
        warning: "border-transparent bg-yellow-100 text-yellow-700",
        info: "border-transparent bg-blue-100 text-blue-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };