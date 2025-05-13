export type FileType = "file" | "folder"
export type Language = "javascript" | "typescript" | "html" | "css" | "json" | "markdown" | "plaintext" | "python"
export type Theme = "vs" | "vs-dark" | "hc-black"

export interface File {
  id: string
  name: string
  type: FileType
  language?: Language
  content: string
  parentId: string | null
  isDirty?: boolean
  children?: string[]
}

export interface FindReplaceOptions {
  caseSensitive: boolean
  wholeWord: boolean
  regex: boolean
}
