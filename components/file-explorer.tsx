"use client"

import type React from "react"

import { useState } from "react"
import type { File } from "@/lib/types"
import {
  ChevronRight,
  ChevronDown,
  FolderIcon,
  FileIcon,
  FileIcon as FileTs,
  FileIcon as FileHtml,
  FileCodeIcon as FileCss,
  FileText,
  Plus,
  Trash,
  Edit,
  Copy,
} from "lucide-react"
import { getFileIconByName } from "@/lib/utils"
import { FileJsonIcon as FileJs } from "lucide-react"
import { useI18n } from "@/lib/i18n"

interface FileExplorerProps {
  files: File[]
  onFileSelect: (fileId: string) => void
  activeFileId: string | null
  onNewFile: () => void
}

export default function FileExplorer({ files, onFileSelect, activeFileId, onNewFile }: FileExplorerProps) {
  const { t } = useI18n()
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    root: true,
  })
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean
    x: number
    y: number
    fileId: string
  } | null>(null)
  const [newItemType, setNewItemType] = useState<"file" | "folder" | null>(null)
  const [newItemParentId, setNewItemParentId] = useState<string | null>(null)
  const [newItemName, setNewItemName] = useState("")

  const toggleFolder = (folderId: string) => {
    setExpandedFolders({
      ...expandedFolders,
      [folderId]: !expandedFolders[folderId],
    })
  }

  const getFileIcon = (file: File) => {
    if (file.type === "folder") {
      return <FolderIcon size={16} className="text-[#dcb67a]" />
    }

    const iconType = getFileIconByName(file.name)

    switch (iconType) {
      case "js":
        return <FileJs size={16} className="text-[#e6cd83]" />
      case "ts":
        return <FileTs size={16} className="text-[#3178c6]" />
      case "html":
        return <FileHtml size={16} className="text-[#e34c26]" />
      case "css":
        return <FileCss size={16} className="text-[#563d7c]" />
      case "json":
        return <FileJs size={16} className="text-[#f5de19]" />
      case "md":
        return <FileText size={16} className="text-[#ffffff]" />
      case "py":
        return <FileIcon size={16} className="text-[#3572A5]" />
      default:
        return <FileIcon size={16} className="text-[#cccccc]" />
    }
  }

  const handleContextMenu = (e: React.MouseEvent, fileId: string) => {
    e.preventDefault()
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      fileId,
    })
  }

  const closeContextMenu = () => {
    setContextMenu(null)
  }

  const startNewItem = (type: "file" | "folder", parentId: string) => {
    setNewItemType(type)
    setNewItemParentId(parentId)
    setNewItemName("")
    closeContextMenu()
  }

  const cancelNewItem = () => {
    setNewItemType(null)
    setNewItemParentId(null)
    setNewItemName("")
  }

  const createItem = () => {
    if (!newItemType || !newItemParentId || !newItemName.trim()) {
      cancelNewItem()
      return
    }

    // In a real app, you would update the files state here
    // For now, we'll just cancel the operation
    cancelNewItem()
  }

  const renderFileTree = (fileId: string, depth = 0) => {
    const file = files.find((f) => f.id === fileId)
    if (!file) return null

    const isFolder = file.type === "folder"
    const isExpanded = expandedFolders[file.id] || false
    const isActive = file.id === activeFileId

    return (
      <div key={file.id} style={{ paddingLeft: `${depth * 8}px` }}>
        <div
          className={`flex items-center py-1 px-2 cursor-pointer hover:bg-[#2a2d2e] ${isActive && !isFolder ? "bg-[#37373d]" : ""}`}
          onClick={() => (isFolder ? toggleFolder(file.id) : onFileSelect(file.id))}
          onContextMenu={(e) => handleContextMenu(e, file.id)}
        >
          {isFolder && (
            <span
              className="mr-1"
              onClick={(e) => {
                e.stopPropagation()
                toggleFolder(file.id)
              }}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          )}
          <span className="mr-1">{getFileIcon(file)}</span>
          <span className="text-sm truncate">{file.name}</span>
          {file.isDirty && <span className="ml-1 text-xs">•</span>}
        </div>

        {isFolder && isExpanded && (
          <div>
            {newItemType && newItemParentId === file.id && (
              <div className="flex items-center py-1 px-2 ml-4">
                <span className="mr-1">
                  {newItemType === "folder" ? <FolderIcon size={16} /> : <FileIcon size={16} />}
                </span>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={newItemType === "folder" ? t("explorer.newFolder") : t("explorer.newFile")}
                  className="bg-[#3c3c3c] text-white px-1 py-0.5 text-sm border border-[#3c3c3c] focus:border-[#007fd4] focus:outline-none"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") createItem()
                    if (e.key === "Escape") cancelNewItem()
                  }}
                  onBlur={cancelNewItem}
                />
              </div>
            )}
            {file.children?.map((childId) => renderFileTree(childId, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-2 flex items-center justify-between">
        <span className="text-xs font-bold uppercase text-gray-400">{t("explorer.title")}</span>
        <button
          className="text-gray-400 hover:text-white"
          onClick={onNewFile}
          title={`${t("explorer.newFile")} (Ctrl+N)`}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* 文件树 */}
      <div className="flex-1 overflow-y-auto">{renderFileTree("root")}</div>

      {contextMenu && contextMenu.visible && (
        <div
          className="fixed bg-[#252526] border border-[#3c3c3c] shadow-lg z-50 py-1"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            minWidth: "150px",
          }}
        >
          <div
            className="px-3 py-1 hover:bg-[#37373d] cursor-pointer flex items-center"
            onClick={() => {
              const file = files.find((f) => f.id === contextMenu.fileId)
              if (file && file.type === "folder") {
                startNewItem("file", contextMenu.fileId)
              }
            }}
          >
            <FileIcon size={14} className="mr-2" />
            <span className="text-sm">{t("explorer.newFile")}</span>
          </div>
          <div
            className="px-3 py-1 hover:bg-[#37373d] cursor-pointer flex items-center"
            onClick={() => {
              const file = files.find((f) => f.id === contextMenu.fileId)
              if (file && file.type === "folder") {
                startNewItem("folder", contextMenu.fileId)
              }
            }}
          >
            <FolderIcon size={14} className="mr-2" />
            <span className="text-sm">{t("explorer.newFolder")}</span>
          </div>
          <div className="border-t border-[#3c3c3c] my-1"></div>
          <div className="px-3 py-1 hover:bg-[#37373d] cursor-pointer flex items-center">
            <Edit size={14} className="mr-2" />
            <span className="text-sm">{t("explorer.rename")}</span>
          </div>
          <div className="px-3 py-1 hover:bg-[#37373d] cursor-pointer flex items-center">
            <Copy size={14} className="mr-2" />
            <span className="text-sm">{t("explorer.duplicate")}</span>
          </div>
          <div className="px-3 py-1 hover:bg-[#37373d] cursor-pointer flex items-center text-red-400">
            <Trash size={14} className="mr-2" />
            <span className="text-sm">{t("explorer.delete")}</span>
          </div>
        </div>
      )}

      {contextMenu && <div className="fixed inset-0 z-40" onClick={closeContextMenu}></div>}
    </div>
  )
}
