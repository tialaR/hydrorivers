'use client';

import { FormEvent, useRef, useState } from 'react';
import { Building2, Camera, CheckCircle2, Mail, ShieldCheck } from 'lucide-react';
import NextImage from 'next/image';
import { useTranslations } from 'next-intl';
import { Card } from '@/shared/ui/card/card';
import { Badge } from '@/shared/ui/badge/badge';
import { Button } from '@/shared/ui/button/button';
import { useAuthSession } from '../../hooks/use-auth-session';
import { updateProfile } from '../../services/auth.client';
import type { HydroUser } from '../../domain/auth.types';
import styles from './profile-panel.module.scss';

type ProfileFormState = Pick<HydroUser, 'name' | 'email' | 'company' | 'phone' | 'city' | 'avatarUrl'>;

const emptyProfile: ProfileFormState = {
  name: '',
  email: '',
  company: '',
  phone: '',
  city: '',
  avatarUrl: ''
};

async function fileToOptimizedJpegDataUrl(file: File) {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = objectUrl;
    });

    const maxSize = 640;
    const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('canvas-context-unavailable');

    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', 0.84);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}


function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'HR';
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : parts[0]?.[1] ?? '';
  return `${first}${last}`.toUpperCase();
}

export function ProfilePanel() {
  const t = useTranslations('pages.profile');
  const perfil = useTranslations('pages.perfil');
  const auth = useTranslations('auth');
  const { user, ready } = useAuthSession();
  const [draftByUser, setDraftByUser] = useState<Record<string, ProfileFormState>>({});
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [avatarPreviewFailedSrc, setAvatarPreviewFailedSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const baseProfile: ProfileFormState = user ? {
    name: user.name,
    email: user.email,
    company: user.company,
    phone: user.phone ?? '',
    city: user.city ?? '',
    avatarUrl: user.avatarUrl ?? ''
  } : emptyProfile;

  const profile = user ? (draftByUser[user.id] ?? baseProfile) : emptyProfile;
  const avatarPreviewAvailable = Boolean(profile.avatarUrl) && avatarPreviewFailedSrc !== profile.avatarUrl;

  function updateField(field: keyof ProfileFormState, value: string) {
    if (!user) return;
    setSaved(false);
    setDraftByUser((current) => ({
      ...current,
      [user.id]: { ...(current[user.id] ?? baseProfile), [field]: value }
    }));
  }

  async function persistProfile(nextProfile: ProfileFormState) {
    if (!user) return;
    const updated = await updateProfile({
      ...user,
      ...nextProfile,
      avatarUrl: nextProfile.avatarUrl || undefined
    });

    setDraftByUser((current) => ({
      ...current,
      [user.id]: {
        name: updated.name,
        email: updated.email,
        company: updated.company,
        phone: updated.phone ?? '',
        city: updated.city ?? '',
        avatarUrl: updated.avatarUrl ?? ''
      }
    }));
    setSaved(true);
  }

  function resetFileInput() {
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleAvatarUpload(file: File | undefined) {
    if (!file || !user) return;

    setAvatarError('');

    const isJpeg = file.type === 'image/jpeg' || /\.(jpe?g)$/i.test(file.name);
    if (!isJpeg) {
      setAvatarError(auth('avatarInvalidType'));
      setSaved(false);
      resetFileInput();
      return;
    }

    try {
      const avatarUrl = await fileToOptimizedJpegDataUrl(file);
      setDraftByUser((current) => ({
        ...current,
        [user.id]: { ...(current[user.id] ?? baseProfile), avatarUrl }
      }));
      setSaved(false);
      resetFileInput();
    } catch {
      setAvatarError(auth('avatarReadError'));
      resetFileInput();
    }
  }

  function removeAvatar() {
    if (!user) return;
    setAvatarError('');
    setDraftByUser((current) => ({
      ...current,
      [user.id]: { ...(current[user.id] ?? baseProfile), avatarUrl: '' }
    }));
    setSaved(false);
    resetFileInput();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    setAvatarError('');

    setPending(true);

    try {
      await persistProfile(profile);
    } catch {
      setAvatarError(auth('avatarSaveError'));
    } finally {
      setPending(false);
    }
  }

  if (!ready) {
    return (
      <main className={styles.shell} aria-label={perfil('mainAriaLabel')}>
        <p className={styles.eyebrow}>{t('eyebrow')}</p>
        <h1>{t('loading')}</h1>
      </main>
    );
  }

  if (!user) {
    return (
      <main className={styles.shell} aria-label={perfil('mainAriaLabel')}>
        <p className={styles.eyebrow}>{t('eyebrow')}</p>
        <h1>{t('loginRequired')}</h1>
        <span>{t('loginRequiredDescription')}</span>
      </main>
    );
  }

  return (
    <main className={styles.shell} aria-label={perfil('mainAriaLabel')}>
      <p className={styles.eyebrow}>{t('eyebrow')}</p><h1>{t('title')}</h1><span>{t('description')}</span>
      <section className={styles.grid}>
        <Card className={styles.identity}>
          <div className={styles.avatar}>{avatarPreviewAvailable ? <NextImage src={profile.avatarUrl ?? ''} alt="" width={120} height={120} unoptimized onError={() => setAvatarPreviewFailedSrc(profile.avatarUrl ?? null)} /> : <span>{getInitials(profile.name)}</span>}</div>
          <h2>{profile.name}</h2>
          <p>{profile.company}</p>
          <Badge tone={user.approved ? 'success' : 'warning'}>{user.approved ? t('approved') : t('pending')}</Badge>
        </Card>
        <Card className={styles.details}>
          <div className={styles.row}><Mail /><div><small>{auth('email')}</small><strong>{profile.email}</strong></div></div>
          <div className={styles.row}><Building2 /><div><small>{auth('company')}</small><strong>{profile.company}</strong></div></div>
          <div className={styles.row}><ShieldCheck /><div><small>{t('role')}</small><strong>{auth(user.role)}</strong></div></div>
          <div className={styles.row}><CheckCircle2 /><div><small>{t('manualValidation')}</small><strong>{user.approved ? t('readyForPilot') : t('awaitingReview')}</strong></div></div>
        </Card>
        <Card className={styles.formCard}>
          <h2>{t('personalDetails')}</h2>
          <form className={styles.form} onSubmit={onSubmit}>
            <label><span>{auth('name')}</span><input name="name" value={profile.name} onChange={(event) => updateField('name', event.target.value)} /></label>
            <label><span>{auth('email')}</span><input name="email" type="email" value={profile.email} onChange={(event) => updateField('email', event.target.value)} /></label>
            <label><span>{auth('company')}</span><input name="company" value={profile.company} onChange={(event) => updateField('company', event.target.value)} /></label>
            <label><span>{t('phone')}</span><input name="phone" value={profile.phone ?? ''} onChange={(event) => updateField('phone', event.target.value)} placeholder={t('phonePlaceholder')} /></label>
            <label><span>{t('baseCity')}</span><input name="city" value={profile.city ?? ''} onChange={(event) => updateField('city', event.target.value)} placeholder={t('baseCityPlaceholder')} /></label>
            <div className={`${styles.full} ${styles.avatarUpload}`}>
              <span>{auth('avatar')}</span>
              <div className={styles.uploadRow}>
                <button type="button" className={styles.uploadButton} onClick={() => fileInputRef.current?.click()}>
                  <Camera size={18} />
                  <span>{auth('avatarUpload')}</span>
                </button>
                <input ref={fileInputRef} className={styles.hiddenFileInput} type="file" accept="image/jpeg,.jpg,.jpeg" onChange={(event) => handleAvatarUpload(event.target.files?.[0])} />
                {profile.avatarUrl ? <button type="button" className={styles.removeAvatar} onClick={removeAvatar}>{auth('removeAvatar')}</button> : null}
              </div>
              <input name="avatarUrl" value={profile.avatarUrl ?? ''} onChange={(event) => updateField('avatarUrl', event.target.value)} placeholder={auth('avatarUrlPlaceholder')} />
              {avatarError ? <small className={styles.error}>{avatarError}</small> : <small>{auth('avatarHelp')}</small>}
            </div>
            <Button className={styles.full} loading={pending} loadingLabel={auth('loading')}>{saved ? auth('saved') : auth('saveProfile')}</Button>
          </form>
        </Card>
      </section>
    </main>
  );
}
