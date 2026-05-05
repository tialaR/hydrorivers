'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/shared/ui/toast/toast-provider';
import { humanizedHttpToastMeta, type HttpToastContext } from '@/shared/ui/toast/http-humanized-toast';

/** Exibe toast a partir de status HTTP + contexto, usando chaves em `messages*.json` → `toasts`. */
export function useHumanizedHttpToast() {
  const t = useTranslations('toasts');
  const { showToast } = useToast();

  const showForHttpStatus = useCallback(
    (status: number, context: HttpToastContext = 'generic', values?: Record<string, string | number>) => {
      const { tone, titleKey, descriptionKey } = humanizedHttpToastMeta(status, context);
      const description = t(descriptionKey, values);
      showToast({
        tone,
        title: t(titleKey, values),
        description: description.trim() ? description : undefined
      });
    },
    [showToast, t]
  );

  return { showForHttpStatus };
}
