import * as React from "react"
import { cn } from "@/lib/utils"

const EnhancedCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    gradient?: boolean;
    glow?: boolean;
    hover?: boolean;
  }
>(({ className, gradient, glow, hover = true, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300",
      gradient && "bg-gradient-to-br from-card via-card to-primary/5",
      glow && "shadow-lg shadow-primary/10",
      hover && "hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1",
      className
    )}
    {...props}
  />
))
EnhancedCard.displayName = "EnhancedCard"

const FloatingActionButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-50 animate-float",
      className
    )}
    {...props}
  >
    {children}
  </button>
))
FloatingActionButton.displayName = "FloatingActionButton"

const GlassCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl transition-all duration-300 hover:bg-white/20",
      className
    )}
    {...props}
  />
))
GlassCard.displayName = "GlassCard"

export { EnhancedCard, FloatingActionButton, GlassCard }