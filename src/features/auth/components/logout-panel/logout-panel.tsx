'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/core/i18n/navigation';
import { logout } from '../../services/auth.client';
import styles from './logout-panel.module.scss';

export function LogoutPanel() {
  const t = useTranslations('auth');
  const router = useRouter();
  useEffect(() => { logout().finally(() => router.push('/')); }, [router]);
  return <main className={styles.panel}><h1>{t('logout')}</h1><p>{t('loading')}</p></main>;
}
