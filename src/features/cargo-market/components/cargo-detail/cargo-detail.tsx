'use client';

import { FormEvent, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Card } from '@/shared/ui/card/card';
import { Button } from '@/shared/ui/button/button';
import { Badge } from '@/shared/ui/badge/badge';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import { Tooltip } from '@/shared/ui/tooltip/tooltip';
import { httpStatus } from '@/shared/http/http-status';
import { useHumanizedHttpToast } from '@/shared/ui/toast/use-humanized-http-toast';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import type { CargoViewer } from '@/features/cargo-market/utils/cargo-proposal-visibility';
import { getCargoProposalVisibility } from '@/features/cargo-market/utils/cargo-proposal-visibility';
import { CargoStatusAssistantCard } from '@/features/ai-assist/components/CargoStatusAssistantCard';
import { translateMock } from '@/shared/i18n/mock-content';
import styles from './cargo-detail.module.scss';

function translateCargoType(t: ReturnType<typeof useTranslations>, cargoType: string) {
  switch (cargoType) {
    case 'Refrigerada': return t('cargoTypes.refrigerated');
    case 'Seca': return t('cargoTypes.dry');
    case 'Fracionada': return t('cargoTypes.fractional');
    case 'Projeto': return t('cargoTypes.project');
    case 'Cabotagem': return t('cargoTypes.cabotage');
    case 'Reefer': return t('cargoTypes.reefer');
    case 'Granel leve': return t('cargoTypes.bulkLight');
    default: return cargoType;
  }
}

function translateDocument(t: ReturnType<typeof useTranslations>, name: string) {
  const map: Record<string, string> = {
    'NF-e': t('documentNames.nfe'),
    'CT-e': t('documentNames.cte'),
    Romaneio: t('documentNames.romaneio'),
    DOF: t('documentNames.dof'),
    Manifesto: t('documentNames.manifest'),
    'Declaração de origem': t('documentNames.originDeclaration'),
    'Laudo sanitário': t('documentNames.healthReport'),
    'Documento sanitário': t('documentNames.healthDocument'),
    GTA: t('documentNames.gta'),
    'Controle de temperatura': t('documentNames.temperatureControl'),
    'Checklist de integridade': t('documentNames.integrityChecklist')
  };
  return map[name] ?? name;
}

export function CargoDetail({ cargo, viewer }: { cargo: Cargo; viewer?: CargoViewer | null }) {
  const page = useTranslations('pages.cargoDetail');
  const common = useTranslations('common');
  const locale = useLocale();
  const { showForHttpStatus } = useHumanizedHttpToast();
  const [proposalCount, setProposalCount] = useState(2);
  const [submittingProposal, setSubmittingProposal] = useState(false);

  const cargoType = translateCargoType(common, cargo.cargoType);
  const proposalVisibility = getCargoProposalVisibility(viewer ?? null, cargo);

  async function submitProposal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingProposal) return;

    const fd = new FormData(event.currentTarget);
    const amount = String(fd.get('amount') ?? '').trim();
    if (!amount) {
      showForHttpStatus(httpStatus.badRequest, 'cargo.proposal');
      return;
    }

    setSubmittingProposal(true);
    try {
      const response = await fetch('/api/negociacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cargoId: cargo.id,
          amount,
          // vesselId opcional: API resolve embarcação do carrier quando ausente.
          estimatedTime: String(fd.get('estimatedTime') ?? '').trim() || undefined,
          vesselCompatibility: String(fd.get('vesselCompatibility') ?? '').trim() || undefined,
          contactChannel: String(fd.get('contactChannel') ?? '').trim() || undefined,
          paymentTerms: String(fd.get('operationPlan') ?? '').trim() || undefined,
          proposalMessage: String(fd.get('riskNote') ?? '').trim() || undefined,
          insurance: String(fd.get('riskNote') ?? '').trim() || undefined,
          documents: [String(fd.get('documentCommitment') ?? '').trim()].filter(Boolean)
        })
      });
      showForHttpStatus(response.status, 'cargo.proposal', {
        title: translateMock(locale, cargo.title)
      });
      if (!response.ok) return;
      setProposalCount((value) => value + 1);
      event.currentTarget.reset();
    } catch {
      showForHttpStatus(httpStatus.internalServerError, 'cargo.proposal', {
        title: translateMock(locale, cargo.title)
      });
    } finally {
      setSubmittingProposal(false);
    }
  }

  return (
    <section className={styles.layout}>
      <Card className={styles.heroCard}>
        <div className={styles.heroHeader}>
          <div>
            <span className={styles.kicker}><HydroIcon name="cargo" /> {page('kicker')}</span>
            <h2>{translateMock(locale, cargo.title)}</h2>
            <p className={styles.subtitle}>
              {cargo.origin}
              {common('routeArrow')}
              {cargo.destination}
            </p>
          </div>
          <Badge tone="success"><HydroIcon name="leaf" size={14} /> {cargo.co2Saving}</Badge>
        </div>

        <div className={styles.routeSpotlight}>
          <div className={styles.routeTopline}>
            <strong>
              <HydroIcon name="route" size={18} />{' '}
              {cargo.corridor ?? `${cargo.origin}${common('routeArrow')}${cargo.destination}`}
            </strong>
            {cargo.mainRiver ? <span><HydroIcon name="waves" size={16} /> {common('river')}: {cargo.mainRiver}</span> : null}
          </div>
          <div className={styles.routeFlow}>
            <div className={styles.node}>
              <span className={styles.nodeIcon}><HydroIcon name="dock" size={16} /></span>
              <div><small>{common('origin')}</small><strong>{cargo.origin}</strong></div>
            </div>
            <div className={styles.flowLine} aria-hidden="true"><HydroIcon name="ship" size={18} /><span /></div>
            <div className={styles.node}>
              <span className={`${styles.nodeIcon} ${styles.nodeDestination}`}><HydroIcon name="map" size={16} /></span>
              <div><small>{common('destination')}</small><strong>{cargo.destination}</strong></div>
            </div>
          </div>
          <p className={styles.serviceNote}><HydroIcon name="river" size={16} /> {cargo.serviceType ? translateMock(locale, cargo.serviceType) : cargoType}</p>
        </div>

        <div className={styles.impact}>
          <strong>{cargo.co2Saving}</strong>
          <small>{page('impactDescription')}</small>
        </div>

        <div className={styles.specs}>
          <span><HydroIcon name="cargo" /> {cargo.volume}</span>
          <span><HydroIcon name="clock" /> {translateMock(locale, cargo.window)}</span>
          <span><HydroIcon name="ship" /> {cargo.serviceType ? translateMock(locale, cargo.serviceType) : cargoType}</span>
          <span><HydroIcon name="coin" /> {cargo.targetPrice}</span>
        </div>

        {cargo.description ? <p className={styles.description}>{translateMock(locale, cargo.description)}</p> : null}

        <div className={styles.contextGrid}>
          <div>
            <small>{common('corridor')}</small>
            <strong>{cargo.corridor ?? `${cargo.origin}${common('routeArrow')}${cargo.destination}`}</strong>
          </div>
          <div>
            <small>{common('river')}</small>
            <strong>{cargo.mainRiver ?? common('emptyValue')}</strong>
          </div>
          <div>
            <small>{common('etaConfidence')}</small>
            <strong>{cargo.etaConfidence ? translateMock(locale, cargo.etaConfidence) : common('emptyValue')}</strong>
          </div>
          <div>
            <small>{common('connectivityLabel')}</small>
            <strong>{cargo.connectivity ? common(`connectivity.${cargo.connectivity}`) : common('emptyValue')}</strong>
          </div>
          <div><small>{page('originContext')}</small><strong>{cargo.originContext ? translateMock(locale, cargo.originContext) : page('originFallback')}</strong></div>
          <div><small>{page('proposalCount')}</small><strong>{proposalCount} {page('proposalUnit')}</strong></div>
        </div>
      </Card>

      {cargo.id.trim() ? (
        <div className={styles.assistantRow}>
          <CargoStatusAssistantCard
            cargoId={cargo.id}
            cargoName={translateMock(locale, cargo.title)}
            cargoStatus={cargo.status}
          />
        </div>
      ) : null}

      <Card className={styles.docCard}>
        <div className={styles.docHeader}>
          <div>
            <span className={styles.kicker}><HydroIcon name="shield" /> {page('documentKicker')}</span>
            <h3>{page('documentTitle')}</h3>
            <p>{page('documentDescription')}</p>
          </div>
          {typeof cargo.documentReadiness === 'number' ? <Badge tone="river">{common('documentReadiness', { value: cargo.documentReadiness })}</Badge> : null}
        </div>
        <div className={styles.docList}>
          {(cargo.requiredDocuments ?? []).map((document) => (
            <div key={`${document.name}-${document.status}`} className={styles.docItem}>
              <div className={styles.docMeta}>
                <strong>
                  <Tooltip label={document.note ? translateMock(locale, document.note) : page('documentTooltip')}>
                    <span><HydroIcon name="document" size={16} /> {translateDocument(common, document.name)}</span>
                  </Tooltip>
                </strong>
                {document.note ? <small>{translateMock(locale, document.note)}</small> : null}
              </div>
              <Badge tone={document.status === 'required' ? 'warning' : document.status === 'ok' ? 'success' : 'river'}>
                {common(`documentStatus.${document.status}`)}
              </Badge>
            </div>
          ))}
        </div>
        {cargo.operationalRisks?.length ? (
          <div className={styles.riskBox}>
            <strong><HydroIcon name="shield" size={17} /> {page('riskTitle')}</strong>
            <ul>{cargo.operationalRisks.map((risk) => <li key={risk}>{translateMock(locale, risk)}</li>)}</ul>
          </div>
        ) : null}
      </Card>

      {proposalVisibility.kind === 'show_form' ? (
        <Card className={styles.formCard} data-testid="cargo-proposal-form">
          <form className={styles.form} onSubmit={submitProposal}>
            <h3>{page('sendProposal')}</h3>
            <label>{page('amount')}<input name="amount" required placeholder={cargo.targetPrice} inputMode="decimal" /></label>
            <label>{page('estimatedTime')}<input name="estimatedTime" placeholder={page('estimatedTimePlaceholder')} /></label>
            <label>{page('vesselCompatibility')}<input name="vesselCompatibility" placeholder={page('vesselCompatibilityPlaceholder')} /></label>
            <label>{page('documentCommitment')}<select name="documentCommitment" defaultValue="ready"><option value="ready">{page('documentReady')}</option><option value="pending">{page('documentPending')}</option></select></label>
            <label>{page('operationPlan')}<input name="operationPlan" placeholder={page('operationPlanPlaceholder')} /></label>
            <label>{page('contactChannel')}<input name="contactChannel" placeholder={page('contactChannelPlaceholder')} /></label>
            <label>{page('riskNote')}<textarea name="riskNote" placeholder={page('notesPlaceholder')} /></label>
            <Button type="submit" loading={submittingProposal} loadingLabel={page('simulateProposal')}><HydroIcon name="message" size={17} /> {page('simulateProposal')}</Button>
          </form>
        </Card>
      ) : proposalVisibility.kind === 'shipper_owner' ? (
        <Card className={styles.formCard} data-testid="cargo-owner-awaiting-card">
          <div className={styles.ownerAwaiting}>
            <HydroIcon name="cargo" size={22} />
            <h3>{page('ownerAwaitingTitle')}</h3>
            <p>{page('ownerAwaitingDescription')}</p>
          </div>
        </Card>
      ) : proposalVisibility.kind === 'carrier_pending_approval' ? (
        <Card className={styles.formCard} data-testid="cargo-proposal-carrier-pending-card">
          <div className={styles.ownerAwaiting}>
            <HydroIcon name="shield" size={22} />
            <h3>{page('carrierPendingTitle')}</h3>
            <p>{page('carrierPendingDescription')}</p>
          </div>
        </Card>
      ) : (
        <Card className={styles.formCard} data-testid="cargo-proposal-admin-card">
          <div className={styles.ownerAwaiting}>
            <HydroIcon name="shield" size={22} />
            <h3>{page('adminNoProposalTitle')}</h3>
            <p>{page('adminNoProposalDescription')}</p>
          </div>
        </Card>
      )}
    </section>
  );
}
