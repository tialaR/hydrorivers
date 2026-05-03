'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { readCargoes } from '@/features/marketplace/services/marketplace.client';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import { CargoCard } from '../cargo-card/cargo-card';
import styles from './cargo-list.module.scss';

const PAGE_SIZE = 10;
const SHEET_CLOSE_MS = 220;
const SHEET_CLOSE_THRESHOLD = 120;
const SHEET_FULL_THRESHOLD = 72;
const SHEET_HALF_THRESHOLD = 72;

type FilterKey = 'query' | 'corridor' | 'origin' | 'destination' | 'type' | 'family' | 'document';
type FilterState = Record<FilterKey, string>;

type SheetState = 'closed' | 'open' | 'closing';
type SheetSnap = 'half' | 'full';

const emptyFilters: FilterState = { query: '', corridor: '', origin: '', destination: '', type: '', family: '', document: '' };

function uniqueOptions(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function activeCount(filters: FilterState) {
  return Object.values(filters).filter(Boolean).length;
}

function normalize(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

export function CargoList({ cargoes }: { cargoes: Cargo[] }) {
  const t = useTranslations('common');
  const f = useTranslations('forms');
  const [items, setItems] = useState(cargoes);
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [page, setPage] = useState(1);
  const [sheetState, setSheetState] = useState<SheetState>('closed');
  const [sheetSnap, setSheetSnap] = useState<SheetSnap>('half');
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    corridor: true,
    origin: false,
    destination: false,
    cargo: true,
    compliance: false
  });

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragStartYRef = useRef<number | null>(null);
  const dragDeltaRef = useRef(0);
  const dragPointerRef = useRef<number | null>(null);
  const lockedScrollYRef = useRef(0);

  const sheetVisible = sheetState !== 'closed';
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    const refresh = () => { readCargoes().then(setItems).catch(() => setItems(cargoes)); };
    refresh();
    window.addEventListener('hydrorivers:mock-changed', refresh);
    return () => window.removeEventListener('hydrorivers:mock-changed', refresh);
  }, [cargoes]);

  useEffect(() => {
    if (!sheetVisible) return undefined;

    const scrollY = window.scrollY;
    lockedScrollYRef.current = scrollY;

    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyPosition = document.body.style.position;
    const previousBodyTop = document.body.style.top;
    const previousBodyWidth = document.body.style.width;
    const previousBodyTouchAction = document.body.style.touchAction;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousHtmlOverscroll = document.documentElement.style.overscrollBehavior;

    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.overscrollBehavior = 'none';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.touchAction = 'none';

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.documentElement.style.overscrollBehavior = previousHtmlOverscroll;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.position = previousBodyPosition;
      document.body.style.top = previousBodyTop;
      document.body.style.width = previousBodyWidth;
      document.body.style.touchAction = previousBodyTouchAction;
      window.scrollTo(0, lockedScrollYRef.current);
    };
  }, [sheetVisible]);

  useEffect(() => () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
  }, []);

  useEffect(() => {
    if (!sheetVisible) return undefined;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        requestCloseSheet();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [sheetVisible]);

  const options = useMemo(() => ({
    corridors: uniqueOptions(items.map((cargo) => cargo.corridor ?? '')),
    origins: uniqueOptions(items.map((cargo) => cargo.origin)),
    destinations: uniqueOptions(items.map((cargo) => cargo.destination)),
    types: uniqueOptions(items.map((cargo) => cargo.cargoType)),
    families: uniqueOptions(items.map((cargo) => cargo.productFamily ?? '')),
    documents: uniqueOptions(items.flatMap((cargo) => cargo.requiredDocuments?.map((doc) => doc.name) ?? cargo.documents ?? []))
  }), [items]);

  const filtered = useMemo(() => items.filter((cargo) => {
    const haystack = normalize(`${cargo.title} ${cargo.origin} ${cargo.destination} ${cargo.cargoType} ${cargo.producer ?? ''} ${cargo.corridor ?? ''} ${cargo.mainRiver ?? ''} ${cargo.originContext ?? ''}`);
    const documents = cargo.requiredDocuments?.map((doc) => doc.name) ?? cargo.documents ?? [];

    return (!filters.query || haystack.includes(normalize(filters.query)))
      && (!filters.corridor || cargo.corridor === filters.corridor)
      && (!filters.origin || cargo.origin === filters.origin)
      && (!filters.destination || cargo.destination === filters.destination)
      && (!filters.type || cargo.cargoType === filters.type)
      && (!filters.family || cargo.productFamily === filters.family)
      && (!filters.document || documents.includes(filters.document));
  }), [items, filters]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const count = activeCount(filters);

  function setFilter(key: FilterKey, value: string) {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function clearAll() {
    setPage(1);
    setFilters(emptyFilters);
  }

  function toggleSection(section: string) {
    setOpenSections((current) => ({ ...current, [section]: !current[section] }));
  }

  function openFilters(event?: { preventDefault: () => void; stopPropagation: () => void }) {
    event?.preventDefault();
    event?.stopPropagation();

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setDragOffset(0);
    setDragging(false);
    setSheetSnap('full');
    setSheetState('open');
  }

  function requestCloseSheet() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }

    setDragOffset(0);
    setDragging(false);
    setSheetState('closing');
    closeTimerRef.current = setTimeout(() => {
      setSheetSnap('full');
      setSheetState('closed');
      closeTimerRef.current = null;
    }, SHEET_CLOSE_MS);
  }

  function handleSheetDragStart(event: ReactPointerEvent<HTMLElement>) {
    dragStartYRef.current = event.clientY;
    dragDeltaRef.current = 0;
    dragPointerRef.current = event.pointerId;
    setDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handleSheetDragMove(event: ReactPointerEvent<HTMLElement>) {
    if (dragStartYRef.current === null) return;

    const delta = event.clientY - dragStartYRef.current;
    dragDeltaRef.current = delta;

    if (delta > 0) {
      setDragOffset(delta);
    } else {
      setDragOffset(0);
    }
  }

  function handleSheetDragEnd(event: ReactPointerEvent<HTMLElement>) {
    if (dragStartYRef.current === null) return;

    const delta = dragDeltaRef.current;
    dragStartYRef.current = null;
    dragDeltaRef.current = 0;
    setDragging(false);

    if (dragPointerRef.current !== null) {
      event.currentTarget.releasePointerCapture?.(dragPointerRef.current);
      dragPointerRef.current = null;
    }

    if (sheetSnap === 'full') {
      if (delta > SHEET_CLOSE_THRESHOLD) {
        setSheetSnap('half');
      } else if (delta < -SHEET_FULL_THRESHOLD) {
        setSheetSnap('full');
      }
      setDragOffset(0);
      return;
    }

    if (delta > SHEET_CLOSE_THRESHOLD) {
      requestCloseSheet();
      return;
    }

    if (delta < -SHEET_FULL_THRESHOLD) {
      setSheetSnap('full');
    } else if (delta > SHEET_HALF_THRESHOLD) {
      requestCloseSheet();
      return;
    } else {
      setSheetSnap('half');
    }

    setDragOffset(0);
  }

  function displayValue(key: FilterKey, value: string) {
    if (key === 'type') {
      switch (value) {
        case 'Refrigerada': return t('cargoTypes.refrigerated');
        case 'Seca': return t('cargoTypes.dry');
        case 'Fracionada': return t('cargoTypes.fractional');
        case 'Projeto': return t('cargoTypes.project');
        case 'Cabotagem': return t('cargoTypes.cabotage');
        case 'Reefer': return t('cargoTypes.reefer');
        case 'Granel leve': return t('cargoTypes.bulkLight');
        default: return value;
      }
    }

    if (key === 'family') return t(`productFamilies.${value}`);
    return value;
  }

  function renderOptionGroup(key: FilterKey, values: string[]) {
    return (
      <div className={styles.optionGrid} role="listbox" aria-label={key}>
        <button
          type="button"
          className={!filters[key] ? styles.optionButtonActive : styles.optionButton}
          onClick={() => setFilter(key, '')}
          aria-pressed={!filters[key]}
        >
          {t('all')}
        </button>
        {values.map((value) => (
          <button
            key={value}
            type="button"
            className={filters[key] === value ? styles.optionButtonActive : styles.optionButton}
            onClick={() => setFilter(key, value)}
            aria-pressed={filters[key] === value}
          >
            {displayValue(key, value)}
          </button>
        ))}
      </div>
    );
  }

  function activeSectionCount(keys: FilterKey[]) {
    return keys.filter((key) => filters[key]).length;
  }

  function renderAccordion(id: string, icon: string, title: string, keys: FilterKey[], body: ReactNode) {
    const sectionCount = activeSectionCount(keys);
    return (
      <section className={styles.accordion}>
        <button type="button" className={styles.accordionHeader} onClick={() => toggleSection(id)} aria-expanded={openSections[id]}>
          <span><HydroIcon name={icon} size={18} /> {title}</span>
          {sectionCount ? <strong className={styles.badge}>{sectionCount}</strong> : <HydroIcon name="chevronDown" size={16} />}
        </button>
        {openSections[id] ? <div className={styles.accordionBody}>{body}</div> : null}
      </section>
    );
  }

  const quickFamilies = ['bioeconomy', 'perishable', 'territorialSupply', 'industrialCabotage'];

  const chips = [
    filters.query ? { key: 'query' as const, label: t('chipSearch', { value: filters.query }) } : null,
    filters.corridor ? { key: 'corridor' as const, label: t('chipCorridor', { value: filters.corridor }) } : null,
    filters.origin ? { key: 'origin' as const, label: t('chipOrigin', { value: filters.origin }) } : null,
    filters.destination ? { key: 'destination' as const, label: t('chipDestination', { value: filters.destination }) } : null,
    filters.type ? { key: 'type' as const, label: t('chipCargoType', { value: displayValue('type', filters.type) }) } : null,
    filters.family ? { key: 'family' as const, label: t('chipFamily', { value: displayValue('family', filters.family) }) } : null,
    filters.document ? { key: 'document' as const, label: t('chipDocument', { value: filters.document }) } : null
  ].filter(Boolean) as { key: FilterKey; label: string }[];

  const renderFilterControls = () => (
    <>
      {renderAccordion('corridor', 'route', t('corridor'), ['corridor'], (
        <div>
          <span className={styles.groupLabel}><HydroIcon name="route" size={15} /> {t('waterwayCorridor')}</span>
          {renderOptionGroup('corridor', options.corridors)}
        </div>
      ))}

      {renderAccordion('origin', 'dock', f('origin'), ['origin'], (
        <div>
          <span className={styles.groupLabel}><HydroIcon name="dock" size={15} /> {t('originPortCommunity')}</span>
          {renderOptionGroup('origin', options.origins)}
        </div>
      ))}

      {renderAccordion('destination', 'map', f('destination'), ['destination'], (
        <div>
          <span className={styles.groupLabel}><HydroIcon name="map" size={15} /> {t('destinationHub')}</span>
          {renderOptionGroup('destination', options.destinations)}
        </div>
      ))}

      {renderAccordion('cargo', 'cargo', t('cargoAndBioeconomy'), ['type', 'family'], (
        <>
          <div>
            <span className={styles.groupLabel}><HydroIcon name="leaf" size={15} /> {t('productFamily')}</span>
            {renderOptionGroup('family', options.families)}
          </div>
          <div>
            <span className={styles.groupLabel}><HydroIcon name="cargo" size={15} /> {f('cargoType')}</span>
            {renderOptionGroup('type', options.types)}
          </div>
        </>
      ))}

      {renderAccordion('compliance', 'shield', t('documentation'), ['document'], (
        <div>
          <span className={styles.groupLabel}><HydroIcon name="document" size={15} /> {t('requiredDocument')}</span>
          {renderOptionGroup('document', options.documents)}
        </div>
      ))}
    </>
  );

  const sheetInlineStyle = {
    '--sheet-drag-offset': `${dragOffset}px`
  } as CSSProperties;

  const filterSheet = sheetVisible ? (
    <div
      className={styles.sheetOverlay}
      role="presentation"
      data-state={sheetState}
    >
      <aside
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label={t('filter')}
        data-state={sheetState}
        data-snap={sheetSnap}
        data-dragging={dragging}
        style={sheetInlineStyle}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={styles.sheetDragZone}
          onPointerDown={handleSheetDragStart}
          onPointerMove={handleSheetDragMove}
          onPointerUp={handleSheetDragEnd}
          onPointerCancel={handleSheetDragEnd}
        >
          <div className={styles.sheetHandle} aria-hidden="true" />
          <header className={styles.sheetHeader}>
            <div>
              <small>{t('mobileFiltersEyebrow')}</small>
              <h2>{t('filter')}</h2>
            </div>
            <button type="button" onClick={() => requestCloseSheet()} aria-label={t('closeFilters')}>
              <HydroIcon name="close" size={20} />
            </button>
          </header>
        </div>
        <div className={styles.sheetSummary}>
          <strong>{t('resultCount', { count: filtered.length })}</strong>
          <span>{count ? t('activeFilterCount', { count }) : t('noActiveFilters')}</span>
        </div>
        <div className={styles.sheetScroll}>{renderFilterControls()}</div>
        <footer className={styles.sheetFooter}>
          <button type="button" className={styles.clearButton} onClick={clearAll} disabled={!count}>{t('clear')}</button>
          <button type="button" className={styles.applyButton} onClick={() => requestCloseSheet()}>
            {t('showResults', { count: filtered.length })}
          </button>
        </footer>
      </aside>
    </div>
  ) : null;

  return (
    <section className={styles.layout}>
      <aside className={styles.filters} aria-label={t('filter')}>
        <h2><HydroIcon name="filter" size={20} />{t('filter')}</h2>
        <div className={styles.desktopFilterBody}>{renderFilterControls()}</div>
        <button type="button" className={styles.clearButton} onClick={clearAll} disabled={!count}>{t('clear')}</button>
      </aside>

      <div className={styles.content}>
        <div className={styles.nativeSearch}>
          <label>
            <HydroIcon name="map" size={18} />
            <input value={filters.query} onChange={(event) => setFilter('query', event.target.value)} placeholder={t('nativeSearchPlaceholder')} />
          </label>
          <button type="button" onPointerDown={openFilters} onClick={openFilters} aria-label={t('filter')}>
            <HydroIcon name="filter" size={18} />
            {count ? <strong>{count}</strong> : null}
          </button>
        </div>

        <div className={styles.quickRail} aria-label={t('productFamily')} data-mobile-hidden="true">
          {quickFamilies.map((family) => (
            <button
              key={family}
              type="button"
              className={filters.family === family ? styles.quickActive : undefined}
              onClick={() => setFilter('family', filters.family === family ? '' : family)}
              aria-pressed={filters.family === family}
            >
              {t(`productFamilies.${family}`)}
            </button>
          ))}
        </div>

        {chips.length ? (
          <div className={styles.chips} aria-label={t('activeFilters')}>
            {chips.map((chip) => (
              <button key={chip.key} type="button" onClick={() => setFilter(chip.key, '')}>
                <span>{chip.label}</span>
                <HydroIcon name="close" size={14} />
              </button>
            ))}
            <button type="button" className={styles.clearChip} onClick={clearAll}>{t('clear')}</button>
          </div>
        ) : null}

        <div className={styles.searchBar}>
          <HydroIcon name="map" size={20} />
          <span>{t('resultCount', { count: filtered.length })}</span>
          <strong>{t('pageIndicator', { current: currentPage, total: pageCount })}</strong>
        </div>

        {visible.length ? (
          <div className={styles.grid}>{visible.map((cargo) => <CargoCard key={cargo.id} cargo={cargo} />)}</div>
        ) : (
          <div className={styles.emptyState}>
            <HydroIcon name="cargo" size={30} />
            <h2>{t('emptyTitle')}</h2>
            <p>{t('emptyDescription')}</p>
            <button type="button" onClick={clearAll}>{t('clear')}</button>
          </div>
        )}

        {pageCount > 1 ? (
          <nav className={styles.pagination} aria-label={t('pagination')}>
            <button type="button" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>{t('previous')}</button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
              <button key={number} type="button" aria-current={number === currentPage ? 'page' : undefined} onClick={() => setPage(number)}>{number}</button>
            ))}
            <button type="button" disabled={currentPage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>{t('next')}</button>
          </nav>
        ) : null}
      </div>

      {mounted && filterSheet ? createPortal(filterSheet, document.body) : null}
    </section>
  );
}
