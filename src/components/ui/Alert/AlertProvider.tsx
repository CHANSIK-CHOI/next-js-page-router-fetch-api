import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { AlertContext } from "./useAlert";
import { Alert, type AlertProps } from "@/components/ui";

type AlertProviderProps = {
  children: ReactNode;
};

type AlertPayload = AlertProps & {
  onCloseComplete?: () => void;
};

type AlertData = AlertPayload & {
  id: string;
};

export default function AlertProvider({ children }: AlertProviderProps) {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [openAlerts, setOpenAlerts] = useState<string[]>([]);

  const openAlert = useCallback((props: AlertPayload) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setAlerts((prev) => [...prev, { id, ...props }]);
    setOpenAlerts((prev) => [...prev, id]);
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const closeWithAnimation = useCallback(
    (id: string, onCloseComplete?: () => void) => {
      setOpenAlerts((prev) => prev.filter((openId) => openId !== id));
      window.setTimeout(() => {
        onCloseComplete?.();
        removeAlert(id);
      }, 140);
    },
    [removeAlert]
  );

  const value = useMemo(() => ({ openAlert }), [openAlert]);
  return (
    <AlertContext.Provider value={value}>
      {children}
      {alerts.map((alert) => {
        const { id, onOk, onCloseComplete, ...rest } = alert;
        const isOpen = openAlerts.includes(id);
        return (
          <Alert
            key={id}
            {...rest}
            open={isOpen}
            onOk={() => {
              onOk?.();
              closeWithAnimation(id, onCloseComplete);
            }}
          />
        );
      })}
    </AlertContext.Provider>
  );
}
