import { getCountries, type CountryCode } from 'libphonenumber-js';

export function CountryLocationField({ id, name, label, locale, className = '', required = false }: {
  id: string; name: string; label: string; locale: string; className?: string; required?: boolean;
}) {
  const names = new Intl.DisplayNames([locale], { type: 'region' });
  const countries = getCountries().map((country) => ({ country, label: names.of(country) ?? country }))
    .sort((a, b) => a.label.localeCompare(b.label, locale));
  return <label htmlFor={id} className={`block font-semibold ${className}`}>
    {label}
    <select id={id} name={name} className="mt-1 block min-h-11 w-full rounded-xl border border-sb-border bg-white px-3 py-2 text-base text-sb-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-amber" defaultValue="VN" required={required} autoComplete="country-name">
      {countries.map(({ country, label: countryName }) => <option key={country} value={country}>{countryName}</option>)}
    </select>
  </label>;
}
