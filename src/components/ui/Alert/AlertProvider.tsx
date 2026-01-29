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

  const openAlert = useCallback((props: AlertPayload) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setAlerts((prev) => [...prev, { id, ...props }]);
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const closeAlert = useCallback(
    (id?: string) => {
      if (id) {
        removeAlert(id);
        return;
      }
      console.error("closeAlert을 사용할 때는 id를 매개변수로 전달해주세요.");
    },
    [removeAlert]
  );

  useEffect(() => {
    console.log({ alerts });
  }, [alerts]);

  const value = useMemo(() => ({ openAlert, closeAlert }), [openAlert, closeAlert]);
  return (
    <AlertContext.Provider value={value}>
      {children}
      {alerts.map((alert) => {
        const { id, onCloseComplete, onOpenChange, onOk, ...rest } = alert;
        return (
          <Alert
            key={id}
            {...rest}
            open
            onOpenChange={(open) => {
              onOpenChange?.(open);
              if (!open) {
                onCloseComplete?.();
                removeAlert(id);
              }
            }}
            onOk={() => {
              onOk?.();
              removeAlert(id);
            }}
          />
        );
      })}
    </AlertContext.Provider>
  );
}
