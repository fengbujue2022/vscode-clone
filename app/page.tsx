"use client"

import { useState, useEffect, useCallback } from "react"
import Editor from "@/components/editor"
import FileExplorer from "@/components/file-explorer"
import SearchPanel from "@/components/search-panel"
import TabBar from "@/components/tab-bar"
import StatusBar from "@/components/status-bar"
import ActivityBar from "@/components/activity-bar"
import Terminal from "@/components/terminal"
import ResizableContainer from "@/components/resizable-container"
import ResizablePanel from "@/components/resizable-panel"
import MenuBar from "@/components/menu-bar"
import { ThemeProvider } from "@/components/theme-provider"
import { KeyboardShortcutsProvider, useKeyboardShortcuts } from "@/components/keyboard-shortcuts-provider"
import { I18nProvider } from "@/components/i18n-provider"
import { useI18n } from "@/lib/i18n"
import { KeyboardShortcutsDialog } from "@/components/keyboard-shortcuts-dialog"
import { QuickOpenDialog } from "@/components/quick-open-dialog"
import { GoToLineDialog } from "@/components/go-to-line-dialog"
import type { File, Theme } from "@/lib/types"
import { defaultFiles, createNewFile } from "@/lib/default-files"
import settingsService from "@/lib/settings-service"
import { v4 as uuidv4 } from "uuid"

function CodeEditorContent() {
  const { t } = useI18n()
  const [files, setFiles] = useState<File[]>(defaultFiles)
  const [activeFileId, setActiveFileId] = useState<string | null>(files[0]?.id || null)
  const [theme, setTheme] = useState<Theme>(settingsService.getSetting("theme"))
  const [sidebarVisible, setSidebarVisible] = useState(settingsService.getSetting("sidebarVisible"))
  const [terminalVisible, setTerminalVisible] = useState(settingsService.getSetting("terminalVisible"))
  const [openFiles, setOpenFiles] = useState<string[]>([files[0]?.id || ""])
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false)
  const [showQuickOpenDialog, setShowQuickOpenDialog] = useState(false)
  const [showGoToLineDialog, setShowGoToLineDialog] = useState(false)
  const [fontSize, setFontSize] = useState(settingsService.getSetting("fontSize"))
  const [wordWrap, setWordWrap] = useState(settingsService.getSetting("wordWrap"))
  const [minimapEnabled, setMinimapEnabled] = useState(settingsService.getSetting("minimapEnabled"))
  const [activeSidebarTab, setActiveSidebarTab] = useState("explorer")
  const [sidebarWidth, setSidebarWidth] = useState(settingsService.getSetting("sidebarWidth"))
  const [terminalHeight, setTerminalHeight] = useState(settingsService.getSetting("terminalHeight"))

  const { registerShortcutHandler } = useKeyboardShortcuts()

  const activeFile = files.find((file) => file.id === activeFileId) || null

  // Save settings when they change
  useEffect(() => {
    settingsService.updateSettings({
      theme,
      fontSize,
      wordWrap,
      minimapEnabled,
      sidebarVisible,
      terminalVisible,
      sidebarWidth,
      terminalHeight,
    })
  }, [theme, fontSize, wordWrap, minimapEnabled, sidebarVisible, terminalVisible, sidebarWidth, terminalHeight])

  // Use useCallback to memoize handler functions
  const handleFileSave = useCallback((fileId: string) => {
    setFiles((prevFiles) => prevFiles.map((file) => (file.id === fileId ? { ...file, isDirty: false } : file)))
  }, [])

  const handleNewFile = useCallback(() => {
    const newFile = createNewFile(`untitled-${uuidv4().slice(0, 8)}.js`, "root", "javascript")
    setFiles((prevFiles) => [...prevFiles, newFile])
    setActiveFileId(newFile.id)
    setOpenFiles((prevOpenFiles) => [...prevOpenFiles, newFile.id])
  }, [])

  const toggleSidebar = useCallback(() => {
    setSidebarVisible((prev) => !prev)
  }, [])

  const toggleTerminal = useCallback(() => {
    setTerminalVisible((prev) => !prev)
  }, [])

  const handleZoomIn = useCallback(() => {
    setFontSize((prev) => Math.min(prev + 1, 30))
  }, [])

  const handleZoomOut = useCallback(() => {
    setFontSize((prev) => Math.max(prev - 1, 8))
  }, [])

  const handleResetZoom = useCallback(() => {
    setFontSize(14)
  }, [])

  const handleToggleWordWrap = useCallback(() => {
    setWordWrap((prev) => (prev === "on" ? "off" : "on"))
  }, [])

  const handleToggleMinimap = useCallback(() => {
    setMinimapEnabled((prev) => !prev)
  }, [])

  const handleChangeTheme = useCallback((newTheme: Theme) => {
    setTheme(newTheme)
  }, [])

  const handleSelectAll = useCallback(() => {
    if (window.getSelection && document.createRange) {
      const selection = window.getSelection()
      const range = document.createRange()
      if (selection && range) {
        selection.removeAllRanges()
        range.selectNodeContents(document.body)
        selection.addRange(range)
      }
    }
  }, [])

  const handleCommentLine = useCallback(() => {
    // This is handled in the Editor component
  }, [])

  const handleFormatDocument = useCallback(() => {
    // This is handled in the Editor component
  }, [])

  const handlePinTab = (fileId: string) => {
    // 在实际应用中，这里应该更新文件的固定状态
    console.log(`Pin tab: ${fileId}`)
    // 示例实现：将固定的标签移到最前面
    const pinnedFileIndex = openFiles.indexOf(fileId)
    if (pinnedFileIndex > 0) {
      const newOpenFiles = [...openFiles]
      const [pinnedFile] = newOpenFiles.splice(pinnedFileIndex, 1)
      newOpenFiles.unshift(pinnedFile)
      setOpenFiles(newOpenFiles)
    }
  }

  const handleSplitEditor = (fileId: string, direction: "up" | "down" | "left" | "right") => {
    // 在实际应用中，这里应该创建一个新的编辑器视图
    console.log(`Split editor ${direction}: ${fileId}`)
  }

  const handleRevealInExplorer = (fileId: string) => {
    // 在实际应用中，这里应该在文件资源管理器中高亮显示文件
    console.log(`Reveal in explorer: ${fileId}`)
    // 确保侧边栏可见并切换到资源管理器视图
    setSidebarVisible(true)
    setActiveSidebarTab("explorer")
  }

  const handleCopyPath = (fileId: string, type: "full" | "relative" | "remote") => {
    // 在实际应用中，这里应该复制文件路径到剪贴板
    const file = files.find((f) => f.id === fileId)
    if (file) {
      let path = ""
      switch (type) {
        case "full":
          path = `/project/${file.name}`
          break
        case "relative":
          path = `./${file.name}`
          break
        case "remote":
          path = `https://github.com/user/repo/blob/main/${file.name}`
          break
      }
      console.log(`Copy ${type} path: ${path}`)
      // 在实际应用中，这里应该使用clipboard API复制路径
      // navigator.clipboard.writeText(path);
    }
  }

  const handleKeepOpen = (fileId: string) => {
    // 在实际应用中，这里应该标记文件为"保持打开"状态
    console.log(`Keep open: ${fileId}`)
  }

  const handleFindReferences = (fileId: string) => {
    // 在实际应用中，这里应该查找并显示文件的引用
    console.log(`Find references: ${fileId}`)
    // 切换到搜索视图
    setSidebarVisible(true)
    setActiveSidebarTab("search")
  }

  // Register keyboard shortcut handlers
  useEffect(() => {
    // File operations
    registerShortcutHandler("save", () => {
      if (activeFileId) handleFileSave(activeFileId)
    })

    registerShortcutHandler("saveAll", () => {
      openFiles.forEach((fileId) => handleFileSave(fileId))
    })

    registerShortcutHandler("newFile", handleNewFile)

    // View controls
    registerShortcutHandler("toggleSidebar", toggleSidebar)
    registerShortcutHandler("toggleTerminal", toggleTerminal)

    // Search & navigation
    registerShortcutHandler("quickOpen", () => setShowQuickOpenDialog(true))
    registerShortcutHandler("goToLine", () => setShowGoToLineDialog(true))
    registerShortcutHandler("findInFiles", () => {
      setSidebarVisible(true)
      setActiveSidebarTab("search")
    })

    // Editor settings
    registerShortcutHandler("zoomIn", handleZoomIn)
    registerShortcutHandler("zoomOut", handleZoomOut)
    registerShortcutHandler("resetZoom", handleResetZoom)
    registerShortcutHandler("toggleWordWrap", handleToggleWordWrap)
    registerShortcutHandler("toggleMinimap", handleToggleMinimap)
    registerShortcutHandler("changeTheme", () =>
      handleChangeTheme(theme === "vs" ? "vs-dark" : theme === "vs-dark" ? "hc-black" : "vs"),
    )

    // No need to return a cleanup function here, as this component won't be unmounted
    // If cleanup is needed, it should be done when the component unmounts
  }, [
    registerShortcutHandler,
    activeFileId,
    openFiles,
    handleFileSave,
    handleNewFile,
    toggleSidebar,
    toggleTerminal,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleToggleWordWrap,
    handleToggleMinimap,
    handleChangeTheme,
    theme,
  ])

  const handleFileSelect = (fileId: string) => {
    setActiveFileId(fileId)
    if (!openFiles.includes(fileId)) {
      setOpenFiles([...openFiles, fileId])
    }
  }

  const handleFileChange = (fileId: string, content: string) => {
    setFiles(files.map((file) => (file.id === fileId ? { ...file, content, isDirty: true } : file)))
  }

  const handleFileClose = (fileId: string) => {
    const newOpenFiles = openFiles.filter((id) => id !== fileId)
    setOpenFiles(newOpenFiles)
    if (activeFileId === fileId && newOpenFiles.length > 0) {
      setActiveFileId(newOpenFiles[newOpenFiles.length - 1])
    } else if (newOpenFiles.length === 0) {
      setActiveFileId(null)
    }
  }

  const handleReorderTabs = (sourceIndex: number, targetIndex: number) => {
    const newOpenFiles = [...openFiles]
    const [movedItem] = newOpenFiles.splice(sourceIndex, 1)
    newOpenFiles.splice(targetIndex, 0, movedItem)
    setOpenFiles(newOpenFiles)
  }

  const handleQuickOpen = (fileId: string) => {
    setShowQuickOpenDialog(false)
    handleFileSelect(fileId)
  }

  const handleGoToLine = (lineNumber: number) => {
    setShowGoToLineDialog(false)
    // The actual line navigation is handled in the Editor component
  }

  const handleSidebarTabChange = (tab: string) => {
    setActiveSidebarTab(tab)
    if (!sidebarVisible) {
      setSidebarVisible(true)
    }
  }

  const handleFind = () => {
    // This will be handled by the Editor component
  }

  const handleReplace = () => {
    // This will be handled by the Editor component
  }

  const handleFindInFiles = () => {
    setSidebarVisible(true)
    setActiveSidebarTab("search")
  }

  return (
    <ThemeProvider theme={theme}>
      <ResizableContainer className="bg-[#1e1e1e] text-white shadow-lg overflow-hidden" fullScreen>
        <div className="flex flex-col h-full">
          {/* Top Menu Bar */}
          <MenuBar
            onNewFile={handleNewFile}
            onOpenFile={() => {}} // Placeholder for now
            onSave={() => activeFileId && handleFileSave(activeFileId)}
            onSaveAll={() => openFiles.forEach((fileId) => handleFileSave(fileId))}
            onFind={handleFind}
            onReplace={handleReplace}
            onFindInFiles={handleFindInFiles}
            onToggleTerminal={toggleTerminal}
            onToggleSidebar={toggleSidebar}
            onShowShortcuts={() => setShowShortcutsDialog(true)}
            onGoToLine={() => setShowGoToLineDialog(true)}
            onQuickOpen={() => setShowQuickOpenDialog(true)}
            onChangeTheme={handleChangeTheme}
            onToggleWordWrap={handleToggleWordWrap}
            onToggleMinimap={handleToggleMinimap}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetZoom={handleResetZoom}
            onSelectAll={handleSelectAll}
            onCommentLine={handleCommentLine}
            onFormatDocument={handleFormatDocument}
          />

          <div className="flex flex-1 overflow-hidden">
            {/* Activity Bar - fixed width */}
            <div className="w-12 bg-[#333333] flex flex-col items-center py-2 border-r border-[#252526]">
              <ActivityBar
                toggleSidebar={toggleSidebar}
                toggleTerminal={toggleTerminal}
                activeTab={activeSidebarTab}
                onTabChange={handleSidebarTabChange}
              />
            </div>

            {/* Sidebar with File Explorer or Search - resizable width */}
            {sidebarVisible && (
              <ResizablePanel
                direction="horizontal"
                defaultSize={sidebarWidth}
                minSize={150}
                maxSize={500}
                className="border-r border-[#252526] overflow-y-auto"
                onResize={setSidebarWidth}
              >
                {activeSidebarTab === "explorer" ? (
                  <FileExplorer
                    files={files}
                    onFileSelect={handleFileSelect}
                    activeFileId={activeFileId}
                    onNewFile={handleNewFile}
                  />
                ) : activeSidebarTab === "search" ? (
                  <SearchPanel files={files} onFileSelect={handleFileSelect} />
                ) : null}
              </ResizablePanel>
            )}

            {/* Editor Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Tab Bar */}
              <TabBar
                files={files}
                openFiles={openFiles}
                activeFileId={activeFileId}
                onFileSelect={handleFileSelect}
                onFileClose={handleFileClose}
                onReorderTabs={handleReorderTabs}
                onNewFile={handleNewFile}
                // 添加新的props
                onPinTab={handlePinTab}
                onSplitEditor={handleSplitEditor}
                onRevealInExplorer={handleRevealInExplorer}
                onCopyPath={handleCopyPath}
                onKeepOpen={handleKeepOpen}
                onFindReferences={handleFindReferences}
              />

              {/* Monaco Editor */}
              <div className="flex-1 h-full overflow-hidden">
                {activeFile ? (
                  <Editor
                    file={activeFile}
                    onChange={(content) => handleFileChange(activeFile.id, content)}
                    onSave={() => handleFileSave(activeFile.id)}
                    theme={theme}
                    fontSize={fontSize}
                    wordWrap={wordWrap}
                    minimapEnabled={minimapEnabled}
                    goToLine={showGoToLineDialog}
                  />
                ) : (
                  <div className="flex-1 h-full flex items-center justify-center text-gray-500">
                    {t("editor.noFileSelected")}
                  </div>
                )}
              </div>

              {/* Terminal Panel - resizable height */}
              {terminalVisible && (
                <ResizablePanel
                  direction="vertical"
                  defaultSize={terminalHeight}
                  minSize={100}
                  maxSize={500}
                  className="border-t border-[#3c3c3c] bg-[#1e1e1e] overflow-hidden"
                  onResize={setTerminalHeight}
                  resizeFrom="start"
                >
                  <Terminal onClose={toggleTerminal} />
                </ResizablePanel>
              )}
            </div>
          </div>

          {/* Status Bar */}
          <StatusBar
            activeFile={activeFile}
            theme={theme}
            onThemeChange={handleChangeTheme}
            fontSize={fontSize}
            wordWrap={wordWrap}
            onShowShortcuts={() => setShowShortcutsDialog(true)}
          />

          {/* Dialogs */}
          <KeyboardShortcutsDialog isOpen={showShortcutsDialog} onClose={() => setShowShortcutsDialog(false)} />

          <QuickOpenDialog
            isOpen={showQuickOpenDialog}
            onClose={() => setShowQuickOpenDialog(false)}
            files={files.filter((file) => file.type === "file")}
            onSelectFile={handleQuickOpen}
          />

          <GoToLineDialog
            isOpen={showGoToLineDialog}
            onClose={() => setShowGoToLineDialog(false)}
            onGoToLine={handleGoToLine}
          />
        </div>
      </ResizableContainer>
    </ThemeProvider>
  )
}

function I18nWrapper() {
  return (
    <I18nProvider defaultLocale={settingsService.getSetting("locale")}>
      <CodeEditorContent />
    </I18nProvider>
  )
}

export default function CodeEditorApp() {
  return (
    <KeyboardShortcutsProvider>
      <I18nWrapper />
    </KeyboardShortcutsProvider>
  )
}
