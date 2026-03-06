import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-md border border-border/40 bg-gradient-to-r from-muted/55 via-muted/80 to-muted/55",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
