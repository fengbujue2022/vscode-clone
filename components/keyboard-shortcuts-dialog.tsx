"use client"

import { useState } from "react"
import { useKeyboardShortcuts } from "./keyboard-shortcuts-provider"
import { formatShortcut } from "@/lib/keyboard-shortcuts"
import { X, Search } from "lucide-react"
import { useI18n } from "@/lib/i18n"

interface KeyboardShortcutsDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function KeyboardShortcutsDialog({ isOpen, onClose }: KeyboardShortcutsDialogProps) {
  const { shortcuts } = useKeyboardShortcuts()
  const { t } = useI18n()
  const [searchTerm, setSearchTerm] = useState("")

  if (!isOpen) return null

  const filteredShortcuts = shortcuts.filter(
    (shortcut) =>
      t(shortcut.description).toLowerCase().includes(searchTerm.toLowerCase()) ||
      shortcut.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatShortcut(shortcut).toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Group shortcuts by category
  const categories = {
    [t("shortcuts.categories.fileOperations")]: ["save", "saveAll", "newFile", "openFile"],
    [t("shortcuts.categories.editOperations")]: [
      "undo",
      "redo",
      "cut",
      "copy",
      "paste",
      "selectAll",
      "formatDocument",
      "commentLine",
      "indentLine",
      "outdentLine",
    ],
    [t("shortcuts.categories.searchNavigation")]: ["find", "replace", "findInFiles", "goToLine", "quickOpen"],
    [t("shortcuts.categories.viewControls")]: [
      "toggleSidebar",
      "toggleTerminal",
      "toggleFullScreen",
      "zoomIn",
      "zoomOut",
      "resetZoom",
      "toggleWordWrap",
      "toggleMinimap",
      "changeTheme",
    ],
    [t("shortcuts.categories.codeFolding")]: ["foldCode", "unfoldCode"],
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-[600px] max-h-[80vh] bg-[#252526] rounded shadow-lg flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
          <h2 className="text-lg font-semibold">{t("shortcuts.title")}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-[#3c3c3c]">
          <div className="relative">
            <input
              type="text"
              placeholder={t("shortcuts.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#3c3c3c] text-white px-3 py-2 pl-10 rounded border border-[#3c3c3c] focus:border-[#007fd4] focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {searchTerm === "" ? (
            // Display shortcuts by category when not searching
            Object.entries(categories).map(([category, actions]) => (
              <div key={category} className="mb-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">{category}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {shortcuts
                    .filter((shortcut) => actions.includes(shortcut.action))
                    .map((shortcut) => (
                      <div
                        key={shortcut.action}
                        className="flex justify-between items-center py-1 px-2 hover:bg-[#2a2d2e]"
                      >
                        <span className="text-sm">{t(shortcut.description)}</span>
                        <span className="text-xs bg-[#3c3c3c] px-2 py-1 rounded">{formatShortcut(shortcut)}</span>
                      </div>
                    ))}
                </div>
              </div>
            ))
          ) : (
            // Display search results
            <div className="grid grid-cols-2 gap-2">
              {filteredShortcuts.map((shortcut) => (
                <div key={shortcut.action} className="flex justify-between items-center py-1 px-2 hover:bg-[#2a2d2e]">
                  <span className="text-sm">{t(shortcut.description)}</span>
                  <span className="text-xs bg-[#3c3c3c] px-2 py-1 rounded">{formatShortcut(shortcut)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
