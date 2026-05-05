'use server';

import { getSessionUser } from '@/shared/server/auth';
import { commitPublishCargo } from '@/features/cargos/server/commit-publish-cargo';
import { routing, type AppLocale } from '@/core/i18n/routing';
import { getTranslations } from 'next-intl/server';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';

export type PublishCargoActionState =
  | { status: 'idle' }
  | { status: 'success'; cargoId: string }
  | { status: 'error'; code: 'unauthenticated' | 'forbidden' | 'missing-fields' | 'unknown' };

function partialCargoFromForm(formData: FormData, draftPublicationLabel: string): Partial<Cargo> {
  const cargoType = String(formData.get('cargoType') ?? '').trim();

  return {
    id: `mock-${Date.now()}`,
    origin: String(formData.get('origin') ?? ''),
    destination: String(formData.get('destination') ?? ''),
    volume: String(formData.get('volume') ?? ''),
    window: String(formData.get('window') ?? ''),
    cargoType,
    status: 'open',
    co2Saving: '-52% CO₂',
    targetPrice: String(formData.get('targetPrice') ?? ''),
    description: String(formData.get('description') ?? ''),
    documents: [draftPublicationLabel]
  };
}

/** Server Action para publicar carga — estado gerido no cliente com `useActionState`. */
export async function publishCargoAction(
  _prevState: PublishCargoActionState,
  formData: FormData
): Promise<PublishCargoActionState> {
  try {
    const user = await getSessionUser();

    const localeRaw = String(formData.get('locale') ?? '');
    const locale = (routing.locales as readonly string[]).includes(localeRaw)
      ? (localeRaw as AppLocale)
      : routing.defaultLocale;

    const common = await getTranslations({ locale, namespace: 'common' });
    const draftPublicationLabel = common('draftPublication');

    const partial = partialCargoFromForm(formData, draftPublicationLabel);
    const result = commitPublishCargo(user, partial);

    if (!result.ok) {
      switch (result.reason) {
        case 'unauthenticated':
          return { status: 'error', code: 'unauthenticated' };
        case 'forbidden-role':
        case 'forbidden-unapproved':
          return { status: 'error', code: 'forbidden' };
        default:
          return { status: 'error', code: 'missing-fields' };
      }
    }

    return { status: 'success', cargoId: result.cargo.id };
  } catch {
    return { status: 'error', code: 'unknown' };
  }
}
