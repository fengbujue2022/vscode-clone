"use client"

import { useState, useEffect, useMemo } from "react"
import type { ReactNode } from "react"
import { I18nContext, interpolate, getNestedValue } from "@/lib/i18n"
import type { Locale, TranslationMessages } from "@/lib/i18n/types"
import enMessages from "@/lib/i18n/locales/en.json"
import zhCNMessages from "@/lib/i18n/locales/zh-CN.json"
import settingsService from "@/lib/settings-service"

interface I18nProviderProps {
  children: ReactNode
  defaultLocale?: Locale
}

const messages: Record<Locale, TranslationMessages> = {
  en: enMessages,
  "zh-CN": zhCNMessages,
}

// Try to get the browser's language
const getBrowserLocale = (): Locale => {
  if (typeof window === "undefined") return "en"

  const browserLang = navigator.language
  if (browserLang.startsWith("zh")) return "zh-CN"
  return "en"
}

export function I18nProvider({ children, defaultLocale }: I18nProviderProps) {
  // Try to get the locale from localStorage, or use the browser's locale, or fall back to the default
  const [locale, setLocale] = useState<Locale>(defaultLocale || "en")

  useEffect(() => {
    const savedLocale = settingsService.getSetting("locale") as Locale
    const browserLocale = getBrowserLocale()
    const initialLocale = savedLocale || browserLocale || defaultLocale || "en"
    setLocale(initialLocale)
  }, [defaultLocale])

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale)
    settingsService.updateSetting("locale", newLocale)
  }

  const t = (key: string, params?: Record<string, string | number>): string => {
    const translationMessages = messages[locale] || messages.en
    const translation = getNestedValue(translationMessages, key)
    return interpolate(translation, params)
  }

  const contextValue = useMemo(
    () => ({
      locale,
      t,
      changeLocale,
    }),
    [locale],
  )

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
}
