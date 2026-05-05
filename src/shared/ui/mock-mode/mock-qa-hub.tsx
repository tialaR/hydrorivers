'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/core/i18n/navigation';
import { mockModeLoginAs } from '@/features/auth/services/auth.client';
import type { AppLocale } from '@/shared/routing/route-types';
import type { MockQaPersona } from '@/shared/qa/mock-qa-personas';
import { MOCK_QA_PERSONAS } from '@/shared/qa/mock-qa-personas';
import { QA_LOGIN_PREFILL_STORAGE_KEY } from '@/shared/qa/login-prefill';
import { appRoutes } from '@/shared/routing/app-routes';
import styles from './mock-mode.module.scss';

type Feedback =
  | { kind: 'success'; personaId: MockQaPersona['id'] }
  | { kind: 'error' }
  | null;

export function MockQaHubPersonas() {
  const t = useTranslations('mockMode.qaHub');
  const tRoles = useTranslations('mockMode');
  const locale = useLocale();
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  function fillLogin(persona: MockQaPersona) {
    setFeedback(null);
    try {
      sessionStorage.setItem(
        QA_LOGIN_PREFILL_STORAGE_KEY,
        JSON.stringify({ email: persona.email, password: persona.password })
      );
      window.location.assign(appRoutes.auth.login(locale as AppLocale));
    } catch {
      setFeedback({ kind: 'error' });
    }
  }

  async function loginAsPersona(persona: MockQaPersona) {
    setFeedback(null);
    setPendingId(persona.id);
    try {
      const { redirectTo } = await mockModeLoginAs(persona.mockUserId);
      setFeedback({ kind: 'success', personaId: persona.id });
      window.setTimeout(() => {
        router.push(redirectTo);
        setPendingId(null);
      }, 1400);
    } catch {
      setFeedback({ kind: 'error' });
      setPendingId(null);
    }
  }

  return (
    <>
      {feedback?.kind === 'success' ? (
        <p
          className={`${styles.qaFeedback} ${styles.qaFeedbackSuccess}`}
          role="status"
          data-testid="qa-hub-feedback-success"
        >
          {t(`personas.${feedback.personaId}.feedbackSuccess`)}
        </p>
      ) : null}
      {feedback?.kind === 'error' ? (
        <p className={`${styles.qaFeedback} ${styles.qaFeedbackError}`} role="alert">
          {t('feedbackError')}
        </p>
      ) : null}

      <div className={styles.accountList}>
        {MOCK_QA_PERSONAS.map((persona) => (
          <article key={persona.id} className={`${styles.accountCard} ${styles.qaHubCard}`}>
            <dl className={styles.qaHubFields}>
              <div className={styles.qaHubFieldRow}>
                <dt>{t('fieldLabels.name')}</dt>
                <dd>{t(`personas.${persona.id}.cardName`)}</dd>
              </div>
              <div className={styles.qaHubFieldRow}>
                <dt>{t('fieldLabels.email')}</dt>
                <dd>{persona.email}</dd>
              </div>
              <div className={styles.qaHubFieldRow}>
                <dt>{t('fieldLabels.password')}</dt>
                <dd>
                  <code className={styles.qaHubPassword}>{persona.password}</code>
                </dd>
              </div>
              <div className={styles.qaHubFieldRow}>
                <dt>{t('fieldLabels.role')}</dt>
                <dd>{tRoles(`roles.${persona.role}`)}</dd>
              </div>
              <div className={styles.qaHubFieldRow}>
                <dt>{t('fieldLabels.approved')}</dt>
                <dd>{persona.approved ? t('approvedYes') : t('approvedNo')}</dd>
              </div>
              <div className={styles.qaHubFieldRow}>
                <dt>{t('fieldLabels.company')}</dt>
                <dd>{persona.companyDisplay}</dd>
              </div>
              <div className={styles.qaHubFieldRow}>
                <dt>{t('fieldLabels.testsWhat')}</dt>
                <dd>{t(`personas.${persona.id}.testsWhat`)}</dd>
              </div>
              <div className={styles.qaHubFieldRow}>
                <dt>{t('fieldLabels.mustValidate')}</dt>
                <dd>{t(`personas.${persona.id}.validateLine`)}</dd>
              </div>
              <div className={styles.qaHubFieldRow}>
                <dt>{t('fieldLabels.expectedResult')}</dt>
                <dd>{t(`personas.${persona.id}.expectedLine`)}</dd>
              </div>
            </dl>

            <div className={styles.qaHubActions}>
              <button
                type="button"
                className={styles.qaSecondaryBtn}
                data-testid={`qa-hub-fill-login-${persona.id}`}
                disabled={pendingId !== null}
                onClick={() => fillLogin(persona)}
              >
                {t('useOnLogin')}
              </button>
              <button
                type="button"
                className={styles.caseLink}
                data-testid={`qa-hub-direct-${persona.id}`}
                disabled={pendingId !== null}
                onClick={() => void loginAsPersona(persona)}
              >
                {pendingId === persona.id ? t('signingIn') : t('signInAs')}
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
