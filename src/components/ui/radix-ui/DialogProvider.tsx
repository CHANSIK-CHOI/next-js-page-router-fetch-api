import React, { ReactNode, useContext } from "react";
import { createContext } from "react";

type DialogContextValue = {
  container: HTMLElement | null;
};
type DialogProviderProps = {
  children: ReactNode;
  container: HTMLElement | null;
};

const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error("DialogProvider 안에서만 사용하세요");
  }
  return ctx;
}

export default function DialogProvider({ children, container }: DialogProviderProps) {
  return <DialogContext.Provider value={{ container }}>{children}</DialogContext.Provider>;
}
