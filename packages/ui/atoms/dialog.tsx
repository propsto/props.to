"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import * as React from "react";
import { type JSX } from "react";
import { cn } from "../utils/cn";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

function DialogPortal({
  children,
  ...props
}: Readonly<DialogPrimitive.DialogPortalProps>): JSX.Element {
  return (
    <DialogPrimitive.Portal {...props}>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
        {children}
      </div>
    </DialogPrimitive.Portal>
  );
}
DialogPortal.displayName = DialogPrimitive.Portal.displayName;

function DialogOverlay({
  className,
  ref,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>): React.ReactNode {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
}

function DialogContent({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>): React.ReactNode {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 grid w-full scale-100 gap-4 bg-white p-6 opacity-100 animate-in fade-in-90 slide-in-from-bottom-10 sm:max-w-lg sm:rounded-lg sm:zoom-in-90 sm:slide-in-from-bottom-0",
          "dark:bg-slate-900",
          className,
        )}
        {...props}
      >
        {props.children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900 dark:data-[state=open]:bg-slate-800">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): JSX.Element {
  return (
    <div
      className={cn(
        "flex flex-col space-y-2 text-center sm:text-left",
        className,
      )}
      {...props}
    />
  );
}
DialogHeader.displayName = "DialogHeader";

function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): JSX.Element {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className,
      )}
      {...props}
    />
  );
}
DialogFooter.displayName = "DialogFooter";

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>): React.ReactNode {
  return (
    <DialogPrimitive.Title
      className={cn(
        "text-lg font-semibold text-slate-900",
        "dark:text-slate-50",
        className,
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>): React.ReactNode {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm text-slate-500", "dark:text-slate-400", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
