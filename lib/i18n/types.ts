export type Locale = "en" | "zh-CN"

export interface TranslationMessages {
  [key: string]: string | TranslationMessages
}

export interface LocaleMessages {
  [locale: string]: TranslationMessages
}
