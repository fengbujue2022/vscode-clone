"use client"

import type React from "react"

import type { File, Theme } from "@/lib/types"
import { Keyboard } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { LanguageSelector } from "./language-selector"

interface StatusBarProps {
  activeFile: File | null
  theme: Theme
  onThemeChange: (theme: Theme) => void
  fontSize: number
  wordWrap: "on" | "off"
  onShowShortcuts: () => void
}

export default function StatusBar({
  activeFile,
  theme,
  onThemeChange,
  fontSize,
  wordWrap,
  onShowShortcuts,
}: StatusBarProps) {
  const { t } = useI18n()

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onThemeChange(e.target.value as Theme)
  }

  return (
    <div className="flex items-center justify-between h-6 bg-[#007acc] text-white text-xs px-2">
      <div className="flex items-center space-x-4">
        <span>{activeFile ? `${activeFile.language?.toUpperCase() || "PLAINTEXT"}` : ""}</span>
        <span>{activeFile ? t("statusBar.encoding") : ""}</span>
        <span>{activeFile ? t("statusBar.lineColumn", { line: 1, column: 1 }) : ""}</span>
      </div>

      <div className="flex items-center space-x-4">
        <span>
          {t("editor.fontSize")}: {fontSize}px
        </span>
        <span>
          {t("editor.wordWrap")}: {wordWrap === "on" ? t("common.on") : t("common.off")}
        </span>
        <select
          value={theme}
          onChange={handleThemeChange}
          className="bg-[#007acc] text-white text-xs border-none outline-none cursor-pointer"
        >
          <option value="vs">Light</option>
          <option value="vs-dark">Dark</option>
          <option value="hc-black">High Contrast</option>
        </select>
        <LanguageSelector />
        <button
          onClick={onShowShortcuts}
          className="flex items-center hover:bg-[#1f8ad2] px-2 py-0.5"
          title={t("statusBar.shortcuts")}
        >
          <Keyboard size={12} className="mr-1" />
          <span>{t("statusBar.shortcuts")}</span>
        </button>
      </div>
    </div>
  )
}
