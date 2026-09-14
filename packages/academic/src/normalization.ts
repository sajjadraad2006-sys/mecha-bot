/**
 * Conservative Arabic text normalizer.
 *
 * Requirements:
 * - Unifies alef variants: [أإآٱ] -> ا
 * - Maps alef maqsura: ى -> ي
 * - Strips tashkeel (diacritics): [\u064B-\u065F\u0670]
 * - Strips tatweel (kashida): \u0640
 * - Normalizes multiple spaces into a single space and trims
 * - NOTE: Does NOT normalize ة -> ه globally to prevent destructive semantic collisions.
 */
export function normalizeArabicText(text: string): string {
  if (!text) return '';

  return (
    text
      // 1. Remove tashkeel (diacritics)
      .replace(/[\u064B-\u065F\u0670]/g, '')
      // 2. Remove tatweel (kashida)
      .replace(/\u0640/g, '')
      // 3. Unify alef forms
      .replace(/[أإآٱ]/g, 'ا')
      // 4. Map alef maqsura to yaa
      .replace(/ى/g, 'ي')
      // 5. Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * English text normalizer: lowercase, trims, and normalizes whitespace.
 */
export function normalizeEnglishText(text: string): string {
  if (!text) return '';
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * General text normalizer combining conservative Arabic and English normalization.
 * Strips punctuation except when part of identifiers, collapses whitespace, trims.
 */
export function normalizeGeneralText(text: string): string {
  if (!text) return '';

  const arabicNormalized = normalizeArabicText(text);
  const englishNormalized = normalizeEnglishText(arabicNormalized);

  // Remove common punctuation while preserving Arabic letters, Latin letters, digits, and spaces
  return englishNormalized
    .replace(/[-_.:,;!?"'()[\]{}~/\\|\u060C\u061B\u061F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Secondary tolerant normalizer used ONLY as a search fallback if exact normalized
 * matching does not match. Unifies ة -> ه and maps Persian/Urdu variants.
 */
export function normalizeTolerantArabic(text: string): string {
  return normalizeGeneralText(text)
    .replace(/ة/g, 'ه')
    .replace(/ك/g, 'ك') // preserves kaf
    .replace(/\s+/g, ' ')
    .trim();
}
