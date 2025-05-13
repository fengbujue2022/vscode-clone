"use client"

import { createContext, useContext } from "react"
import type { Locale } from "./types"

export type I18nContextType = {
  locale: Locale
  t: (key: string, params?: Record<string, string | number>) => string
  changeLocale: (locale: Locale) => void
}

export const I18nContext = createContext<I18nContextType | null>(null)

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}

// Helper function to interpolate parameters in translation strings
export function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text

  return Object.entries(params).reduce((acc, [key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g")
    return acc.replace(regex, String(value))
  }, text)
}

// Helper function to get a nested value from an object using a dot-notation path
export function getNestedValue(obj: Record<string, any>, path: string): string {
  const keys = path.split(".")
  let result = obj

  for (const key of keys) {
    if (result === undefined || result === null) {
      return path // Return the key path if we can't find the translation
    }
    result = result[key]
  }

  if (typeof result !== "string") {
    return path // Return the key path if the result is not a string
  }

  return result
}
