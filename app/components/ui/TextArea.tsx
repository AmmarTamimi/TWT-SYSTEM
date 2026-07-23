import * as React from "react";
import { cn } from "../../lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-xl border border-gray-200 bg-white/50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 transition-all duration-200 focus:border-[#2c6e49] focus:outline-none focus:ring-2 focus:ring-[#2c6e49] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };