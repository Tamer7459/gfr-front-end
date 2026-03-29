/** BCP-47 locale for Date / Number formatting */
export function dateLocaleFromLng(lng) {
  if (!lng || lng === 'en') return 'en-US';
  if (lng.startsWith('ar')) return 'ar-EG';
  if (lng.startsWith('fr')) return 'fr-FR';
  return 'en-US';
}
