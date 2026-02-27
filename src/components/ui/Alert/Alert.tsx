import React, { ReactNode } from "react";
import { AlertDialog, useDialog } from "@/components/ui";
import classNames from "classnames";

export type AlertProps = {
  title?: string | ReactNode;
  description: string | ReactNode;
  actionText?: string;
  isOpen?: boolean;
  onOk?: () => void;
  onMotionComplete?: (isOpen: boolean) => void;
};

export default function Alert({
  title,
  description,
  actionText = "확인",
  isOpen = false,
  onOk,
  onMotionComplete,
}: AlertProps) {
  const { container } = useDialog();

  const handleAnimationEnd = (event: React.AnimationEvent<HTMLElement>) => {
    const state = event.currentTarget.getAttribute("data-state");
    const isDialogOpen = state === "open";
    onMotionComplete?.(isDialogOpen);
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialog.Content container={container} size="sm" onAnimationEnd={handleAnimationEnd}>
        <AlertDialog.Header>
          <AlertDialog.Title
            className={classNames({
              "sr-only": !title,
            })}
          >
            {title}
          </AlertDialog.Title>

          <AlertDialog.Description className="whitespace-pre-line">
            {description}
          </AlertDialog.Description>
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
