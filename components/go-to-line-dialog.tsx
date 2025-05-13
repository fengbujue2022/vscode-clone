"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useI18n } from "@/lib/i18n"

interface GoToLineDialogProps {
  isOpen: boolean
  onClose: () => void
  onGoToLine: (lineNumber: number) => void
}

export function GoToLineDialog({ isOpen, onClose, onGoToLine }: GoToLineDialogProps) {
  const { t } = useI18n()
  const [lineNumber, setLineNumber] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const line = Number.parseInt(lineNumber)
    if (!isNaN(line) && line > 0) {
      onGoToLine(line)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div className="w-[300px] bg-[#252526] rounded shadow-lg">
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label htmlFor="lineNumber" className="block text-sm font-medium mb-1">
              {t("goToLine.lineNumber")}:
            </label>
            <input
              ref={inputRef}
              id="lineNumber"
              type="number"
              min="1"
              value={lineNumber}
              onChange={(e) => setLineNumber(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-[#3c3c3c] text-white px-3 py-2 rounded border border-[#3c3c3c] focus:border-[#007fd4] focus:outline-none"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 mr-2 bg-[#3c3c3c] hover:bg-[#505050] rounded text-sm"
            >
              {t("common.cancel")}
            </button>
            <button type="submit" className="px-3 py-1 bg-[#007acc] hover:bg-[#0066b5] rounded text-sm">
              {t("goToLine.goTo")}
            </button>
          </div>
        </form>
      </div>
      <div className="fixed inset-0 z-40 bg-black bg-opacity-25" onClick={onClose}></div>
    </div>
  )
}
