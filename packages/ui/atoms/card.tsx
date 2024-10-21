import * as React from "react";
import { cn } from "../utils/cn";

function Card({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactNode {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground rounded-lg border shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactNode {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  );
}

function CardTitle({
  className,
  ref,
  ...props
}: React.ComponentProps<"h3">): React.ReactNode {
  const { children } = props;
  return (
    <h3
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
    </h3>
  );
}

function CardDescription({
  className,
  ...props
}: React.ComponentProps<"p">): React.ReactNode {
  return (
    <p className={cn("text-muted-foreground text-sm", className)} {...props} />
  );
}

function CardContent({
  className,
  ...props
}: React.ComponentProps<"p">): React.ReactNode {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

function CardFooter({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactNode {
  return (
    <div className={cn("flex items-center p-6 pt-0", className)} {...props} />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
