import { cn } from "@/lib/utils";

/** Универсальная bento-плитка. variant="lime" — акцентная неоновая плитка. */
export function BentoCard({
  className,
  variant = "dark",
  children,
}: {
  className?: string;
  variant?: "dark" | "lime";
  children: React.ReactNode;
}) {
  return (
    <div className={cn(variant === "lime" ? "bento-lime" : "bento", "p-6", className)}>
      {children}
    </div>
  );
}
