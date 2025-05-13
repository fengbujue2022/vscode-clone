"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import type { File } from "@/lib/types"
import { FileIcon, FileJsonIcon, FileCodeIcon, FileText } from "lucide-react"
import { getFileIconByName } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"

interface QuickOpenDialogProps {
  isOpen: boolean
  onClose: () => void
  files: File[]
  onSelectFile: (fileId: string) => void
}

export function QuickOpenDialog({ isOpen, onClose, files, onSelectFile }: QuickOpenDialogProps) {
  const { t } = useI18n()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [searchTerm])

  if (!isOpen) return null

  const filteredFiles = files.filter((file) => file.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose()
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < filteredFiles.length - 1 ? prev + 1 : prev))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
    } else if (e.key === "Enter") {
      if (filteredFiles[selectedIndex]) {
        onSelectFile(filteredFiles[selectedIndex].id)
      }
    }
  }

  const getFileIcon = (file: File) => {
    const iconType = getFileIconByName(file.name)

    switch (iconType) {
      case "js":
        return <FileJsonIcon size={16} className="text-[#e6cd83]" />
      case "ts":
        return <FileIcon size={16} className="text-[#3178c6]" />
      case "html":
        return <FileIcon size={16} className="text-[#e34c26]" />
      case "css":
        return <FileCodeIcon size={16} className="text-[#563d7c]" />
      case "json":
        return <FileJsonIcon size={16} className="text-[#f5de19]" />
      case "md":
        return <FileText size={16} className="text-[#ffffff]" />
      default:
        return <FileIcon size={16} className="text-[#cccccc]" />
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div className="w-[500px] bg-[#252526] rounded shadow-lg">
        <div className="p-2">
          <input
            ref={inputRef}
            type="text"
            placeholder={t("quickOpen.placeholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-[#3c3c3c] text-white px-3 py-2 rounded border border-[#3c3c3c] focus:border-[#007fd4] focus:outline-none"
          />
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          {filteredFiles.length > 0 ? (
            filteredFiles.map((file, index) => (
              <div
                key={file.id}
                className={`flex items-center px-3 py-2 cursor-pointer ${
                  index === selectedIndex ? "bg-[#37373d]" : "hover:bg-[#2a2d2e]"
                }`}
                onClick={() => onSelectFile(file.id)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span className="mr-2">{getFileIcon(file)}</span>
                <span className="text-sm">{file.name}</span>
                <span className="text-xs text-gray-500 ml-2">{file.parentId === "root" ? "/" : "/src/"}</span>
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500 text-sm">{t("quickOpen.noResults")}</div>
          )}
        </div>
      </div>
      <div className="fixed inset-0 z-40 bg-black bg-opacity-25" onClick={onClose}></div>
    </div>
  )
}
