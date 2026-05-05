'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { CargoViewer } from '@/features/cargo-market/utils/cargo-proposal-visibility';
import { CargoDetail } from './cargo-detail';
import { readCargoes } from '@/features/marketplace/services/marketplace.client';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { Card } from '@/shared/ui/card/card';

export function CargoDetailLoader({
  id,
  initialCargo,
  viewer
}: {
  id: string;
  initialCargo?: Cargo;
  viewer?: CargoViewer | null;
}) {
  const t = useTranslations('pages.cargoDetail');
  const [cargo, setCargo] = useState<Cargo | undefined>(initialCargo);

  useEffect(() => {
    let active = true;
    readCargoes()
      .then((items) => {
        const found = items.find((item) => item.id === id);
        if (active && found) setCargo(found);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [id]);

  if (!cargo) return <Card style={{ borderWidth: 3 }}><h2>{t('notFoundTitle')}</h2><p>{t('notFoundDescription')}</p></Card>;
  return <CargoDetail cargo={cargo} viewer={viewer} />;
}
