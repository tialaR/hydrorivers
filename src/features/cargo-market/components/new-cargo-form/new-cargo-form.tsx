'use client';

import { FormEvent, useState } from 'react';
import { CalendarDays, Leaf, MapPin, Package, ShipWheel } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button/button';
import { Card } from '@/shared/ui/card/card';
import { persistCargo } from '@/features/marketplace/services/marketplace.client';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import styles from './new-cargo-form.module.scss';

export function NewCargoForm() {
  const t = useTranslations('forms');
  const common = useTranslations('common');
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const form = new FormData(event.currentTarget);
    const title = String(form.get('cargoType') || t('fallbackCargoTitle'));
    const cargo: Cargo = {
      id: `mock-${Date.now()}`,
      title,
      origin: String(form.get('origin')),
      destination: String(form.get('destination')),
      volume: String(form.get('volume')),
      window: String(form.get('window')),
      cargoType: String(form.get('cargoType')),
      status: 'open',
      co2Saving: '-52% CO₂',
      targetPrice: String(form.get('targetPrice')),
      description: String(form.get('description')),
      producer: common('mockUser'),
      documents: [common('draftPublication')]
    };
    try {
      await persistCargo(cargo);
      setSubmitted(true);
      event.currentTarget.reset();
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className={styles.card}>
      <form className={styles.form} onSubmit={onSubmit}>
        <label><span>{t('origin')}</span><div><MapPin size={18} /><input name="origin" required placeholder={t('originPlaceholder')} /></div></label>
        <label><span>{t('destination')}</span><div><MapPin size={18} /><input name="destination" required placeholder={t('destinationPlaceholder')} /></div></label>
        <label><span>{t('cargoType')}</span><div><Package size={18} /><input name="cargoType" required placeholder={t('cargoTypePlaceholder')} /></div></label>
        <label><span>{t('volume')}</span><div><ShipWheel size={18} /><input name="volume" required placeholder={t('volumePlaceholder')} /></div></label>
        <label><span>{t('window')}</span><div><CalendarDays size={18} /><input name="window" required placeholder={t('windowPlaceholder')} /></div></label>
        <label><span>{t('targetPrice')}</span><div><Leaf size={18} /><input name="targetPrice" required placeholder={t('targetPricePlaceholder')} /></div></label>
        <label className={styles.full}><span>{t('description')}</span><textarea name="description" required placeholder={t('descriptionPlaceholder')} /></label>
        <Button className={styles.full} loading={pending} loadingLabel={t('loading')}>{submitted ? common('published') : t('publish')}</Button>
      </form>
    </Card>
  );
}
