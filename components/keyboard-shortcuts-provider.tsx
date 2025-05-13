"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { ShortcutAction, Shortcut } from "@/lib/keyboard-shortcuts"
import { defaultShortcuts, matchesShortcut } from "@/lib/keyboard-shortcuts"

interface KeyboardShortcutsContextType {
  shortcuts: Shortcut[]
  registerShortcutHandler: (action: ShortcutAction, handler: () => void) => void
  unregisterShortcutHandler: (action: ShortcutAction) => void
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined)

export function useKeyboardShortcuts() {
  const context = useContext(KeyboardShortcutsContext)
  if (!context) {
    throw new Error("useKeyboardShortcuts must be used within a KeyboardShortcutsProvider")
  }
  return context
}

interface KeyboardShortcutsProviderProps {
  children: React.ReactNode
}

export function KeyboardShortcutsProvider({ children }: KeyboardShortcutsProviderProps) {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>(defaultShortcuts)
  const [handlers, setHandlers] = useState<Record<ShortcutAction, (() => void) | null>>({} as any)

  // 使用 useCallback 记忆化这些函数，防止它们在每次渲染时重新创建
  const registerShortcutHandler = useCallback((action: ShortcutAction, handler: () => void) => {
    setHandlers((prev) => ({ ...prev, [action]: handler }))
  }, [])

  const unregisterShortcutHandler = useCallback((action: ShortcutAction) => {
    setHandlers((prev) => ({ ...prev, [action]: null }))
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if the event target is an input or textarea
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement).isContentEditable
      ) {
        // Allow global shortcuts even in input fields
        const globalShortcut = shortcuts.find((shortcut) => shortcut.global && matchesShortcut(event, shortcut))
        if (!globalShortcut) return
      }

      // Check if the key event matches any registered shortcut
      for (const shortcut of shortcuts) {
        if (matchesShortcut(event, shortcut)) {
          const handler = handlers[shortcut.action]
          if (handler) {
            if (shortcut.preventDefault) {
              event.preventDefault()
            }
            handler()
            break
          }
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [shortcuts, handlers])

  return (
    <KeyboardShortcutsContext.Provider value={{ shortcuts, registerShortcutHandler, unregisterShortcutHandler }}>
      {children}
    </KeyboardShortcutsContext.Provider>
  )
}
