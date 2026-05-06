'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/core/i18n/navigation';
import { intlAppPaths } from '@/shared/routing/app-routes';
import { logout } from '../../services/auth.client';
import styles from './logout-panel.module.scss';

export function LogoutPanel({ ariaLabel }: { ariaLabel?: string }) {
  const t = useTranslations('auth');
  const router = useRouter();
  useEffect(() => {
    logout().finally(() => router.push(intlAppPaths.home));
  }, [router]);
  return (
    <main className={styles.panel} aria-label={ariaLabel}>
      <h1>{t('sessionEnded')}</h1>
      <p>{t('logoutRedirecting')}</p>
    </main>
  );
}
