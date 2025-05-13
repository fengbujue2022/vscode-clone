"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import type { ReactNode } from "react"

type ResizeDirection = "horizontal" | "vertical" | "both"

interface ResizablePanelProps {
  children: ReactNode
  direction: ResizeDirection
  defaultSize?: number
  minSize?: number
  maxSize?: number
  className?: string
  style?: React.CSSProperties
  onResize?: (newSize: number) => void
  resizeFrom?: "start" | "end"
}

export default function ResizablePanel({
  children,
  direction,
  defaultSize = 250,
  minSize = 100,
  maxSize = 800,
  className = "",
  style = {},
  onResize,
  resizeFrom = "end",
}: ResizablePanelProps) {
  const [size, setSize] = useState(defaultSize)
  const panelRef = useRef<HTMLDivElement>(null)
  const resizingRef = useRef<{
    isResizing: boolean
    startPos: number
    startSize: number
  }>({
    isResizing: false,
    startPos: 0,
    startSize: 0,
  })

  // Handle mouse down event
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()

    if (panelRef.current) {
      resizingRef.current = {
        isResizing: true,
        startPos: direction === "horizontal" ? e.clientX : e.clientY,
        startSize: size,
      }
    }
  }

  // Handle mouse move and mouse up events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingRef.current.isResizing) return

      const { startPos, startSize } = resizingRef.current
      const currentPos = direction === "horizontal" ? e.clientX : e.clientY
      const posDiff = resizeFrom === "end" ? currentPos - startPos : startPos - currentPos

      const newSize = Math.max(minSize, Math.min(maxSize, startSize + posDiff))
      setSize(newSize)

      if (onResize) {
        onResize(newSize)
      }
    }

    const handleMouseUp = () => {
      resizingRef.current.isResizing = false
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [direction, minSize, maxSize, onResize, resizeFrom])

  // Calculate styles
  const getStyles = (): React.CSSProperties => {
    const baseStyles = {
      position: "relative" as const,
      overflow: "hidden",
      ...style,
    }

    if (direction === "horizontal") {
      return {
        ...baseStyles,
        width: `${size}px`,
      }
    } else if (direction === "vertical") {
      return {
        ...baseStyles,
        height: `${size}px`,
      }
    }

    return baseStyles
  }

  // Get resize handle styles and position
  const getHandleStyles = (): React.CSSProperties => {
    if (direction === "horizontal") {
      return resizeFrom === "end"
        ? { width: "5px", height: "100%", top: 0, right: 0, cursor: "e-resize" }
        : { width: "5px", height: "100%", top: 0, left: 0, cursor: "w-resize" }
    } else if (direction === "vertical") {
      return resizeFrom === "end"
        ? { width: "100%", height: "5px", bottom: 0, left: 0, cursor: "s-resize" }
        : { width: "100%", height: "5px", top: 0, left: 0, cursor: "n-resize" }
    }

    return {}
  }

  return (
    <div ref={panelRef} className={`resizable-panel ${className}`} style={getStyles()}>
      {children}
      <div
        className="resize-handle absolute bg-transparent z-10 hover:bg-[#007acc33]"
        style={getHandleStyles()}
        onMouseDown={handleMouseDown}
      />
    </div>
  )
}
