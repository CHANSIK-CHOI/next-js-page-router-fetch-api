import React, { ReactNode } from "react";
import { DialogContext } from "./useDialog";
import AlertProvider from "../Alert/AlertProvider";

type DialogProviderProps = {
  children: ReactNode;
  container: HTMLElement | null;
};

export default function DialogProvider({ children, container }: DialogProviderProps) {
  return (
    <DialogContext.Provider value={{ container }}>
      <AlertProvider>{children}</AlertProvider>
    </DialogContext.Provider>
  );
}
