"use client"

import type { ReactNode } from "react"
import type { Theme } from "@/lib/types"

interface ThemeProviderProps {
  children: ReactNode
  theme: Theme
}

export function ThemeProvider({ children, theme }: ThemeProviderProps) {
  return <div className={`theme-${theme}`}>{children}</div>
}
