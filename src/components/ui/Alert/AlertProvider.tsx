import { ReactNode, useCallback, useMemo, useState } from "react";
import { AlertContext } from "./useAlert";
import { Alert, type AlertProps } from "@/components/ui";

type AlertProviderProps = {
  children: ReactNode;
};

type AlertData = AlertProps & {
  id: string;
};

export default function AlertProvider({ children }: AlertProviderProps) {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [openAlerts, setOpenAlerts] = useState<string[]>([]);

  const openAlert = useCallback((props: AlertProps) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setAlerts((prev) => [...prev, { id, ...props }]);
    setOpenAlerts((prev) => [...prev, id]);
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const value = useMemo(() => ({ openAlert }), [openAlert]);
  return (
    <AlertContext.Provider value={value}>
      {children}
      {alerts.map((alert) => {
        const { id, onOk, onMotionComplete, ...rest } = alert;
        const isOpen = openAlerts.includes(id);
        return (
          <Alert
            key={id}
            {...rest}
            open={isOpen}
            onOk={() => {
              onOk?.();
              setOpenAlerts((prev) => prev.filter((openId) => openId !== id));
            }}
            onMotionComplete={(isOpen) => {
              onMotionComplete?.(isOpen);
              if (!isOpen) {
                removeAlert(id);
              }
            }}
          />
        );
      })}
    </AlertContext.Provider>
  );
}
