"use client"

import { useState, useRef, useEffect } from "react"
import { useI18n } from "@/lib/i18n"
import type { Theme } from "@/lib/types"

interface MenuBarProps {
  onNewFile: () => void
  onOpenFile: () => void
  onSave: () => void
  onSaveAll: () => void
  onFind: () => void
  onReplace: () => void
  onFindInFiles: () => void
  onToggleTerminal: () => void
  onToggleSidebar: () => void
  onShowShortcuts: () => void
  onGoToLine: () => void
  onQuickOpen: () => void
  onChangeTheme: (theme: Theme) => void
  onToggleWordWrap: () => void
  onToggleMinimap: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
  onSelectAll: () => void
  onCommentLine: () => void
  onFormatDocument: () => void
}

export default function MenuBar({
  onNewFile,
  onOpenFile,
  onSave,
  onSaveAll,
  onFind,
  onReplace,
  onFindInFiles,
  onToggleTerminal,
  onToggleSidebar,
  onShowShortcuts,
  onGoToLine,
  onQuickOpen,
  onChangeTheme,
  onToggleWordWrap,
  onToggleMinimap,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onSelectAll,
  onCommentLine,
  onFormatDocument,
}: MenuBarProps) {
  const { t } = useI18n()
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null)
      }
    }

    if (activeMenu) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [activeMenu])

  // Close menu when pressing Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && activeMenu) {
        setActiveMenu(null)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [activeMenu])

  const toggleMenu = (menuName: string) => {
    setActiveMenu(activeMenu === menuName ? null : menuName)
  }

  const handleMenuItemClick = (callback: () => void) => {
    callback()
    setActiveMenu(null)
  }

  return (
    <div ref={menuRef} className="flex items-center h-9 bg-[#3c3c3c] px-2 text-sm select-none">
      {/* File Menu */}
      <div className="relative">
        <span
          className={`cursor-pointer px-2 py-1 ${activeMenu === "file" ? "bg-[#505050]" : "hover:bg-[#505050]"}`}
          onClick={() => toggleMenu("file")}
        >
          {t("common.file")}
        </span>
        {activeMenu === "file" && (
          <div className="absolute left-0 top-full mt-0 w-64 bg-[#252526] shadow-lg z-50 text-white">
            <div
              className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer"
              onClick={() => handleMenuItemClick(onNewFile)}
            >
              <span>{t("menu.newFile")}</span>
              <span className="text-gray-400 text-xs">Ctrl+N</span>
            </div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.newWindow")}</span>
              <span className="text-gray-400 text-xs">Ctrl+Shift+N</span>
            </div>
            <div className="border-t border-[#3c3c3c] my-1"></div>
            <div
              className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer"
              onClick={() => handleMenuItemClick(onOpenFile)}
            >
              <span>{t("menu.openFile")}</span>
              <span className="text-gray-400 text-xs">Ctrl+O</span>
            </div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.openFolder")}</span>
              <span className="text-gray-400 text-xs">Ctrl+K Ctrl+O</span>
            </div>
            <div className="border-t border-[#3c3c3c] my-1"></div>
            <div
              className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer"
              onClick={() => handleMenuItemClick(onSave)}
            >
              <span>{t("common.save")}</span>
              <span className="text-gray-400 text-xs">Ctrl+S</span>
            </div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.saveAs")}</span>
              <span className="text-gray-400 text-xs">Ctrl+Shift+S</span>
            </div>
            <div
              className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer"
              onClick={() => handleMenuItemClick(onSaveAll)}
            >
              <span>{t("common.saveAll")}</span>
              <span className="text-gray-400 text-xs">Ctrl+K S</span>
            </div>
            <div className="border-t border-[#3c3c3c] my-1"></div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.preferences")}</span>
              <span className="text-gray-400 text-xs"></span>
            </div>
            <div className="border-t border-[#3c3c3c] my-1"></div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.closeEditor")}</span>
              <span className="text-gray-400 text-xs">Ctrl+F4</span>
            </div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.closeWindow")}</span>
              <span className="text-gray-400 text-xs">Alt+F4</span>
            </div>
            <div className="border-t border-[#3c3c3c] my-1"></div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.exit")}</span>
              <span className="text-gray-400 text-xs"></span>
            </div>
          </div>
        )}
      </div>

      {/* Edit Menu */}
      <div className="relative">
        <span
          className={`cursor-pointer px-2 py-1 ${activeMenu === "edit" ? "bg-[#505050]" : "hover:bg-[#505050]"}`}
          onClick={() => toggleMenu("edit")}
        >
          {t("common.edit")}
        </span>
        {activeMenu === "edit" && (
          <div className="absolute left-0 top-full mt-0 w-64 bg-[#252526] shadow-lg z-50 text-white">
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("common.undo")}</span>
              <span className="text-gray-400 text-xs">Ctrl+Z</span>
            </div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("common.redo")}</span>
              <span className="text-gray-400 text-xs">Ctrl+Y</span>
            </div>
            <div className="border-t border-[#3c3c3c] my-1"></div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("common.cut")}</span>
              <span className="text-gray-400 text-xs">Ctrl+X</span>
            </div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("common.copy")}</span>
              <span className="text-gray-400 text-xs">Ctrl+C</span>
            </div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("common.paste")}</span>
              <span className="text-gray-400 text-xs">Ctrl+V</span>
            </div>
            <div className="border-t border-[#3c3c3c] my-1"></div>
            <div
              className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer"
              onClick={() => handleMenuItemClick(onFind)}
            >
              <span>{t("common.find")}</span>
              <span className="text-gray-400 text-xs">Ctrl+F</span>
            </div>
            <div
              className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer"
              onClick={() => handleMenuItemClick(onReplace)}
            >
              <span>{t("common.replace")}</span>
              <span className="text-gray-400 text-xs">Ctrl+H</span>
            </div>
            <div
              className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer"
              onClick={() => handleMenuItemClick(onFindInFiles)}
            >
              <span>{t("search.findInFiles")}</span>
              <span className="text-gray-400 text-xs">Ctrl+Shift+F</span>
            </div>
            <div className="border-t border-[#3c3c3c] my-1"></div>
            <div
              className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer"
              onClick={() => handleMenuItemClick(onCommentLine)}
            >
              <span>{t("menu.toggleLineComment")}</span>
              <span className="text-gray-400 text-xs">Ctrl+/</span>
            </div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.toggleBlockComment")}</span>
              <span className="text-gray-400 text-xs">Shift+Alt+A</span>
            </div>
            <div
              className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer"
              onClick={() => handleMenuItemClick(onFormatDocument)}
            >
              <span>{t("menu.formatDocument")}</span>
              <span className="text-gray-400 text-xs">Alt+Shift+F</span>
            </div>
          </div>
        )}
      </div>

      {/* Selection Menu */}
      <div className="relative">
        <span
          className={`cursor-pointer px-2 py-1 ${activeMenu === "selection" ? "bg-[#505050]" : "hover:bg-[#505050]"}`}
          onClick={() => toggleMenu("selection")}
        >
          {t("common.selection")}
        </span>
        {activeMenu === "selection" && (
          <div className="absolute left-0 top-full mt-0 w-64 bg-[#252526] shadow-lg z-50 text-white">
            <div
              className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer"
              onClick={() => handleMenuItemClick(onSelectAll)}
            >
              <span>{t("menu.selectAll")}</span>
              <span className="text-gray-400 text-xs">Ctrl+A</span>
            </div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.expandSelection")}</span>
              <span className="text-gray-400 text-xs">Shift+Alt+Right</span>
            </div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.shrinkSelection")}</span>
              <span className="text-gray-400 text-xs">Shift+Alt+Left</span>
            </div>
            <div className="border-t border-[#3c3c3c] my-1"></div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.copyLineUp")}</span>
              <span className="text-gray-400 text-xs">Shift+Alt+Up</span>
            </div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.copyLineDown")}</span>
              <span className="text-gray-400 text-xs">Shift+Alt+Down</span>
            </div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.moveLineUp")}</span>
              <span className="text-gray-400 text-xs">Alt+Up</span>
            </div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.moveLineDown")}</span>
              <span className="text-gray-400 text-xs">Alt+Down</span>
            </div>
            <div className="border-t border-[#3c3c3c] my-1"></div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.addCursorAbove")}</span>
              <span className="text-gray-400 text-xs">Ctrl+Alt+Up</span>
            </div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.addCursorBelow")}</span>
              <span className="text-gray-400 text-xs">Ctrl+Alt+Down</span>
            </div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.addCursorsToLineEnds")}</span>
              <span className="text-gray-400 text-xs">Shift+Alt+I</span>
            </div>
          </div>
        )}
      </div>

      {/* View Menu */}
      <div className="relative">
        <span
          className={`cursor-pointer px-2 py-1 ${activeMenu === "view" ? "bg-[#505050]" : "hover:bg-[#505050]"}`}
          onClick={() => toggleMenu("view")}
        >
          {t("common.view")}
        </span>
        {activeMenu === "view" && (
          <div className="absolute left-0 top-full mt-0 w-64 bg-[#252526] shadow-lg z-50 text-white">
            <div
              className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer"
              onClick={() => handleMenuItemClick(onQuickOpen)}
            >
              <span>{t("menu.commandPalette")}</span>
              <span className="text-gray-400 text-xs">Ctrl+Shift+P</span>
            </div>
            <div className="border-t border-[#3c3c3c] my-1"></div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.appearance")}</span>
              <span className="text-gray-400 text-xs">▶</span>
            </div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.editorLayout")}</span>
              <span className="text-gray-400 text-xs">▶</span>
            </div>
            <div className="border-t border-[#3c3c3c] my-1"></div>
            <div
              className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer"
              onClick={() => handleMenuItemClick(onToggleSidebar)}
            >
              <span>{t("explorer.title")}</span>
              <span className="text-gray-400 text-xs">Ctrl+Shift+E</span>
            </div>
            <div
              className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer"
              onClick={() => handleMenuItemClick(onFindInFiles)}
            >
              <span>{t("search.title")}</span>
              <span className="text-gray-400 text-xs">Ctrl+Shift+F</span>
            </div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.sourceControl")}</span>
              <span className="text-gray-400 text-xs">Ctrl+Shift+G</span>
            </div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.run")}</span>
              <span className="text-gray-400 text-xs">Ctrl+Shift+D</span>
            </div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.extensions")}</span>
              <span className="text-gray-400 text-xs">Ctrl+Shift+X</span>
            </div>
            <div className="border-t border-[#3c3c3c] my-1"></div>
            <div
              className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer"
              onClick={() => handleMenuItemClick(onToggleTerminal)}
            >
              <span>{t("terminal.title")}</span>
              <span className="text-gray-400 text-xs">Ctrl+`</span>
            </div>
            <div className="border-t border-[#3c3c3c] my-1"></div>
            <div
              className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer"
              onClick={() => handleMenuItemClick(onToggleWordWrap)}
            >
              <span>{t("menu.wordWrap")}</span>
              <span className="text-gray-400 text-xs">Alt+Z</span>
            </div>
          </div>
        )}
      </div>

      {/* Go Menu */}
      <div className="relative">
        <span
          className={`cursor-pointer px-2 py-1 ${activeMenu === "go" ? "bg-[#505050]" : "hover:bg-[#505050]"}`}
          onClick={() => toggleMenu("go")}
        >
          {t("common.go")}
        </span>
        {activeMenu === "go" && (
          <div className="absolute left-0 top-full mt-0 w-64 bg-[#252526] shadow-lg z-50 text-white">
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.back")}</span>
              <span className="text-gray-400 text-xs">Alt+Left</span>
            </div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.forward")}</span>
              <span className="text-gray-400 text-xs">Alt+Right</span>
            </div>
            <div className="border-t border-[#3c3c3c] my-1"></div>
            <div
              className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer"
              onClick={() => handleMenuItemClick(onQuickOpen)}
            >
              <span>{t("menu.goToFile")}</span>
              <span className="text-gray-400 text-xs">Ctrl+P</span>
            </div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.goToSymbolInWorkspace")}</span>
              <span className="text-gray-400 text-xs">Ctrl+T</span>
            </div>
            <div
              className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer"
              onClick={() => handleMenuItemClick(onGoToLine)}
            >
              <span>{t("menu.goToLine")}</span>
              <span className="text-gray-400 text-xs">Ctrl+G</span>
            </div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.goToDefinition")}</span>
              <span className="text-gray-400 text-xs">F12</span>
            </div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.goToDeclaration")}</span>
              <span className="text-gray-400 text-xs"></span>
            </div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.goToReferences")}</span>
              <span className="text-gray-400 text-xs">Shift+F12</span>
            </div>
          </div>
        )}
      </div>

      {/* Run Menu */}
      <div className="relative">
        <span
          className={`cursor-pointer px-2 py-1 ${activeMenu === "run" ? "bg-[#505050]" : "hover:bg-[#505050]"}`}
          onClick={() => toggleMenu("run")}
        >
          {t("common.run")}
        </span>
        {activeMenu === "run" && (
          <div className="absolute left-0 top-full mt-0 w-64 bg-[#252526] shadow-lg z-50 text-white">
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.startDebugging")}</span>
              <span className="text-gray-400 text-xs">F5</span>
            </div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.runWithoutDebugging")}</span>
              <span className="text-gray-400 text-xs">Ctrl+F5</span>
            </div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.stopDebugging")}</span>
              <span className="text-gray-400 text-xs">Shift+F5</span>
            </div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.restartDebugging")}</span>
              <span className="text-gray-400 text-xs">Ctrl+Shift+F5</span>
            </div>
            <div className="border-t border-[#3c3c3c] my-1"></div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.stepOver")}</span>
              <span className="text-gray-400 text-xs">F10</span>
            </div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.stepInto")}</span>
              <span className="text-gray-400 text-xs">F11</span>
            </div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.stepOut")}</span>
              <span className="text-gray-400 text-xs">Shift+F11</span>
            </div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.continue")}</span>
              <span className="text-gray-400 text-xs">F5</span>
            </div>
            <div className="border-t border-[#3c3c3c] my-1"></div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.toggleBreakpoint")}</span>
              <span className="text-gray-400 text-xs">F9</span>
            </div>
          </div>
        )}
      </div>

      {/* Terminal Menu */}
      <div className="relative">
        <span
          className={`cursor-pointer px-2 py-1 ${activeMenu === "terminal" ? "bg-[#505050]" : "hover:bg-[#505050]"}`}
          onClick={() => toggleMenu("terminal")}
        >
          {t("common.terminal")}
        </span>
        {activeMenu === "terminal" && (
          <div className="absolute left-0 top-full mt-0 w-64 bg-[#252526] shadow-lg z-50 text-white">
            <div
              className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer"
              onClick={() => handleMenuItemClick(onToggleTerminal)}
            >
              <span>{t("menu.newTerminal")}</span>
              <span className="text-gray-400 text-xs">Ctrl+Shift+`</span>
            </div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.splitTerminal")}</span>
              <span className="text-gray-400 text-xs">Ctrl+Shift+5</span>
            </div>
            <div className="border-t border-[#3c3c3c] my-1"></div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.runTask")}</span>
              <span className="text-gray-400 text-xs"></span>
            </div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.runBuildTask")}</span>
              <span className="text-gray-400 text-xs">Ctrl+Shift+B</span>
            </div>
            <div className="border-t border-[#3c3c3c] my-1"></div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.configureTasks")}</span>
              <span className="text-gray-400 text-xs"></span>
            </div>
          </div>
        )}
      </div>

      {/* Help Menu */}
      <div className="relative">
        <span
          className={`cursor-pointer px-2 py-1 ${activeMenu === "help" ? "bg-[#505050]" : "hover:bg-[#505050]"}`}
          onClick={() => toggleMenu("help")}
        >
          {t("common.help")}
        </span>
        {activeMenu === "help" && (
          <div className="absolute left-0 top-full mt-0 w-64 bg-[#252526] shadow-lg z-50 text-white">
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.welcome")}</span>
              <span className="text-gray-400 text-xs"></span>
            </div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.documentation")}</span>
              <span className="text-gray-400 text-xs"></span>
            </div>
            <div className="border-t border-[#3c3c3c] my-1"></div>
            <div
              className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer"
              onClick={() => handleMenuItemClick(onShowShortcuts)}
            >
              <span>{t("menu.keyboardShortcuts")}</span>
              <span className="text-gray-400 text-xs"></span>
            </div>
            <div className="border-t border-[#3c3c3c] my-1"></div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.checkForUpdates")}</span>
              <span className="text-gray-400 text-xs"></span>
            </div>
            <div className="border-t border-[#3c3c3c] my-1"></div>
            <div className="px-4 py-1 flex justify-between hover:bg-[#094771] cursor-pointer">
              <span>{t("menu.about")}</span>
              <span className="text-gray-400 text-xs"></span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
