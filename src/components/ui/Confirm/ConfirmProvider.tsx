import { ReactNode, useCallback, useMemo, useState } from "react";
import { ConfirmContext } from "./useConfirm";
import { Confirm, type ConfirmProps } from "@/components/ui";

type ConfirmProviderProps = {
  children: ReactNode;
};

type ConfirmData = ConfirmProps & {
  id: string;
  resolve: (isConfirmed: boolean) => void;
};

export default function ConfirmProvider({ children }: ConfirmProviderProps) {
  const [confirms, setConfirms] = useState<ConfirmData[]>([]);
  const [openConfirms, setOpenConfirms] = useState<string[]>([]);

  const openConfirm = useCallback((props: ConfirmProps) => {
    return new Promise<boolean>((resolve) => {
      let settled = false;
      const resolveOnce = (isConfirmed: boolean) => {
        if (settled) return;
        settled = true;
        resolve(isConfirmed);
      };
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setConfirms((prev) => [...prev, { id, resolve: resolveOnce, ...props }]);
      setOpenConfirms((prev) => [...prev, id]);
    });
  }, []);

  const removeAlert = useCallback((id: string) => {
    setConfirms((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const value = useMemo(() => ({ openConfirm }), [openConfirm]);
  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {confirms.map((confirm) => {
        const { id, resolve, onOk, onCancel, onMotionComplete, ...rest } = confirm;
        const isOpen = openConfirms.includes(id);
        return (
          <Confirm
            key={id}
            {...rest}
            isOpen={isOpen}
            onOk={() => {
              onOk?.();
              resolve(true);
              setOpenConfirms((prev) => prev.filter((openId) => openId !== id));
            }}
            onCancel={() => {
              onCancel?.();
              resolve(false);
              setOpenConfirms((prev) => prev.filter((openId) => openId !== id));
            }}
            onMotionComplete={(isOpen) => {
              onMotionComplete?.(isOpen);
              if (!isOpen) {
                resolve(false);
                removeAlert(id);
              }
            }}
          />
        );
      })}
    </ConfirmContext.Provider>
  );
}
