import { httpStatus } from '@/shared/http/http-status';
import type { ToastTone } from '@/shared/ui/toast/toast-provider';

/** Contexto de produto para mensagens; alinhado a cenários da API e formulários. */
export type HttpToastContext = 'generic' | 'cargo.publish' | 'cargo.proposal' | 'auth.login';

export type HttpToastBucket =
  | 'success'
  | 'badRequest'
  | 'unauthorized'
  | 'forbidden'
  | 'notFound'
  | 'conflict'
  | 'unprocessableEntity'
  | 'serverError';

const CONTEXT_TO_SEGMENT: Record<Exclude<HttpToastContext, 'generic'>, string> = {
  'cargo.publish': 'cargoPublish',
  'cargo.proposal': 'cargoProposal',
  'auth.login': 'authLogin'
};

/** Chaves `http.<segment>.<bucket>` com cópia específica; demais usam `http.buckets.<bucket>`. */
const OVERRIDE_PREFIX = new Set<string>([
  'cargoPublish:success',
  'cargoProposal:success',
  'authLogin:unauthorized',
  'authLogin:forbidden'
]);

export function httpStatusToToastBucket(status: number): HttpToastBucket {
  if (status === httpStatus.ok || status === httpStatus.created) return 'success';
  if (status === httpStatus.badRequest) return 'badRequest';
  if (status === httpStatus.unauthorized) return 'unauthorized';
  if (status === httpStatus.forbidden) return 'forbidden';
  if (status === httpStatus.notFound) return 'notFound';
  if (status === httpStatus.conflict) return 'conflict';
  if (status === httpStatus.unprocessableEntity) return 'unprocessableEntity';
  return 'serverError';
}

export function httpToastTone(bucket: HttpToastBucket): ToastTone {
  if (bucket === 'success') return 'success';
  if (bucket === 'badRequest' || bucket === 'unprocessableEntity') return 'warning';
  return 'error';
}

/** Prefixo relativo ao namespace `toasts` (ex.: `http.buckets.notFound`). */
function humanizedHttpToastMessagePrefix(status: number, context: HttpToastContext): string {
  const bucket = httpStatusToToastBucket(status);
  if (context !== 'generic') {
    const seg = CONTEXT_TO_SEGMENT[context];
    if (OVERRIDE_PREFIX.has(`${seg}:${bucket}`)) return `http.${seg}.${bucket}`;
  }
  return `http.buckets.${bucket}`;
}

/** Metadados para `useTranslations('toasts')` + `showToast`. */
export function humanizedHttpToastMeta(
  status: number,
  context: HttpToastContext = 'generic'
): {
  tone: ToastTone;
  titleKey: string;
  descriptionKey: string;
  bucket: HttpToastBucket;
} {
  const bucket = httpStatusToToastBucket(status);
  const prefix = humanizedHttpToastMessagePrefix(status, context);
  return {
    bucket,
    tone: httpToastTone(bucket),
    titleKey: `${prefix}.title`,
    descriptionKey: `${prefix}.description`
  };
}
