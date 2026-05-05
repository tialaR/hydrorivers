'use client';

import { FormEvent, useActionState, useEffect, useState } from 'react';
import { CalendarDays, Leaf, MapPin, Package, ShipWheel } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/core/i18n/navigation';
import { Button } from '@/shared/ui/button/button';
import { Card } from '@/shared/ui/card/card';
import {
  publishCargoAction,
  type PublishCargoActionState
} from '@/features/cargo-market/actions/publish-cargo-action';
import { appendRouteSearchParams, routeSearchParams } from '@/shared/routing/route-search-params';
import { intlAppPaths } from '@/shared/routing/app-routes';
import styles from './new-cargo-form.module.scss';

const initialActionState: PublishCargoActionState = { status: 'idle' };

const requiredFieldNames = ['origin', 'destination', 'cargoType', 'volume', 'window', 'targetPrice', 'description'] as const;

function validateRequired(fd: FormData): boolean {
  for (const name of requiredFieldNames) {
    if (!String(fd.get(name) ?? '').trim()) return false;
  }
  return true;
}

export function NewCargoForm() {
  const t = useTranslations('forms');
  const locale = useLocale();
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(publishCargoAction, initialActionState);
  const [clientError, setClientError] = useState<string | null>(null);

  useEffect(() => {
    if (state.status !== 'success') return;
    window.dispatchEvent(new CustomEvent('hydrorivers:mock-changed', { detail: { key: 'cargoes' } }));
    router.push(
      appendRouteSearchParams(intlAppPaths.cargos.myCargos, {
        [routeSearchParams.created]: state.cargoId
      })
    );
  }, [state, router]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const fd = new FormData(event.currentTarget);
    if (!validateRequired(fd)) {
      event.preventDefault();
      setClientError(t('fillAllRequired'));
      return;
    }
    setClientError(null);
  }

  const serverError =
    state.status === 'error'
      ? state.code === 'forbidden'
        ? t('carrierCannotPublish')
        : state.code === 'missing-fields'
          ? t('fillAllRequired')
          : t('publishFailed')
      : null;

  const formError = clientError ?? serverError;

  return (
    <Card className={styles.card}>
      <form
        className={styles.form}
        data-testid="new-cargo-form"
        noValidate
        action={formAction}
        onSubmit={onSubmit}
      >
        <input type="hidden" name="locale" value={locale} />
        <label><span>{t('origin')}</span><div><MapPin size={18} /><input name="origin" required placeholder={t('originPlaceholder')} /></div></label>
        <label><span>{t('destination')}</span><div><MapPin size={18} /><input name="destination" required placeholder={t('destinationPlaceholder')} /></div></label>
        <label><span>{t('cargoType')}</span><div><Package size={18} /><input name="cargoType" required placeholder={t('cargoTypePlaceholder')} /></div></label>
        <label><span>{t('volume')}</span><div><ShipWheel size={18} /><input name="volume" required placeholder={t('volumePlaceholder')} /></div></label>
        <label><span>{t('window')}</span><div><CalendarDays size={18} /><input name="window" required placeholder={t('windowPlaceholder')} /></div></label>
        <label><span>{t('targetPrice')}</span><div><Leaf size={18} /><input name="targetPrice" required placeholder={t('targetPricePlaceholder')} /></div></label>
        <label className={styles.full}><span>{t('description')}</span><textarea name="description" required placeholder={t('descriptionPlaceholder')} /></label>
        {formError ? (
          <p className={styles.formError} role="alert" data-testid="new-cargo-form-error">
            {formError}
          </p>
        ) : null}
        <Button type="submit" className={styles.full} data-testid="new-cargo-submit" loading={isPending} loadingLabel={t('loading')}>
          {t('publish')}
        </Button>
      </form>
    </Card>
  );
}
