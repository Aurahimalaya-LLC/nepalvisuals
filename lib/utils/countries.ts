import rawCountries from '../../countries.json';

export interface Country {
  code: string; // ISO 3166-1 alpha-2
  name: string; // English fallback
}

const formatterCache: Record<string, Intl.DisplayNames | null> = {};

const getFormatter = (locale: string): Intl.DisplayNames | null => {
  if (formatterCache[locale] !== undefined) return formatterCache[locale];
  try {
    const fmt = new Intl.DisplayNames([locale], { type: 'region' });
    formatterCache[locale] = fmt;
    return fmt;
  } catch {
    formatterCache[locale] = null;
    return null;
  }
};

export const getCountries = (locale?: string): Country[] => {
  const loc = locale || (typeof navigator !== 'undefined' ? navigator.language : 'en');
  const fmt = getFormatter(loc);
  const countries: Country[] = (rawCountries as Country[]).map(c => {
    const localized = fmt ? fmt.of(c.code) : null;
    return {
      code: c.code,
      name: localized || c.name
    };
  });
  countries.sort((a, b) => a.name.localeCompare(b.name, loc, { sensitivity: 'base' }));
  return countries;
};

export const findCountryByCode = (code: string, locale?: string): Country | undefined => {
  const list = getCountries(locale);
  return list.find(c => c.code === code);
};
