"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import type { ReactNode } from "react"

interface ResizableContainerProps {
  children: ReactNode
  minWidth?: number
  minHeight?: number
  defaultWidth?: number
  defaultHeight?: number
  fullScreen?: boolean
  className?: string
}

export default function ResizableContainer({
  children,
  minWidth = 800,
  minHeight = 600,
  defaultWidth = 1200,
  defaultHeight = 800,
  fullScreen = false,
  className = "",
}: ResizableContainerProps) {
  const [width, setWidth] = useState(defaultWidth)
  const [height, setHeight] = useState(defaultHeight)
  const containerRef = useRef<HTMLDivElement>(null)
  const resizingRef = useRef<{
    isResizing: boolean
    direction: "right" | "bottom" | "corner" | null
    startX: number
    startY: number
    startWidth: number
    startHeight: number
  }>({
    isResizing: false,
    direction: null,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
  })

  // Handle mouse down event
  const handleMouseDown = (e: React.MouseEvent, direction: "right" | "bottom" | "corner") => {
    e.preventDefault()

    if (containerRef.current) {
      resizingRef.current = {
        isResizing: true,
        direction,
        startX: e.clientX,
        startY: e.clientY,
        startWidth: containerRef.current.offsetWidth,
        startHeight: containerRef.current.offsetHeight,
      }
    }
  }

  // Handle mouse move event
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingRef.current.isResizing) return

      const { direction, startX, startY, startWidth, startHeight } = resizingRef.current

      if (direction === "right" || direction === "corner") {
        const newWidth = Math.max(startWidth + e.clientX - startX, minWidth)
        setWidth(newWidth)
      }

      if (direction === "bottom" || direction === "corner") {
        const newHeight = Math.max(startHeight + e.clientY - startY, minHeight)
        setHeight(newHeight)
      }
    }

    // Handle mouse up event
    const handleMouseUp = () => {
      resizingRef.current.isResizing = false
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [minWidth, minHeight])

  return (
    <div
      ref={containerRef}
      className={`resizable relative ${className}`}
      style={{
        width: fullScreen ? "100vw" : `${width}px`,
        height: fullScreen ? "100vh" : `${height}px`,
      }}
    >
      {children}

      {/* Right resize handle */}
      <div className="resize-handle resize-handle-right" onMouseDown={(e) => handleMouseDown(e, "right")} />

      {/* Bottom resize handle */}
      <div className="resize-handle resize-handle-bottom" onMouseDown={(e) => handleMouseDown(e, "bottom")} />

      {/* Corner resize handle */}
      <div className="resize-handle resize-handle-corner" onMouseDown={(e) => handleMouseDown(e, "corner")} />
    </div>
  )
}
