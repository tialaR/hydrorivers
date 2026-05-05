import { describe, expect, it } from 'vitest';
import { httpStatus } from '@/shared/http/http-status';
import {
  httpStatusToToastBucket,
  httpToastTone,
  humanizedHttpToastMeta,
  type HttpToastContext
} from '@/shared/ui/toast/http-humanized-toast';

describe('http-humanized-toast', () => {
  describe('httpStatusToToastBucket', () => {
    it('mapeia códigos cobertos pelo helper', () => {
      expect(httpStatusToToastBucket(httpStatus.ok)).toBe('success');
      expect(httpStatusToToastBucket(httpStatus.created)).toBe('success');
      expect(httpStatusToToastBucket(httpStatus.badRequest)).toBe('badRequest');
      expect(httpStatusToToastBucket(httpStatus.unauthorized)).toBe('unauthorized');
      expect(httpStatusToToastBucket(httpStatus.forbidden)).toBe('forbidden');
      expect(httpStatusToToastBucket(httpStatus.notFound)).toBe('notFound');
      expect(httpStatusToToastBucket(httpStatus.conflict)).toBe('conflict');
      expect(httpStatusToToastBucket(httpStatus.unprocessableEntity)).toBe('unprocessableEntity');
    });

    it('status desconhecido cai em serverError', () => {
      expect(httpStatusToToastBucket(418)).toBe('serverError');
      expect(httpStatusToToastBucket(httpStatus.internalServerError)).toBe('serverError');
    });
  });

  describe('httpToastTone', () => {
    it('tons por bucket', () => {
      expect(httpToastTone('success')).toBe('success');
      expect(httpToastTone('badRequest')).toBe('warning');
      expect(httpToastTone('unprocessableEntity')).toBe('warning');
      expect(httpToastTone('unauthorized')).toBe('error');
      expect(httpToastTone('serverError')).toBe('error');
    });
  });

  describe('humanizedHttpToastMeta', () => {
    it('generic usa prefixo buckets', () => {
      const m = humanizedHttpToastMeta(httpStatus.notFound, 'generic');
      expect(m).toMatchObject({
        tone: 'error',
        bucket: 'notFound',
        titleKey: 'http.buckets.notFound.title',
        descriptionKey: 'http.buckets.notFound.description'
      });
    });

    it('cargo.publish + 201 usa override cargoPublish.success', () => {
      const m = humanizedHttpToastMeta(httpStatus.created, 'cargo.publish');
      expect(m.titleKey).toBe('http.cargoPublish.success.title');
      expect(m.descriptionKey).toBe('http.cargoPublish.success.description');
      expect(m.tone).toBe('success');
    });

    it('cargo.proposal + 200 usa override cargoProposal.success', () => {
      const m = humanizedHttpToastMeta(httpStatus.ok, 'cargo.proposal');
      expect(m.titleKey).toBe('http.cargoProposal.success.title');
    });

    it('auth.login + 401 usa override authLogin.unauthorized', () => {
      const m = humanizedHttpToastMeta(httpStatus.unauthorized, 'auth.login');
      expect(m.titleKey).toBe('http.authLogin.unauthorized.title');
    });

    it('auth.login + 403 usa override authLogin.forbidden', () => {
      const m = humanizedHttpToastMeta(httpStatus.forbidden, 'auth.login');
      expect(m.titleKey).toBe('http.authLogin.forbidden.title');
    });

    it('contexto cargo.publish sem override usa buckets (404)', () => {
      const m = humanizedHttpToastMeta(httpStatus.notFound, 'cargo.publish');
      expect(m.titleKey).toBe('http.buckets.notFound.title');
    });

    const contexts: HttpToastContext[] = ['generic', 'cargo.publish', 'cargo.proposal', 'auth.login'];
    it.each(contexts)('context %s — meta estável para 422', (ctx) => {
      const m = humanizedHttpToastMeta(httpStatus.unprocessableEntity, ctx);
      expect(m.bucket).toBe('unprocessableEntity');
      expect(m.titleKey).toBe('http.buckets.unprocessableEntity.title');
      expect(m.tone).toBe('warning');
    });
  });
});
