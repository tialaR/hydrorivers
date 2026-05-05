'use client';

import { LogOut } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/core/i18n/navigation';
import { intlAppPaths } from '@/shared/routing/app-routes';
import { useAuthSession } from '../../hooks/use-auth-session';
import { logout } from '../../services/auth.client';
import styles from './auth-actions.module.scss';


function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'HR';
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : parts[0]?.[1] ?? '';
  return `${first}${last}`.toUpperCase();
}

function UserAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const canRenderAvatar = Boolean(avatarUrl) && failedSrc !== avatarUrl;

  if (avatarUrl && canRenderAvatar) {
    return (
      <Image
        src={avatarUrl}
        alt=""
        width={40}
        height={40}
        unoptimized
        onError={() => setFailedSrc(avatarUrl)}
      />
    );
  }

  return <span>{getInitials(name)}</span>;
}

export function AuthActions() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { user, ready } = useAuthSession();

  if (!ready) return <span className={styles.skeleton} aria-hidden="true" />;

  if (!user) {
    return (
      <div className={styles.actions}>
        <Link href={intlAppPaths.auth.login} className={styles.login}>{t('login')}</Link>
        <Link href={intlAppPaths.auth.register} className={styles.signup}>{t('signup')}</Link>
      </div>
    );
  }

  return (
    <div className={styles.session}>
      <Link href={intlAppPaths.auth.profile} className={styles.avatar} aria-label={t('profile')} title={user.name}>
        <UserAvatar name={user.name} avatarUrl={user.avatarUrl} />
      </Link>
      <button
        className={styles.logout}
        onClick={async () => { await logout(); router.push(intlAppPaths.home); }}
        aria-label={t('logout')}
      >
        <LogOut size={16} />
      </button>
    </div>
  );
}
