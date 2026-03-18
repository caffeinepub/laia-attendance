import { cn } from "@/lib/utils";
import type React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  children: React.ReactNode;
}

export default function GlassCard({
  className,
  children,
  hover = false,
  ...props
}: GlassCardProps) {
  return (
    <div
      {...props}
      className={cn(
        "glass rounded-2xl",
        hover &&
          "transition-all duration-300 hover:bg-white/10 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_24px_64px_rgba(15,23,42,0.7)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
