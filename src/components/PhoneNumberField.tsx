import { useMemo, useState } from 'react';
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';

type Props = {
  id: string;
  label: string;
  locale: string;
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  className?: string;
  inputClassName?: string;
  selectClassName?: string;
  placeholder?: string;
  describedBy?: string;
  invalid?: boolean;
};

const DEFAULT_COUNTRY: CountryCode = 'VN';

/** One accessible country selector for every JE form that collects a phone number. */
export function PhoneNumberField({ id, label, locale, name, value, onChange, required, className = '', inputClassName = '', selectClassName = '', placeholder, describedBy, invalid }: Props) {
  const controlled = value !== undefined;
  const [internalValue, setInternalValue] = useState('');
  const [draft, setDraft] = useState('');
  const currentValue = controlled ? value : internalValue;
  const parsed = currentValue ? parsePhoneNumberFromString(currentValue) : undefined;
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(parsed?.country ?? DEFAULT_COUNTRY);
  const countries = useMemo(() => {
    const names = new Intl.DisplayNames([locale], { type: 'region' });
    return getCountries().map((country) => ({ country, name: names.of(country) ?? country, callingCode: getCountryCallingCode(country) }))
      .sort((a, b) => a.name.localeCompare(b.name, locale));
  }, [locale]);
  const displayValue = draft || parsed?.nationalNumber || currentValue.replace(/^\+\d+/, '');
  const update = (raw: string, country = selectedCountry) => {
    const trimmed = raw.trim();
    const number = trimmed.startsWith('+')
      ? parsePhoneNumberFromString(trimmed)
      : parsePhoneNumberFromString(trimmed, country);
    const next = !trimmed ? '' : number?.number ?? `+${getCountryCallingCode(country)}${trimmed.replace(/\D/g, '')}`;
    if (!controlled) setInternalValue(next);
    onChange?.(next);
    if (number?.country) setSelectedCountry(number.country);
  };
  return <div className={className}>
    <label htmlFor={`${id}-country`} className="sr-only">{locale.startsWith('vi') ? `Quốc gia cho ${label}` : `Country for ${label}`}</label>
    <label htmlFor={id} className="sr-only">{label}</label>
    <div className="flex min-h-11 w-full overflow-hidden rounded-xl border border-sb-border bg-white focus-within:ring-2 focus-within:ring-sb-amber">
      <select id={`${id}-country`} aria-label={locale.startsWith('vi') ? `Mã quốc gia cho ${label}` : `Country code for ${label}`} className={`max-w-[48%] shrink-0 border-r border-sb-border bg-slate-50 px-2 text-sm text-sb-ink focus-visible:outline-none ${selectClassName}`} value={selectedCountry} onChange={(event) => {
        const country = event.target.value as CountryCode;
        setSelectedCountry(country);
        const national = draft || parsed?.nationalNumber || displayValue;
        setDraft('');
        update(national, country);
      }}>
        {countries.map(({ country, name, callingCode }) => <option key={country} value={country}>{name} (+{callingCode})</option>)}
      </select>
      <input id={id} type="tel" inputMode="tel" autoComplete="tel-national" className={`min-w-0 flex-1 bg-white px-3 py-2 text-base text-sb-ink focus-visible:outline-none ${inputClassName}`} value={displayValue} onChange={(event) => { setDraft(event.target.value); update(event.target.value); }} placeholder={placeholder} required={required} aria-invalid={invalid || undefined} aria-describedby={describedBy} />
    </div>
    {!controlled && name ? <input type="hidden" name={name} value={currentValue} /> : null}
  </div>;
}
