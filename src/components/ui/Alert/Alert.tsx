import React, { ReactNode } from "react";
import { AlertDialog, useDialog } from "@/components/ui";

type AlertProps = {
  title?: string | ReactNode;
  description: string | ReactNode;
  actionText?: string;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function Alert({
  title,
  description,
  actionText = "확인",
  open = false,
  onOpenChange,
}: AlertProps) {
  const { container } = useDialog();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Content container={container} size="sm">
        <AlertDialog.Header>
          {title && <AlertDialog.Title>{title}</AlertDialog.Title>}

          <AlertDialog.Description>{description}</AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer isFull>
          <AlertDialog.Action>{actionText}</AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
}
