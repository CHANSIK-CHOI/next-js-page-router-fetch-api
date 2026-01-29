"use client";

import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";
import { AlertDialog as AlertDialogPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";

function AlertDialog({ ...props }: ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

const AlertDialogTrigger = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Trigger>
>(({ ...props }, ref) => {
  return <AlertDialogPrimitive.Trigger ref={ref} data-slot="alert-dialog-trigger" {...props} />;
});
AlertDialogTrigger.displayName = "AlertDialogTrigger";

function AlertDialogPortal({
  ...props
}: ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Portal>) {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />;
}

const AlertDialogOverlay = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => {
  return (
    <AlertDialogPrimitive.Overlay
      ref={ref}
      data-slot="alert-dialog-overlay"
      className={cn(
        "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs fixed inset-0 z-50",
        className
      )}
      {...props}
    />
  );
});
AlertDialogOverlay.displayName = "AlertDialogOverlay";

const AlertDialogContent = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> & {
    size?: "default" | "sm";
    container?: HTMLElement | null;
  }
>(({ className, size = "default", container, ...props }, ref) => {
  return (
    <AlertDialogPortal container={container}>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        ref={ref}
        data-slot="alert-dialog-content"
        data-size={size}
        className={cn(
          "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 bg-background ring-foreground/10 gap-4 rounded-xl p-4 ring-1 duration-100 data-[size=default]:max-w-xs data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-sm group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 outline-none",
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
});
AlertDialogContent.displayName = "AlertDialogContent";

function AlertDialogHeader({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn(
        "grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-4 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]",
        className
      )}
      {...props}
    />
  );
}

function AlertDialogFooter({
  className,
  isFull,
  ...props
}: ComponentPropsWithoutRef<"div"> & { isFull?: boolean }) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        `bg-muted/50 -mx-4 -mb-4 rounded-b-xl border-t p-4 flex flex-col-reverse gap-2 ${!isFull && "group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end"}`,
        className
      )}
      {...props}
    />
  );
}

function AlertDialogMedia({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="alert-dialog-media"
      className={cn(
        "bg-muted mb-2 inline-flex size-10 items-center justify-center rounded-md sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-6",
        className
      )}
      {...props}
    />
  );
}

const AlertDialogTitle = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => {
  return (
    <AlertDialogPrimitive.Title
      ref={ref}
      data-slot="alert-dialog-title"
      className={cn(
        "text-base font-medium sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2",
        className
      )}
      {...props}
    />
  );
});
AlertDialogTitle.displayName = "AlertDialogTitle";

const AlertDialogDescription = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => {
  return (
    <AlertDialogPrimitive.Description
      ref={ref}
      data-slot="alert-dialog-description"
      className={cn(
        "text-muted-foreground *:[a]:hover:text-foreground text-sm text-balance md:text-pretty *:[a]:underline *:[a]:underline-offset-3",
        className
      )}
      {...props}
    />
  );
});
AlertDialogDescription.displayName = "AlertDialogDescription";

const AlertDialogAction = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Action>,
  ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action> &
    Pick<ComponentPropsWithoutRef<typeof Button>, "variant" | "size">
>(({ className, variant = "default", size = "default", ...props }, ref) => {
  return (
    <Button variant={variant} size={size} asChild>
      <AlertDialogPrimitive.Action
        ref={ref}
        data-slot="alert-dialog-action"
        className={cn(className)}
        {...props}
      />
    </Button>
  );
});
AlertDialogAction.displayName = "AlertDialogAction";

const AlertDialogCancel = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Cancel>,
  ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel> &
    Pick<ComponentPropsWithoutRef<typeof Button>, "variant" | "size">
>(({ className, variant = "outline", size = "default", ...props }, ref) => {
  return (
    <Button variant={variant} size={size} asChild>
      <AlertDialogPrimitive.Cancel
        ref={ref}
        data-slot="alert-dialog-cancel"
        className={cn(className)}
        {...props}
      />
    </Button>
  );
});
AlertDialogCancel.displayName = "AlertDialogCancel";
AlertDialog.Action = AlertDialogAction;
AlertDialog.Cancel = AlertDialogCancel;
AlertDialog.Content = AlertDialogContent;
AlertDialog.Description = AlertDialogDescription;
AlertDialog.Footer = AlertDialogFooter;
AlertDialog.Header = AlertDialogHeader;
AlertDialog.Media = AlertDialogMedia;
AlertDialog.Overlay = AlertDialogOverlay;
AlertDialog.Portal = AlertDialogPortal;
AlertDialog.Title = AlertDialogTitle;
AlertDialog.Trigger = AlertDialogTrigger;

export default AlertDialog;
