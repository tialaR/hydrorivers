'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import { toastConstants } from '@/shared/ui/toast/toast-constants';
import styles from './toast.module.scss';

export type ToastTone = 'success' | 'info' | 'error' | 'warning';

type ToastMessage = {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
};

type ToastContextValue = {
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function dispatchToast(toast: Omit<ToastMessage, 'id'>) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('hydrorivers:toast', { detail: toast }));
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return { showToast: dispatchToast };
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const t = useTranslations('toasts');
  const [items, setItems] = useState<ToastMessage[]>([]);

  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now() + Math.random();
    setItems((current) => [...current, { ...toast, id }].slice(-toastConstants.maxVisibleToasts));
    window.setTimeout(() => {
      setItems((current) => current.filter((item) => item.id !== id));
    }, toast.tone === 'error' ? toastConstants.autoDismissErrorMs : toastConstants.autoDismissMs);
  }, []);

  useEffect(() => {
    const onToast = (event: Event) => showToast((event as CustomEvent<Omit<ToastMessage, 'id'>>).detail);
    window.addEventListener('hydrorivers:toast', onToast);
    return () => window.removeEventListener('hydrorivers:toast', onToast);
  }, [showToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.region} role="status" aria-live="polite" aria-atomic="true">
        {items.map((item) => (
          <div key={item.id} className={`${styles.toast} ${styles[item.tone]}`}>
            <span className={styles.icon}>
              <HydroIcon name={item.tone === 'success' ? 'check' : item.tone === 'error' ? 'shield' : 'info'} size={18} />
            </span>
            <span>
              <strong>{item.title}</strong>
              {item.description ? <small>{item.description}</small> : null}
            </span>
            <button type="button" onClick={() => setItems((current) => current.filter((toast) => toast.id !== item.id))} aria-label={t('close')}>
              <HydroIcon name="close" size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
