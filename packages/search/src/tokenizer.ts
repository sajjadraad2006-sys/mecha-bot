/**
 * Deterministic lexical tokenizer for Mecha Bot.
 * Extracts clean search tokens from normalized Arabic and English text.
 */

import { normalizeText } from './normalizer.js';

// Unicode punctuation and delimiter split pattern (splits on spaces, symbols, punctuation)
const TOKEN_DELIMITER_REGEX = /[^\p{L}\p{N}]+/u;

/**
 * Tokenizes a string into a list of normalized lexical search tokens.
 * Handles mixed Arabic and English words, acronyms, course codes (e.g., "MCT314"), and numbers.
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
