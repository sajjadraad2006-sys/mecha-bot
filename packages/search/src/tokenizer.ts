/**
 * Deterministic lexical tokenizer for Mecha Bot.
 * Extracts clean search tokens from normalized Arabic and English text.
 */

import { normalizeText } from './normalizer.js';

// Unicode punctuation and delimiter split pattern (splits on spaces, symbols, punctuation)
const TOKEN_DELIMITER_REGEX = /[^\p{L}\p{N}]+/u;

// Common colloquial and transliteration aliases for mechatronics engineering
const ARABIC_ACADEMIC_SYNONYMS: Record<string, string[]> = {
  ستاتك: ['ستاتيك'],
  داينمك: ['ديناميك', 'دايناميك'],
  داينامك: ['ديناميك', 'دايناميك'],
  فلويد: ['موائع'],
  ثيرمو: ['ثرموديناميك', 'حراريات'],
  ماث: ['رياضيات'],
};

/**
 * Tokenizes a string into a list of normalized lexical search tokens.
 * Handles mixed Arabic and English words, acronyms, course codes (e.g., "MCT314"), and numbers.
 * Supports Arabic prefix stripping ('ال') and phonetic engineering synonyms.
 */
export function tokenize(text: string): string[] {
  if (!text) return [];
  const normalized = normalizeText(text);
  if (!normalized) return [];

  const rawTokens = normalized.split(TOKEN_DELIMITER_REGEX);
  const tokens: string[] = [];

  for (const token of rawTokens) {
    const trimmed = token.trim();
    if (trimmed.length > 0) {
      tokens.push(trimmed);

      // Arabic definite article ('ال') stemming:
      // If token starts with 'ال' (e.g. "الموائع" -> "موائع", "الميكانيك" -> "ميكانيك")
      if (trimmed.startsWith('ال') && trimmed.length >= 4) {
        const withoutAl = trimmed.slice(2);
        if (withoutAl.length >= 2) {
          tokens.push(withoutAl);
        }
      }

      // Colloquial / transliteration expansion (e.g. "ستاتك" -> "ستاتيك")
      const synonyms = ARABIC_ACADEMIC_SYNONYMS[trimmed];
      if (synonyms) {
        for (const syn of synonyms) {
          tokens.push(syn);
        }
      }
    }
  }

  return tokens;
}

/**
 * Extracts unique tokens and their term frequencies (TF) in a document.
 */
export function extractTermFrequencies(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) ?? 0) + 1);
  }
  return tf;
}
