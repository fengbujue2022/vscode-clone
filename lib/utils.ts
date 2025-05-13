import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Language } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getLanguageFromFileName(fileName: string): Language {
  const extension = fileName.split(".").pop()?.toLowerCase() || ""

  switch (extension) {
    case "js":
      return "javascript"
    case "ts":
    case "tsx":
      return "typescript"
    case "html":
      return "html"
    case "css":
      return "css"
    case "json":
      return "json"
    case "md":
      return "markdown"
    case "py":
      return "python"
    default:
      return "plaintext"
  }
}

export function getFileIconByName(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase() || ""

  switch (extension) {
    case "js":
      return "js"
    case "ts":
    case "tsx":
      return "ts"
    case "html":
      return "html"
    case "css":
      return "css"
    case "json":
      return "json"
    case "md":
      return "md"
    case "py":
      return "py"
    default:
      return "file"
  }
}
