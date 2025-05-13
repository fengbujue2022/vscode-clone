"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { FindReplaceOptions } from "@/lib/types"
import { X, CaseSensitive, Text, Code } from "lucide-react"
import { useI18n } from "@/lib/i18n"

interface FindReplacePanelProps {
  onFind: (searchText: string) => void
  onReplace: (searchText: string, replaceText: string) => void
  onClose: () => void
  options: FindReplaceOptions
  onOptionsChange: (options: FindReplaceOptions) => void
  initialMode?: "find" | "replace"
}

export function FindReplacePanel({
  onFind,
  onReplace,
  onClose,
  options,
  onOptionsChange,
  initialMode = "find",
}: FindReplacePanelProps) {
  const { t } = useI18n()
  const [searchText, setSearchText] = useState("")
  const [replaceText, setReplaceText] = useState("")
  const [showReplace, setShowReplace] = useState(initialMode === "replace")

  useEffect(() => {
    setShowReplace(initialMode === "replace")
  }, [initialMode])

  const handleFind = (e: React.FormEvent) => {
    e.preventDefault()
    onFind(searchText)
  }

  const handleReplace = () => {
    onReplace(searchText, replaceText)
  }

  const handleReplaceAll = () => {
    onReplace(searchText, replaceText)
  }

  const toggleOption = (option: keyof FindReplaceOptions) => {
    onOptionsChange({
      ...options,
      [option]: !options[option],
    })
  }

  return (
    <div className="absolute top-0 right-0 z-10 bg-[#252526] border border-[#3c3c3c] shadow-lg w-80">
      <div className="flex items-center justify-between p-2 border-b border-[#3c3c3c]">
        <div className="flex space-x-2">
          <button
            className={`px-2 py-1 text-xs ${!showReplace ? "bg-[#37373d]" : ""}`}
            onClick={() => setShowReplace(false)}
          >
            {t("common.find")}
          </button>
          <button
            className={`px-2 py-1 text-xs ${showReplace ? "bg-[#37373d]" : ""}`}
            onClick={() => setShowReplace(true)}
          >
            {t("common.replace")}
          </button>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleFind} className="p-2">
        <div className="mb-2">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={t("common.find")}
            className="w-full bg-[#3c3c3c] text-white px-2 py-1 text-sm border border-[#3c3c3c] focus:border-[#007fd4] focus:outline-none"
            autoFocus
          />
        </div>

        {showReplace && (
          <div className="mb-2">
            <input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder={t("common.replace")}
              className="w-full bg-[#3c3c3c] text-white px-2 py-1 text-sm border border-[#3c3c3c] focus:border-[#007fd4] focus:outline-none"
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => toggleOption("caseSensitive")}
              className={`p-1 rounded ${options.caseSensitive ? "bg-[#37373d]" : ""}`}
              title={t("search.caseSensitive")}
            >
              <CaseSensitive size={16} />
            </button>
            <button
              type="button"
              onClick={() => toggleOption("wholeWord")}
              className={`p-1 rounded ${options.wholeWord ? "bg-[#37373d]" : ""}`}
              title={t("search.wholeWord")}
            >
              <Text size={16} />
            </button>
            <button
              type="button"
              onClick={() => toggleOption("regex")}
              className={`p-1 rounded ${options.regex ? "bg-[#37373d]" : ""}`}
              title={t("search.regex")}
            >
              <Code size={16} />
            </button>
          </div>

          {showReplace && (
            <div className="flex space-x-1">
              <button
                type="button"
                onClick={handleReplace}
                className="px-2 py-1 text-xs bg-[#37373d] hover:bg-[#45454d]"
              >
                {t("common.replace")}
              </button>
              <button
                type="button"
                onClick={handleReplaceAll}
                className="px-2 py-1 text-xs bg-[#37373d] hover:bg-[#45454d]"
              >
                {t("search.replaceInFiles")}
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
