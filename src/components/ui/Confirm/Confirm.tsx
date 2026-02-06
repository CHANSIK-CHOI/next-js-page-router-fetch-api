import React, { ReactNode } from "react";
import { AlertDialog, useDialog } from "@/components/ui";
import classNames from "classnames";

export type ConfirmProps = {
  title?: string | ReactNode;
  description: string | ReactNode;
  actionText?: string;
  cancelText?: string;
  open?: boolean;
  onOk?: () => void;
  onCancel?: () => void;
  onMotionComplete?: (isOpen: boolean) => void;
};

export default function Confirm({
  title,
  description,
  actionText = "확인",
  cancelText = "취소",
  open = false,
  onOk,
  onCancel,
  onMotionComplete,
}: ConfirmProps) {
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
        <AlertDialog.Footer>
          <AlertDialog.Cancel onClick={onCancel}>{cancelText}</AlertDialog.Cancel>
          <AlertDialog.Action autoFocus onClick={onOk}>
            {actionText}
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
}
