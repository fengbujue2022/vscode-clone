"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { X, ChevronDown, ChevronRight, FileIcon, RefreshCw, ArrowRight } from "lucide-react"
import type { File } from "@/lib/types"
import { useI18n } from "@/lib/i18n"
import { getFileIconByName } from "@/lib/utils"
import { FileJsonIcon as FileJs } from "lucide-react"

interface SearchResult {
  fileId: string
  fileName: string
  filePath: string
  matches: {
    lineNumber: number
    lineContent: string
    matchStart: number
    matchEnd: number
  }[]
}

interface SearchPanelProps {
  files: File[]
  onFileSelect: (fileId: string) => void
}

export default function SearchPanel({ files, onFileSelect }: SearchPanelProps) {
  const { t } = useI18n()
  const [searchQuery, setSearchQuery] = useState("")
  const [replaceQuery, setReplaceQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [showReplace, setShowReplace] = useState(false)
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)
  const [useRegex, setUseRegex] = useState(false)
  const [expandedFiles, setExpandedFiles] = useState<Record<string, boolean>>({})
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Auto-focus search input
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [])

  // Listen for search input changes, automatically execute search
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      performSearch()
    } else {
      setSearchResults([])
    }
  }, [searchQuery, caseSensitive, wholeWord, useRegex])

  // Toggle file expansion in results
  const toggleFileExpansion = (fileId: string) => {
    setExpandedFiles((prev) => ({
      ...prev,
      [fileId]: !prev[fileId],
    }))
  }

  // Get file path
  const getFilePath = useCallback(
    (fileId: string) => {
      const file = files.find((f) => f.id === fileId)
      if (!file) return ""

      let path = ""
      const currentFile = file
      let parentId = currentFile.parentId

      // Build file path
      while (parentId) {
        const parent = files.find((f) => f.id === parentId)
        if (!parent) break

        if (parent.id !== "root") {
          path = parent.name + "/" + path
        }

        parentId = parent.parentId
      }

      return path + file.name
    },
    [files],
  )

  // Get file icon
  const getFileIcon = (fileName: string) => {
    const iconType = getFileIconByName(fileName)

    switch (iconType) {
      case "js":
        return <FileJs size={16} className="text-[#e6cd83]" />
      case "ts":
        return <FileIcon size={16} className="text-[#3178c6]" />
      case "html":
        return <FileIcon size={16} className="text-[#e34c26]" />
      case "css":
        return <FileIcon size={16} className="text-[#563d7c]" />
      case "json":
        return <FileJs size={16} className="text-[#f5de19]" />
      case "md":
        return <FileIcon size={16} className="text-[#ffffff]" />
      case "py":
        return <FileIcon size={16} className="text-[#3572A5]" />
      default:
        return <FileIcon size={16} className="text-[#cccccc]" />
    }
  }

  // Perform search across all files
  const performSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)

    // Create regex for search
    let searchRegex: RegExp
    try {
      if (useRegex) {
        searchRegex = new RegExp(searchQuery, caseSensitive ? "g" : "gi")
      } else {
        const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        const pattern = wholeWord ? `\\b${escapedQuery}\\b` : escapedQuery
        searchRegex = new RegExp(pattern, caseSensitive ? "g" : "gi")
      }
    } catch (error) {
      // Invalid regex
      setIsSearching(false)
      return
    }

    // Filter files to only include actual files (not folders)
    const filteredFiles = files.filter((file) => file.type === "file")

    // Search in file contents
    const results: SearchResult[] = []

    filteredFiles.forEach((file) => {
      const content = file.content
      const lines = content.split("\n")
      const matches: SearchResult["matches"] = []

      lines.forEach((line, lineIndex) => {
        let match
        searchRegex.lastIndex = 0 // Reset regex state

        while ((match = searchRegex.exec(line)) !== null) {
          matches.push({
            lineNumber: lineIndex + 1,
            lineContent: line,
            matchStart: match.index,
            matchEnd: match.index + match[0].length,
          })
        }
      })

      if (matches.length > 0) {
        results.push({
          fileId: file.id,
          fileName: file.name,
          filePath: getFilePath(file.id),
          matches,
        })

        // Auto-expand all files by default
        setExpandedFiles((prev) => ({
          ...prev,
          [file.id]: true,
        }))
      }
    })

    setSearchResults(results)
    setIsSearching(false)
  }, [searchQuery, caseSensitive, wholeWord, useRegex, files, getFilePath])

  // Total matches count
  const totalMatches = searchResults.reduce((total, result) => total + result.matches.length, 0)

  // Highlight match in line
  const highlightMatch = (line: string, start: number, end: number) => {
    return (
      <>
        {line.substring(0, start)}
        <span className="bg-[#613214] text-[#f8d2a0]">{line.substring(start, end)}</span>
        {line.substring(end)}
      </>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#252526]">
      <div className="p-2 flex items-center justify-between">
        <span className="text-xs font-bold uppercase text-gray-400">{t("search.title")}</span>
        <div className="flex space-x-1">
          <button className="text-gray-400 hover:text-white">
            <RefreshCw size={14} />
          </button>
          <button className="text-gray-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="px-2 pb-2 flex flex-col gap-1">
        {/* Search input */}
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("search.findInFiles")}
            className="w-full bg-[#3c3c3c] text-white px-2 py-1 text-sm border border-[#3c3c3c] focus:border-[#007fd4] focus:outline-none"
          />
          <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            <button
              onClick={() => setCaseSensitive(!caseSensitive)}
              className={`px-1 text-xs ${caseSensitive ? "bg-[#1e1e1e] text-white" : "text-gray-400"}`}
              title={t("search.caseSensitive")}
            >
              Aa
            </button>
            <button
              onClick={() => setWholeWord(!wholeWord)}
              className={`px-1 text-xs ${wholeWord ? "bg-[#1e1e1e] text-white" : "text-gray-400"}`}
              title={t("search.wholeWord")}
            >
              ab
            </button>
            <button
              onClick={() => setUseRegex(!useRegex)}
              className={`px-1 text-xs ${useRegex ? "bg-[#1e1e1e] text-white" : "text-gray-400"}`}
              title={t("search.regex")}
            >
              .*
            </button>
          </div>
        </div>

        {/* Replace input */}
        <div className="relative">
          <input
            type="text"
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            placeholder={t("search.replaceInFiles")}
            className="w-full bg-[#3c3c3c] text-white px-2 py-1 text-sm border border-[#3c3c3c] focus:border-[#007fd4] focus:outline-none"
          />
          <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            <button className="px-1 text-xs text-gray-400" title={t("search.replaceAll")}>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Search results - fixed left-aligned layout */}
      <div className="flex-1 overflow-y-auto scrollbar-hide w-full">
        {searchResults.length > 0 ? (
          <div className="w-full">
            <div className="px-2 py-1 text-xs text-gray-400 border-t border-b border-[#3c3c3c]">
              {totalMatches} {t("search.results")} {t("search.in")} {searchResults.length} {t("search.files")} -{" "}
              <button className="text-[#007acc] hover:underline">{t("search.openInEditor")}</button>
            </div>

            {searchResults.map((result) => (
              <div key={result.fileId} className="border-b border-[#3c3c3c] w-full">
                <div
                  className="flex items-center py-1 px-2 cursor-pointer hover:bg-[#2a2d2e] w-full"
                  onClick={() => toggleFileExpansion(result.fileId)}
                >
                  {expandedFiles[result.fileId] ? (
                    <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                  )}
                  {getFileIcon(result.fileName)}
                  <span className="ml-1 text-sm truncate">{result.fileName}</span>
                  <span className="ml-2 text-xs text-gray-500 truncate">{result.filePath}</span>
                  <span className="ml-auto px-1 text-xs bg-[#1e1e1e] rounded-sm flex-shrink-0">
                    {result.matches.length}
                  </span>
                </div>

                {expandedFiles[result.fileId] && (
                  <div className="w-full">
                    {result.matches.map((match, index) => (
                      <div
                        key={index}
                        className="flex items-start py-0.5 px-8 cursor-pointer hover:bg-[#2a2d2e] w-full"
                        onClick={() => onFileSelect(result.fileId)}
                      >
                        <span className="text-xs text-gray-400 mr-2 w-8 text-right flex-shrink-0">
                          {match.lineNumber}
                        </span>
                        <span className="text-sm font-mono whitespace-pre overflow-hidden text-ellipsis">
                          {highlightMatch(match.lineContent, match.matchStart, match.matchEnd)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : searchQuery ? (
          <div className="p-4 text-center text-gray-400">
            {isSearching ? t("search.searching") : t("search.noResults")}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-400">{t("search.typeToSearch")}</div>
        )}
      </div>
    </div>
  )
}
