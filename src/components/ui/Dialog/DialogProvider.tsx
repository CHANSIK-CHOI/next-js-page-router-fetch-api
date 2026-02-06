import React, { ReactNode } from "react";
import { DialogContext } from "./useDialog";
import { AlertProvider, ConfirmProvider } from "@/components/ui";

type DialogProviderProps = {
  children: ReactNode;
  container: HTMLElement | null;
};

export default function DialogProvider({ children, container }: DialogProviderProps) {
  return (
    <DialogContext.Provider value={{ container }}>
      <ConfirmProvider>
        <AlertProvider>{children}</AlertProvider>
      </ConfirmProvider>
    </DialogContext.Provider>
  );
}
