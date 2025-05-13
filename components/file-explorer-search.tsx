"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"
import { useI18n } from "@/lib/i18n"

interface FileExplorerSearchProps {
  onSearch: (searchTerm: string) => void
  onClear: () => void
}

export default function FileExplorerSearch({ onSearch, onClear }: FileExplorerSearchProps) {
  const { t } = useI18n()
  const [searchTerm, setSearchTerm] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // 当搜索词变化时触发搜索
  useEffect(() => {
    onSearch(searchTerm)
  }, [searchTerm, onSearch])

  // 清除搜索
  const handleClear = () => {
    setSearchTerm("")
    onClear()
    inputRef.current?.focus()
  }

  return (
    <div className="p-2 border-b border-[#3c3c3c]">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t("explorer.searchFiles")}
          className="w-full bg-[#3c3c3c] text-white pl-8 pr-8 py-1 text-sm rounded border border-[#3c3c3c] focus:border-[#007fd4] focus:outline-none"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
