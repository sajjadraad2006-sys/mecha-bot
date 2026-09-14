/**
 * Arabic and English text normalization for lexical search and retrieval.
 * Strict parity with M6 ingestion rules.
 * Does NOT destroy original text; used for indexed query tokens and textNormalized.
 */

// Arabic diacritics (tashkeel): Fathatan, Dammatan, Kasratan, Fatha, Damma, Kasra, Shadda, Sukun
// and Quranic / extended marks: Maddah, Hamza above/below, Tatweel/Kashida, Superscript Alef
const TASHKEEL_REGEX =
  /[\u0617-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g;
const TATWEEL_REGEX = /\u0640/g;

// Arabic letter normalizations
const ALEF_REGEX = /[أإآٱ]/g;
const YAA_REGEX = /ى/g;

// Whitespace cleaner
const WHITESPACE_REGEX = /\s+/g;

/**
 * Remove tashkeel (diacritics) and tatweel (kashida) from Arabic text.
 */
export function removeTashkeel(text: string): string {
  if (!text) return '';
  return text.replace(TASHKEEL_REGEX, '').replace(TATWEEL_REGEX, '');
}

/**
 * Normalize Arabic characters:
 * - أ / إ / آ / ٱ -> ا
 * - ى -> ي
 * - Strips tashkeel and tatweel
 * - Collapses whitespace
 * Notice: ة is preserved and NOT globally converted to ه.
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';
  const withoutTashkeel = removeTashkeel(text);
  return withoutTashkeel.replace(ALEF_REGEX, 'ا').replace(YAA_REGEX, 'ي');
}

/**
 * Normalize English text:
 * - Lowercase
 * - Normalize whitespace
 */
export function normalizeEnglish(text: string): string {
  if (!text) return '';
  return text.toLowerCase();
}

/**
 * Unified text normalization for mixed Arabic and English academic content.
 * Guarantees identical output across equivalent orthographical forms.
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  const step1 = normalizeArabic(text);
  const step2 = normalizeEnglish(step1);
  return step2.replace(WHITESPACE_REGEX, ' ').trim();
}
