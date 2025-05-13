"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import type { File } from "@/lib/types"
import { X, ChevronRight } from "lucide-react"
import { getFileIconByName } from "@/lib/utils"
import { FileIcon, FileJsonIcon, FileCodeIcon, FileText } from "lucide-react"
import { useI18n } from "@/lib/i18n"

interface TabBarProps {
  files: File[]
  openFiles: string[]
  activeFileId: string | null
  onFileSelect: (fileId: string) => void
  onFileClose: (fileId: string) => void
  onReorderTabs: (sourceIndex: number, targetIndex: number) => void
  onNewFile: () => void
  // 添加以下新属性
  onPinTab?: (fileId: string) => void
  onSplitEditor?: (fileId: string, direction: "up" | "down" | "left" | "right") => void
  onRevealInExplorer?: (fileId: string) => void
  onCopyPath?: (fileId: string, type: "full" | "relative" | "remote") => void
  onKeepOpen?: (fileId: string) => void
  onFindReferences?: (fileId: string) => void
}

export default function TabBar({
  files,
  openFiles,
  activeFileId,
  onFileSelect,
  onFileClose,
  onReorderTabs,
  onNewFile,
  // 添加新的props，并设置默认值为空函数
  onPinTab = () => {},
  onSplitEditor = () => {},
  onRevealInExplorer = () => {},
  onCopyPath = () => {},
  onKeepOpen = () => {},
  onFindReferences = () => {},
}: TabBarProps) {
  const { t } = useI18n()
  const [draggedTab, setDraggedTab] = useState<string | null>(null)
  const tabRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const tabBarRef = useRef<HTMLDivElement>(null)
  const tabContainerRef = useRef<HTMLDivElement>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean
    x: number
    y: number
    fileId: string | null
  } | null>(null)

  // Check if tab bar is overflowing
  useEffect(() => {
    const checkOverflow = () => {
      if (tabContainerRef.current) {
        const { scrollWidth, clientWidth } = tabContainerRef.current
        setIsOverflowing(scrollWidth > clientWidth)
      }
    }

    checkOverflow()

    // Use ResizeObserver to detect size changes more reliably
    const resizeObserver = new ResizeObserver(checkOverflow)
    if (tabContainerRef.current) {
      resizeObserver.observe(tabContainerRef.current)
    }

    window.addEventListener("resize", checkOverflow)
    return () => {
      window.removeEventListener("resize", checkOverflow)
      resizeObserver.disconnect()
    }
  }, [openFiles])

  // Handle mouse wheel horizontal scrolling
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (tabContainerRef.current) {
        // Prevent the default vertical scroll
        e.preventDefault()

        // Determine scroll amount - use deltaY for vertical wheel movement
        // and convert it to horizontal scrolling
        const scrollAmount = e.deltaY

        // Apply the scroll - positive deltaY scrolls right, negative scrolls left
        tabContainerRef.current.scrollLeft += scrollAmount

        // Update scroll position state
        setScrollPosition(tabContainerRef.current.scrollLeft)
      }
    }

    // Add the wheel event listener to the tab container
    const tabContainer = tabContainerRef.current
    if (tabContainer) {
      tabContainer.addEventListener("wheel", handleWheel, { passive: false })
    }

    // Clean up the event listener when component unmounts
    return () => {
      if (tabContainer) {
        tabContainer.removeEventListener("wheel", handleWheel)
      }
    }
  }, [])

  // Scroll tab into view when selected
  useEffect(() => {
    if (activeFileId && tabRefs.current[activeFileId] && tabContainerRef.current) {
      const tabElement = tabRefs.current[activeFileId]
      const tabContainer = tabContainerRef.current

      if (tabElement) {
        const tabRect = tabElement.getBoundingClientRect()
        const containerRect = tabContainer.getBoundingClientRect()

        if (tabRect.left < containerRect.left) {
          // Tab is to the left of the visible area
          tabContainer.scrollLeft -= containerRect.left - tabRect.left
        } else if (tabRect.right > containerRect.right) {
          // Tab is to the right of the visible area
          tabContainer.scrollLeft += tabRect.right - containerRect.right
        }
      }
    }
  }, [activeFileId])

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenu && contextMenu.visible) {
        setContextMenu(null)
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [contextMenu])

  const getOpenFiles = () => {
    return openFiles.map((id) => files.find((file) => file.id === id)).filter(Boolean) as File[]
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, fileId: string) => {
    setDraggedTab(fileId)
    // Set the drag image to be the tab element
    if (e.dataTransfer && tabRefs.current[fileId]) {
      // Create a semi-transparent clone of the tab for the drag image
      const tabElement = tabRefs.current[fileId]
      if (tabElement) {
        const rect = tabElement.getBoundingClientRect()
        const ghostElement = tabElement.cloneNode(true) as HTMLDivElement

        ghostElement.style.width = `${rect.width}px`
        ghostElement.style.opacity = "0.7"
        ghostElement.style.position = "absolute"
        ghostElement.style.top = "-1000px"
        ghostElement.style.backgroundColor = "#2d2d2d"

        document.body.appendChild(ghostElement)

        e.dataTransfer.setDragImage(ghostElement, rect.width / 2, rect.height / 2)

        // Clean up the ghost element after drag starts
        setTimeout(() => {
          document.body.removeChild(ghostElement)
        }, 0)
      }
    }
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    // Add visual indicator for drop target
    e.currentTarget.classList.add("bg-[#3c3c3c]")
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    // Remove visual indicator
    e.currentTarget.classList.remove("bg-[#3c3c3c]")
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetFileId: string) => {
    e.preventDefault()
    e.currentTarget.classList.remove("bg-[#3c3c3c]")

    if (draggedTab && draggedTab !== targetFileId) {
      const sourceIndex = openFiles.findIndex((id) => id === draggedTab)
      const targetIndex = openFiles.findIndex((id) => id === targetFileId)

      if (sourceIndex !== -1 && targetIndex !== -1) {
        onReorderTabs(sourceIndex, targetIndex)
      }
    }

    setDraggedTab(null)
  }

  const handleDragEnd = () => {
    setDraggedTab(null)
  }

  const handleScroll = (direction: "left" | "right") => {
    if (tabContainerRef.current) {
      const scrollAmount = 200 // Increase scroll amount for better usability
      const newScrollPosition =
        direction === "left"
          ? Math.max(0, tabContainerRef.current.scrollLeft - scrollAmount)
          : tabContainerRef.current.scrollLeft + scrollAmount

      tabContainerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: "smooth",
      })

      setScrollPosition(newScrollPosition)
    }
  }

  const handleContextMenu = (e: React.MouseEvent, fileId: string | null = null) => {
    e.preventDefault()
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      fileId,
    })
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    // Only trigger if clicking on the tab bar itself, not on a tab
    if ((e.target as HTMLElement).closest("[data-tab-id]") === null) {
      onNewFile()
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

  // Check if file is temporary (unsaved)
  const isTemporaryFile = (file: File) => {
    return file.name.startsWith("untitled-")
  }

  // 复制路径相关功能
  const handleCopyPath = (fileId: string | null, type: "full" | "relative" | "remote") => {
    if (fileId) {
      onCopyPath(fileId, type)
    }
    setContextMenu(null)
  }

  // 在资源管理器中显示
  const handleRevealInExplorer = (fileId: string | null) => {
    if (fileId) {
      onRevealInExplorer(fileId)
    }
    setContextMenu(null)
  }

  // 保持打开/固定标签页
  const handleKeepOpen = (fileId: string | null) => {
    if (fileId) {
      onKeepOpen(fileId)
    }
    setContextMenu(null)
  }

  // 固定标签页
  const handlePinTab = (fileId: string | null) => {
    if (fileId) {
      onPinTab(fileId)
    }
    setContextMenu(null)
  }

  // 拆分编辑器
  const handleSplitEditor = (fileId: string | null, direction: "up" | "down" | "left" | "right") => {
    if (fileId) {
      onSplitEditor(fileId, direction)
    }
    setContextMenu(null)
  }

  // 查找文件引用
  const handleFindReferences = (fileId: string | null) => {
    if (fileId) {
      onFindReferences(fileId)
    }
    setContextMenu(null)
  }

  // Context menu actions
  const handleCloseTab = (fileId: string | null) => {
    if (fileId) onFileClose(fileId)
    setContextMenu(null)
  }

  const handleCloseOtherTabs = (fileId: string | null) => {
    if (fileId) {
      openFiles.forEach((id) => {
        if (id !== fileId) {
          onFileClose(id)
        }
      })
    }
    setContextMenu(null)
  }

  const handleCloseTabsToRight = (fileId: string | null) => {
    if (fileId) {
      const index = openFiles.indexOf(fileId)
      if (index !== -1) {
        const tabsToClose = openFiles.slice(index + 1)
        tabsToClose.forEach((id) => onFileClose(id))
      }
    }
    setContextMenu(null)
  }

  const handleCloseSavedTabs = () => {
    openFiles.forEach((id) => {
      const file = files.find((f) => f.id === id)
      if (file && !file.isDirty) {
        onFileClose(id)
      }
    })
    setContextMenu(null)
  }

  const handleCloseAllTabs = () => {
    openFiles.forEach((id) => onFileClose(id))
    setContextMenu(null)
  }

  // Check if we need to show scroll buttons
  const shouldShowLeftScroll = scrollPosition > 0
  const shouldShowRightScroll =
    tabContainerRef.current &&
    scrollPosition < tabContainerRef.current.scrollWidth - tabContainerRef.current.clientWidth - 5 // 5px buffer

  return (
    <div
      ref={tabBarRef}
      className="flex bg-[#252526] border-b border-[#3c3c3c] relative"
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => handleContextMenu(e)}
    >
      {/* Left scroll button */}
      {isOverflowing && shouldShowLeftScroll && (
        <button
          className="absolute left-0 top-0 bottom-0 z-10 px-1 bg-[#252526] hover:bg-[#2a2a2a] flex items-center justify-center"
          onClick={() => handleScroll("left")}
        >
          <span className="text-gray-400">◀</span>
        </button>
      )}

      {/* Tab container with horizontal scrolling */}
      <div
        ref={tabContainerRef}
        className="flex-1 overflow-x-auto whitespace-nowrap"
        onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="flex min-w-max">
          {getOpenFiles().map((file) => {
            const isActive = file.id === activeFileId
            return (
              <div
                key={file.id}
                ref={(el) => (tabRefs.current[file.id] = el)}
                data-tab-id={file.id}
                className={`
                  flex items-center px-3 py-1 border-r border-[#3c3c3c] cursor-pointer min-w-[120px] max-w-[200px]
                  ${isActive ? "bg-[#1e1e1e]" : "bg-[#2d2d2d] hover:bg-[#2a2a2a]"}
                  ${draggedTab === file.id ? "opacity-50" : "opacity-100"}
                  transition-opacity duration-200 group
                `}
                onClick={() => onFileSelect(file.id)}
                onContextMenu={(e) => handleContextMenu(e, file.id)}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, file.id)}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, file.id)}
                onDragEnd={handleDragEnd}
              >
                <div className="mr-2 flex-shrink-0">{getFileIcon(file)}</div>
                <span className={`text-sm truncate flex-1 ${isTemporaryFile(file) ? "italic" : ""}`} title={file.name}>
                  {file.name}
                </span>

                {/* Modified indicator */}
                {file.isDirty && <span className="ml-1 text-xs flex-shrink-0">●</span>}

                {/* Close button - only visible on active tab */}
                {isActive && (
                  <button
                    className="ml-2 text-gray-400 hover:text-white flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      onFileClose(file.id)
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Right scroll button */}
      {isOverflowing && shouldShowRightScroll && (
        <button
          className="absolute right-0 top-0 bottom-0 z-10 px-1 bg-[#252526] hover:bg-[#2a2a2a] flex items-center justify-center"
          onClick={() => handleScroll("right")}
        >
          <span className="text-gray-400">▶</span>
        </button>
      )}

      {/* Context Menu */}
      {contextMenu && contextMenu.visible && (
        <div
          className="fixed bg-[#252526] border border-[#3c3c3c] shadow-lg z-50 w-64 text-sm"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="px-4 py-2 hover:bg-[#094771] cursor-pointer flex justify-between"
            onClick={() => handleCloseTab(contextMenu.fileId)}
          >
            <span>Close</span>
            <span className="text-gray-400 text-xs">Ctrl+F4</span>
          </div>
          <div
            className="px-4 py-2 hover:bg-[#094771] cursor-pointer flex justify-between"
            onClick={() => handleCloseOtherTabs(contextMenu.fileId)}
          >
            <span>Close Others</span>
            <span className="text-gray-400 text-xs"></span>
          </div>
          <div
            className="px-4 py-2 hover:bg-[#094771] cursor-pointer flex justify-between"
            onClick={() => handleCloseTabsToRight(contextMenu.fileId)}
          >
            <span>Close to the Right</span>
            <span className="text-gray-400 text-xs"></span>
          </div>
          <div
            className="px-4 py-2 hover:bg-[#094771] cursor-pointer flex justify-between"
            onClick={handleCloseSavedTabs}
          >
            <span>Close Saved</span>
            <span className="text-gray-400 text-xs">Ctrl+K U</span>
          </div>
          <div
            className="px-4 py-2 hover:bg-[#094771] cursor-pointer flex justify-between"
            onClick={handleCloseAllTabs}
          >
            <span>Close All</span>
            <span className="text-gray-400 text-xs">Ctrl+K W</span>
          </div>
          <div className="border-t border-[#3c3c3c] my-1"></div>
          <div
            className="px-4 py-2 hover:bg-[#094771] cursor-pointer flex justify-between"
            onClick={() => handleCopyPath(contextMenu.fileId, "full")}
          >
            <span>Copy Path</span>
            <span className="text-gray-400 text-xs">Shift+Alt+C</span>
          </div>
          <div
            className="px-4 py-2 hover:bg-[#094771] cursor-pointer flex justify-between"
            onClick={() => handleCopyPath(contextMenu.fileId, "relative")}
          >
            <span>Copy Relative Path</span>
            <span className="text-gray-400 text-xs">Ctrl+K Ctrl+Shift+C</span>
          </div>
          <div
            className="px-4 py-2 hover:bg-[#094771] cursor-pointer flex justify-between"
            onClick={() => handleCopyPath(contextMenu.fileId, "remote")}
          >
            <span>Copy Remote File URL</span>
            <span className="text-gray-400 text-xs"></span>
          </div>
          <div className="px-4 py-2 hover:bg-[#094771] cursor-pointer flex justify-between">
            <span>Copy Remote File URL From...</span>
            <span className="text-gray-400 text-xs"></span>
          </div>
          <div className="border-t border-[#3c3c3c] my-1"></div>
          <div className="px-4 py-2 hover:bg-[#094771] cursor-pointer flex justify-between">
            <span>Reopen Editor With...</span>
            <span className="text-gray-400 text-xs"></span>
          </div>
          <div className="border-t border-[#3c3c3c] my-1"></div>
          <div className="px-4 py-2 hover:bg-[#094771] cursor-pointer flex justify-between items-center">
            <span>Share</span>
            <ChevronRight size={14} className="text-gray-400" />
          </div>
          <div className="px-4 py-2 hover:bg-[#094771] cursor-pointer flex justify-between items-center">
            <span>Open Changes</span>
            <ChevronRight size={14} className="text-gray-400" />
          </div>
          <div className="px-4 py-2 hover:bg-[#094771] cursor-pointer flex justify-between items-center">
            <span>Open on Remote (Web)</span>
            <ChevronRight size={14} className="text-gray-400" />
          </div>
          <div className="px-4 py-2 hover:bg-[#094771] cursor-pointer flex justify-between items-center">
            <span>File History</span>
            <ChevronRight size={14} className="text-gray-400" />
          </div>
          <div className="border-t border-[#3c3c3c] my-1"></div>
          <div
            className="px-4 py-2 hover:bg-[#094771] cursor-pointer flex justify-between"
            onClick={() => handleRevealInExplorer(contextMenu.fileId)}
          >
            <span>Reveal in File Explorer</span>
            <span className="text-gray-400 text-xs">Shift+Alt+R</span>
          </div>
          <div className="px-4 py-2 hover:bg-[#094771] cursor-pointer flex justify-between">
            <span>Reveal in Explorer View</span>
            <span className="text-gray-400 text-xs"></span>
          </div>
          <div className="border-t border-[#3c3c3c] my-1"></div>
          <div
            className="px-4 py-2 hover:bg-[#094771] cursor-pointer flex justify-between"
            onClick={() => handleKeepOpen(contextMenu.fileId)}
          >
            <span>Keep Open</span>
            <span className="text-gray-400 text-xs">Ctrl+K Enter</span>
          </div>
          <div
            className="px-4 py-2 hover:bg-[#094771] cursor-pointer flex justify-between"
            onClick={() => handlePinTab(contextMenu.fileId)}
          >
            <span>Pin</span>
            <span className="text-gray-400 text-xs">Ctrl+K Shift+Enter</span>
          </div>
          <div className="border-t border-[#3c3c3c] my-1"></div>
          <div
            className="px-4 py-2 hover:bg-[#094771] cursor-pointer flex justify-between"
            onClick={() => handleSplitEditor(contextMenu.fileId, "up")}
          >
            <span>Split Up</span>
            <span className="text-gray-400 text-xs">Ctrl+K Ctrl+↑</span>
          </div>
          <div
            className="px-4 py-2 hover:bg-[#094771] cursor-pointer flex justify-between"
            onClick={() => handleSplitEditor(contextMenu.fileId, "down")}
          >
            <span>Split Down</span>
            <span className="text-gray-400 text-xs"></span>
          </div>
          <div
            className="px-4 py-2 hover:bg-[#094771] cursor-pointer flex justify-between"
            onClick={() => handleSplitEditor(contextMenu.fileId, "left")}
          >
            <span>Split Left</span>
            <span className="text-gray-400 text-xs"></span>
          </div>
          <div
            className="px-4 py-2 hover:bg-[#094771] cursor-pointer flex justify-between"
            onClick={() => handleSplitEditor(contextMenu.fileId, "right")}
          >
            <span>Split Right</span>
            <span className="text-gray-400 text-xs"></span>
          </div>
          <div className="border-t border-[#3c3c3c] my-1"></div>
          <div className="px-4 py-2 hover:bg-[#094771] cursor-pointer flex justify-between">
            <span>Split in Group</span>
            <span className="text-gray-400 text-xs">Ctrl+K Ctrl+Shift+\</span>
          </div>
          <div className="border-t border-[#3c3c3c] my-1"></div>
          <div className="px-4 py-2 hover:bg-[#094771] cursor-pointer flex justify-between">
            <span>Move into New Window</span>
            <span className="text-gray-400 text-xs"></span>
          </div>
          <div className="px-4 py-2 hover:bg-[#094771] cursor-pointer flex justify-between">
            <span>Copy into New Window</span>
            <span className="text-gray-400 text-xs">Ctrl+K O</span>
          </div>
          <div className="border-t border-[#3c3c3c] my-1"></div>
          <div
            className="px-4 py-2 hover:bg-[#094771] cursor-pointer flex justify-between"
            onClick={() => handleFindReferences(contextMenu.fileId)}
          >
            <span>Find File References</span>
            <span className="text-gray-400 text-xs"></span>
          </div>
        </div>
      )}
    </div>
  )
}
