"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { useI18n } from "@/lib/i18n"
import { X, Plus, ChevronDown, Maximize2, Minimize2, TerminalIcon } from "lucide-react"
import terminalService, { type TerminalSession } from "@/lib/terminal-service"

interface TerminalProps {
  onClose: () => void
}

interface TerminalCommand {
  command: string
  output: string
  error: string | null
  timestamp: Date
}

interface TerminalTab {
  id: string
  name: string
  session: TerminalSession
}

export default function Terminal({ onClose }: TerminalProps) {
  const { t } = useI18n()
  const [input, setInput] = useState("")
  const [commandHistory, setCommandHistory] = useState<TerminalCommand[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [inputHistory, setInputHistory] = useState<string[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [terminalTabs, setTerminalTabs] = useState<TerminalTab[]>([])
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [isMaximized, setIsMaximized] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  // Get the active terminal session
  const activeTab = terminalTabs[activeTabIndex]
  const activeSession = activeTab?.session

  // Initialize terminal service and create a session
  useEffect(() => {
    const initTerminal = async () => {
      await terminalService.initialize()

      const newSession = terminalService.createSession()
      const terminalType = terminalService.getDefaultTerminalType()

      // Create initial tab
      setTerminalTabs([
        {
          id: `terminal-${Date.now()}`,
          name: terminalType === "powershell" ? "pwsh" : terminalType,
          session: newSession,
        },
      ])

      // Add welcome message
      setCommandHistory([
        {
          command: "",
          output: "",
          error: null,
          timestamp: new Date(),
        },
      ])
    }

    initTerminal()

    return () => {
      // Clean up sessions when component unmounts
      terminalTabs.forEach((tab) => {
        terminalService.closeSession(tab.session.id)
      })
    }
  }, [])

  // Auto-scroll to bottom when command history changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [commandHistory])

  // Focus input when terminal is opened
  useEffect(() => {
    inputRef.current?.focus()
  }, [activeTabIndex])

  // Listen for terminal events
  useEffect(() => {
    const handleTerminalCleared = (sessionId: string) => {
      if (activeSession && sessionId === activeSession.id) {
        setCommandHistory([])
      }
    }

    terminalService.on("terminal-cleared", handleTerminalCleared)

    return () => {
      terminalService.off("terminal-cleared", handleTerminalCleared)
    }
  }, [activeSession])

  // Get the terminal prompt
  const getPrompt = useCallback(() => {
    if (!activeSession) return "$ "

    if (activeSession.type === "powershell") {
      return `PS ${activeSession.cwd}> `
    } else if (activeSession.type === "cmd") {
      return `${activeSession.cwd}> `
    } else {
      return `user@host:${activeSession.cwd}$ `
    }
  }, [activeSession])

  // Execute command
  const executeCommand = useCallback(
    async (cmd: string) => {
      if (!cmd.trim() || !activeSession) return

      // Add to input history
      setInputHistory((prev) => [...prev, cmd])
      setHistoryIndex(-1)

      // Show command in terminal
      setCommandHistory((prev) => [
        ...prev,
        {
          command: cmd,
          output: "",
          error: null,
          timestamp: new Date(),
        },
      ])

      setInput("")
      setIsExecuting(true)

      try {
        // Execute command via terminal service
        const result = await terminalService.executeCommand(activeSession.id, cmd)

        // Update command history with result
        setCommandHistory((prev) => {
          const newHistory = [...prev]
          const lastIndex = newHistory.length - 1

          if (lastIndex >= 0) {
            newHistory[lastIndex] = {
              ...newHistory[lastIndex],
              output: result.output,
              error: result.error,
            }
          }

          return newHistory
        })
      } catch (error) {
        // Handle error
        setCommandHistory((prev) => {
          const newHistory = [...prev]
          const lastIndex = newHistory.length - 1

          if (lastIndex >= 0) {
            newHistory[lastIndex] = {
              ...newHistory[lastIndex],
              error: error instanceof Error ? error.message : "Unknown error",
            }
          }

          return newHistory
        })
      } finally {
        setIsExecuting(false)
      }
    },
    [activeSession],
  )

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Handle up/down arrow keys for history navigation
      if (e.key === "ArrowUp") {
        e.preventDefault()

        if (inputHistory.length > 0) {
          const newIndex = historyIndex < inputHistory.length - 1 ? historyIndex + 1 : historyIndex
          setHistoryIndex(newIndex)
          setInput(inputHistory[inputHistory.length - 1 - newIndex] || "")
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault()

        if (historyIndex > 0) {
          const newIndex = historyIndex - 1
          setHistoryIndex(newIndex)
          setInput(inputHistory[inputHistory.length - 1 - newIndex] || "")
        } else if (historyIndex === 0) {
          setHistoryIndex(-1)
          setInput("")
        }
      } else if (e.key === "Enter") {
        e.preventDefault()
        if (!isExecuting) {
          executeCommand(input)
        }
      } else if (e.key === "Tab") {
        e.preventDefault()
        // Tab completion could be implemented here
      } else if (e.key === "c" && e.ctrlKey) {
        // Handle Ctrl+C to cancel current command or create a new line
        if (isExecuting) {
          setIsExecuting(false)
          setCommandHistory((prev) => [
            ...prev,
            {
              command: "",
              output: "^C",
              error: null,
              timestamp: new Date(),
            },
          ])
        } else if (input) {
          setInput("")
          setCommandHistory((prev) => [
            ...prev,
            {
              command: "",
              output: "^C",
              error: null,
              timestamp: new Date(),
            },
          ])
        }
      } else if (e.key === "l" && e.ctrlKey) {
        // Handle Ctrl+L to clear screen
        e.preventDefault()
        setCommandHistory([])
      }
    },
    [input, historyIndex, inputHistory, isExecuting, executeCommand],
  )

  // Create a new terminal tab
  const createNewTerminal = () => {
    const newSession = terminalService.createSession()
    const terminalType = terminalService.getDefaultTerminalType()

    const newTab: TerminalTab = {
      id: `terminal-${Date.now()}`,
      name: terminalType === "powershell" ? "pwsh" : terminalType,
      session: newSession,
    }

    setTerminalTabs([...terminalTabs, newTab])
    setActiveTabIndex(terminalTabs.length)
    setCommandHistory([])
    setInputHistory([])
    setHistoryIndex(-1)
    setInput("")
    setShowDropdown(false)

    // Focus the input
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  // Switch to a terminal tab
  const switchToTab = (index: number) => {
    setActiveTabIndex(index)
    setCommandHistory([]) // Clear the display for the new tab

    // Focus the input
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  // Close a terminal tab
  const closeTab = (index: number, e: React.MouseEvent) => {
    e.stopPropagation()

    if (terminalTabs.length === 1) {
      // If it's the last tab, close the terminal panel
      onClose()
      return
    }

    const newTabs = [...terminalTabs]
    const removedTab = newTabs.splice(index, 1)[0]

    // Close the session
    terminalService.closeSession(removedTab.session.id)

    setTerminalTabs(newTabs)

    // Adjust active tab index if needed
    if (index <= activeTabIndex) {
      setActiveTabIndex(Math.max(0, activeTabIndex - 1))
    }
  }

  // Toggle maximize/restore terminal panel
  const toggleMaximize = () => {
    setIsMaximized(!isMaximized)
    // In a real implementation, this would resize the terminal panel
  }

  return (
    <div className={`h-full flex flex-col ${isMaximized ? "fixed inset-0 z-50 bg-[#1e1e1e]" : ""}`}>
      {/* Terminal header */}
      <div className="flex items-center justify-between bg-[#252526] border-b border-[#3c3c3c]">
        {/* Left side - tabs */}
        <div className="flex items-center">
          <div className="flex items-center px-4 py-1 text-[#cccccc] uppercase text-xs font-semibold">
            {t("terminal.title")}
          </div>

          <div className="relative">
            <button className="text-gray-400 hover:text-white p-1" onClick={() => setShowDropdown(!showDropdown)}>
              <ChevronDown size={14} />
            </button>

            {showDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-[#252526] border border-[#3c3c3c] rounded shadow-lg z-10">
                <button
                  className="flex items-center w-full px-3 py-2 text-sm text-left hover:bg-[#37373d]"
                  onClick={createNewTerminal}
                >
                  <Plus size={14} className="mr-2" />
                  {t("terminal.newTerminal")}
                </button>
                <button
                  className="flex items-center w-full px-3 py-2 text-sm text-left hover:bg-[#37373d]"
                  onClick={() => setCommandHistory([])}
                >
                  <X size={14} className="mr-2" />
                  {t("terminal.clearTerminal")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right side - terminal selector and controls */}
        <div className="flex items-center">
          {/* Terminal tabs */}
          <div className="flex items-center mr-2">
            {terminalTabs.map((tab, index) => (
              <div
                key={tab.id}
                className={`flex items-center px-3 py-1 cursor-pointer border-r border-[#3c3c3c] ${
                  index === activeTabIndex ? "bg-[#1e1e1e]" : "bg-[#2d2d2d] hover:bg-[#2a2a2a]"
                }`}
                onClick={() => switchToTab(index)}
              >
                <TerminalIcon size={14} className="mr-2 text-[#cccccc]" />
                <span className="text-sm">{tab.name}</span>
                <button className="ml-2 text-gray-500 hover:text-white" onClick={(e) => closeTab(index, e)}>
                  <X size={12} />
                </button>
              </div>
            ))}

            <button className="px-2 py-1 text-gray-400 hover:text-white" onClick={createNewTerminal}>
              <Plus size={14} />
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center">
            <button
              className="px-2 py-1 text-gray-400 hover:text-white"
              onClick={toggleMaximize}
              title={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <button className="px-2 py-1 text-gray-400 hover:text-white" onClick={onClose}>
              <X size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Terminal content */}
      <div
        ref={terminalRef}
        className="flex-1 p-2 font-mono text-sm overflow-auto bg-[#1e1e1e]"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Command history */}
        {commandHistory.map((item, index) => (
          <div key={index} className="mb-1">
            {item.command && (
              <div className="flex">
                <span className="text-green-500 mr-1">{getPrompt()}</span>
                <span className="text-white">{item.command}</span>
              </div>
            )}
            {item.output && <div className="whitespace-pre-wrap text-gray-300">{item.output}</div>}
            {item.error && <div className="whitespace-pre-wrap text-red-400">{item.error}</div>}
          </div>
        ))}

        {/* Current command line */}
        <div className="flex items-center">
          <span className="text-green-500 mr-1">{getPrompt()}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-white"
            disabled={isExecuting}
            autoFocus
          />
        </div>

        {/* Show spinner when executing command */}
        {isExecuting && (
          <div className="ml-2 mt-1 text-gray-400">
            <span className="inline-block animate-spin mr-2">⠋</span>
            Executing...
          </div>
        )}
      </div>
    </div>
  )
}
