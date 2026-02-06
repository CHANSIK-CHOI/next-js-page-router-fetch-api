import { useContext, createContext } from "react";
import { type ConfirmProps } from "@/components/ui";

type ConfirmContextValue = {
  openConfirm: (props: ConfirmProps) => Promise<boolean>;
};

export const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("ConfirmProvider 안에서만 사용하세요");
  }
  return ctx;
}
