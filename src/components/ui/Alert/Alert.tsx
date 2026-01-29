import React, { ReactNode } from "react";
import { AlertDialog, useDialog } from "@/components/ui";

export type AlertProps = {
  title?: string | ReactNode;
  description: string | ReactNode;
  actionText?: string;
  open?: boolean;
  onOk?: () => void;
  onMotionComplete?: (isOpen: boolean) => void;
};

export default function Alert({
  title,
  description,
  actionText = "확인",
  open = false,
  onOk,
  onMotionComplete,
}: AlertProps) {
  const { container } = useDialog();

  const handleAnimationEnd = (event: React.AnimationEvent<HTMLElement>) => {
    const state = event.currentTarget.getAttribute("data-state");
    const isOpen = state === "open";
    onMotionComplete?.(isOpen);
  };

  return (
    <AlertDialog open={open}>
      <AlertDialog.Content container={container} size="sm" onAnimationEnd={handleAnimationEnd}>
        <AlertDialog.Header>
          {title && <AlertDialog.Title>{title}</AlertDialog.Title>}

          <AlertDialog.Description>{description}</AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer isFull>
          <AlertDialog.Action autoFocus onClick={onOk}>
            {actionText}
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
}
