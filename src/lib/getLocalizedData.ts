import type { Locale } from "./i18n";

/**
 * Extract a localized string from a multilingual object.
 * Falls back to Vietnamese if the requested locale key is missing.
 */
export function t(obj: Record<string, string>, locale: Locale): string {
  return obj[locale] ?? obj.vi;
}
