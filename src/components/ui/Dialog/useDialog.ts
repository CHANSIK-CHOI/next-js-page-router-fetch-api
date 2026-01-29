import { useContext, createContext } from "react";

type DialogContextValue = {
  container: HTMLElement | null;
};

export const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error("DialogProvider 안에서만 사용하세요");
  }
  return ctx;
}
