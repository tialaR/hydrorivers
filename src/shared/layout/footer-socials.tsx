'use client';

import { useTranslations } from 'next-intl';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import { useToast } from '@/shared/ui/toast/toast-provider';
import styles from './app-footer.module.scss';

const socials = [
  { key: 'whatsapp', icon: 'phone' },
  { key: 'instagram', icon: 'instagram' },
  { key: 'twitter', icon: 'twitter' },
  { key: 'support', icon: 'message' }
] as const;

export function FooterSocials() {
  const t = useTranslations('layout.footer');
  const { showToast } = useToast();

  return (
    <div className={styles.social} aria-label={t('social')}>
      {socials.map((item) => (
        <button
          type="button"
          key={item.key}
          aria-label={t(`socials.${item.key}.label`)}
          title={t(`socials.${item.key}.label`)}
          onClick={() => showToast({
            tone: 'info',
            title: t('fakeSocialTitle'),
            description: t(`socials.${item.key}.message`)
          })}
        >
          <HydroIcon name={item.icon} size={17} />
        </button>
      ))}
    </div>
  );
}
