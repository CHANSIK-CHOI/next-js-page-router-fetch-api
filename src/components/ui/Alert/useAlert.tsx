import { useContext, createContext } from "react";
import { type AlertProps } from "@/components/ui";

type AlertContextValue = {
  openAlert: (props: AlertProps) => void;
};

export const AlertContext = createContext<AlertContextValue | null>(null);

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error("AleryProvider 안에서만 사용하세요");
  }
  return ctx;
}
