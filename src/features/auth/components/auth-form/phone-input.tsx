'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AUTH_DIAL_OPTIONS, type AuthDialCode } from './auth-dial-options';
import styles from './auth-form.module.scss';

type PhoneInputProps = {
  countryCode: AuthDialCode;
  phone: string;
  invalid?: boolean;
  mode: 'login' | 'register';
  onCountryChange: (countryCode: AuthDialCode) => void;
  onPhoneChange: (phone: string) => void;
};

export function PhoneInput({
  countryCode,
  phone,
  invalid = false,
  mode,
  onCountryChange,
  onPhoneChange
}: PhoneInputProps) {
  const t = useTranslations('auth');
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const selectedDial = useMemo(
    () => AUTH_DIAL_OPTIONS.find((dial) => dial.code === countryCode) ?? AUTH_DIAL_OPTIONS[0],
    [countryCode]
  );
  const countryDigits = useMemo(() => countryCode.replace(/\D/g, ''), [countryCode]);

  function normalizeToLocalPhone(rawValue: string) {
    const digits = rawValue.replace(/\D/g, '');
    if (!digits) return '';
    if (digits.startsWith(countryDigits) && digits.length > selectedDial.mobileDigits) {
      return digits.slice(countryDigits.length);
    }
    return digits;
  }

  function toggleOpen() {
    setOpen((value) => !value);
  }

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target)) setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className={`${styles.phoneFieldRoot} ${open ? styles.phoneFieldRootOpen : ''}`} ref={rootRef}>
      <div className={`${styles.phoneField} ${invalid ? styles.phoneFieldInvalid : ''}`}>
        <button
          ref={buttonRef}
          type="button"
          className={styles.phoneCountryButton}
          aria-label={t('countrySelectorLabel')}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            event.preventDefault();
            toggleOpen();
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              toggleOpen();
            }
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setOpen(true);
            }
          }}
        >
          <span className={styles.phoneCountryGlyph} aria-hidden>
            <span className={styles.phoneCountryFlag}>{selectedDial.flag}</span>
            <ChevronDown size={12} className={styles.phoneCountryChevron} />
          </span>
          <span className={styles.srOnly}>{t(selectedDial.labelKey)}</span>
        </button>

        <div className={styles.phoneValue} aria-label={t('phonePrefixReadonly')}>
          <span className={styles.phonePrefix} aria-hidden>{countryCode}</span>
        </div>

        <label className={styles.phoneInputWrap}>
          <span className={styles.srOnly}>{t('phoneNational')}</span>
          <Phone size={18} aria-hidden />
          <input
            ref={inputRef}
            name="phone"
            inputMode="numeric"
            autoComplete={mode === 'login' ? 'tel' : 'tel-national'}
            placeholder={selectedDial.placeholder}
            value={phone}
            aria-invalid={invalid}
            onChange={(event) => onPhoneChange(normalizeToLocalPhone(event.target.value))}
          />
        </label>
      </div>

      {open ? (
        <div id={listboxId} className={styles.phoneDropdown} role="listbox" aria-label={t('countrySelectorLabel')}>
          {AUTH_DIAL_OPTIONS.map((dial) => (
            <button
              key={dial.code}
              type="button"
              role="option"
              aria-selected={countryCode === dial.code}
              className={countryCode === dial.code ? styles.phoneOptionActive : styles.phoneOption}
              onClick={() => {
                onCountryChange(dial.code);
                setOpen(false);
                requestAnimationFrame(() => inputRef.current?.focus());
              }}
            >
              <span className={styles.phoneOptionFlag} aria-hidden>{dial.flag}</span>
              <span className={styles.phoneOptionCopy}>
                <strong>{t(dial.labelKey)}</strong>
                <span>{dial.code}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
