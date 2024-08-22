import { type AvailableLanguageTag, languageTag } from "$paraglide/runtime";

export type LocalizableString = string | Record<AvailableLanguageTag, string>;

export function toLocalizedString(s: LocalizableString, lang?: AvailableLanguageTag) {
  const actualLang = lang ?? languageTag();
  if (typeof s === "string") return s;
  return s[actualLang];
}
