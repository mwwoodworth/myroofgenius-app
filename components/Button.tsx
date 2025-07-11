import React from "react";
import clsx from "clsx";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps<C extends React.ElementType = "button"> = {
  as?: C;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} & React.ComponentPropsWithoutRef<C>;

const baseClasses =
  "inline-flex items-center justify-center rounded-md font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none min-h-[48px]";

export default function Button<C extends React.ElementType = "button">({
  as,
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps<C>) {
  const Component = as || "button";
  return (
    <Component
      className={clsx(
        baseClasses,
        {
          primary: "bg-accent text-white hover:bg-accent/90",
          secondary:
            "border-2 border-accent text-accent hover:bg-accent hover:text-white",
          ghost: "text-accent hover:bg-accent/10",
          destructive: "bg-danger text-white hover:bg-danger/90",
        }[variant],
        {
          sm: "px-3 text-sm",
          md: "px-4 text-base",
          lg: "px-6 text-lg",
        }[size],
        className,
      )}
      {...props}
    />
  );
}
