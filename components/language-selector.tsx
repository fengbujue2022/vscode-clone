"use client"

import { useI18n } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n/types"
import { Globe } from "lucide-react"

export function LanguageSelector() {
  const { locale, changeLocale } = useI18n()

  const languages: { label: string; value: Locale }[] = [
    { label: "English", value: "en" },
    { label: "中文", value: "zh-CN" },
  ]

  return (
    <div className="flex items-center space-x-1">
      <Globe size={12} />
      <select
        value={locale}
        onChange={(e) => changeLocale(e.target.value as Locale)}
        className="bg-[#007acc] text-white text-xs border-none outline-none cursor-pointer"
      >
        {languages.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  )
}
