export type ShortcutAction =
  | "save"
  | "saveAll"
  | "newFile"
  | "openFile"
  | "find"
  | "replace"
  | "findInFiles"
  | "goToLine"
  | "toggleSidebar"
  | "toggleTerminal"
  | "undo"
  | "redo"
  | "cut"
  | "copy"
  | "paste"
  | "selectAll"
  | "formatDocument"
  | "commentLine"
  | "foldCode"
  | "unfoldCode"
  | "indentLine"
  | "outdentLine"
  | "quickOpen"
  | "toggleFullScreen"
  | "zoomIn"
  | "zoomOut"
  | "resetZoom"
  | "toggleWordWrap"
  | "toggleMinimap"
  | "changeTheme"

export interface Shortcut {
  action: ShortcutAction
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  description: string
  preventDefault?: boolean
  global?: boolean
}

// Define default shortcuts (VS Code style)
export const defaultShortcuts: Shortcut[] = [
  {
    action: "save",
    key: "s",
    ctrlKey: true,
    description: "common.save",
    preventDefault: true,
    global: true,
  },
  {
    action: "saveAll",
    key: "s",
    ctrlKey: true,
    shiftKey: true,
    description: "common.saveAll",
    preventDefault: true,
    global: true,
  },
  {
    action: "newFile",
    key: "n",
    ctrlKey: true,
    description: "common.new",
    preventDefault: true,
    global: true,
  },
  {
    action: "openFile",
    key: "o",
    ctrlKey: true,
    description: "common.open",
    preventDefault: true,
    global: true,
  },
  {
    action: "find",
    key: "f",
    ctrlKey: true,
    description: "common.find",
    preventDefault: true,
    global: true,
  },
  {
    action: "replace",
    key: "h",
    ctrlKey: true,
    description: "common.replace",
    preventDefault: true,
    global: true,
  },
  {
    action: "findInFiles",
    key: "f",
    ctrlKey: true,
    shiftKey: true,
    description: "search.findInFiles",
    preventDefault: true,
    global: true,
  },
  {
    action: "goToLine",
    key: "g",
    ctrlKey: true,
    description: "goToLine.title",
    preventDefault: true,
    global: true,
  },
  {
    action: "toggleSidebar",
    key: "b",
    ctrlKey: true,
    description: "explorer.title",
    preventDefault: true,
    global: true,
  },
  {
    action: "toggleTerminal",
    key: "`",
    ctrlKey: true,
    description: "terminal.title",
    preventDefault: true,
    global: true,
  },
  {
    action: "undo",
    key: "z",
    ctrlKey: true,
    description: "common.undo",
    preventDefault: true,
  },
  {
    action: "redo",
    key: "y",
    ctrlKey: true,
    description: "common.redo",
    preventDefault: true,
  },
  {
    action: "cut",
    key: "x",
    ctrlKey: true,
    description: "common.cut",
    preventDefault: false,
  },
  {
    action: "copy",
    key: "c",
    ctrlKey: true,
    description: "common.copy",
    preventDefault: false,
  },
  {
    action: "paste",
    key: "v",
    ctrlKey: true,
    description: "common.paste",
    preventDefault: false,
  },
  {
    action: "selectAll",
    key: "a",
    ctrlKey: true,
    description: "common.selectAll",
    preventDefault: true,
  },
  {
    action: "formatDocument",
    key: "f",
    altKey: true,
    shiftKey: true,
    description: "editor.formatDocument",
    preventDefault: true,
  },
  {
    action: "commentLine",
    key: "/",
    ctrlKey: true,
    description: "editor.toggleComment",
    preventDefault: true,
  },
  {
    action: "foldCode",
    key: "[",
    ctrlKey: true,
    shiftKey: true,
    description: "editor.foldCode",
    preventDefault: true,
  },
  {
    action: "unfoldCode",
    key: "]",
    ctrlKey: true,
    shiftKey: true,
    description: "editor.unfoldCode",
    preventDefault: true,
  },
  {
    action: "indentLine",
    key: "]",
    ctrlKey: true,
    description: "editor.indentLine",
    preventDefault: true,
  },
  {
    action: "outdentLine",
    key: "[",
    ctrlKey: true,
    description: "editor.outdentLine",
    preventDefault: true,
  },
  {
    action: "quickOpen",
    key: "p",
    ctrlKey: true,
    description: "quickOpen.title",
    preventDefault: true,
    global: true,
  },
  {
    action: "toggleFullScreen",
    key: "F11",
    description: "common.fullScreen",
    preventDefault: true,
    global: true,
  },
  {
    action: "zoomIn",
    key: "=",
    ctrlKey: true,
    description: "common.zoomIn",
    preventDefault: true,
    global: true,
  },
  {
    action: "zoomOut",
    key: "-",
    ctrlKey: true,
    description: "common.zoomOut",
    preventDefault: true,
    global: true,
  },
  {
    action: "resetZoom",
    key: "0",
    ctrlKey: true,
    description: "common.resetZoom",
    preventDefault: true,
    global: true,
  },
  {
    action: "toggleWordWrap",
    key: "z",
    altKey: true,
    description: "editor.wordWrap",
    preventDefault: true,
  },
  {
    action: "toggleMinimap",
    key: "m",
    ctrlKey: true,
    shiftKey: true,
    description: "editor.minimap",
    preventDefault: true,
  },
  {
    action: "changeTheme",
    key: "k",
    ctrlKey: true,
    description: "common.theme",
    preventDefault: true,
    global: true,
  },
]

// Helper function to check if a keyboard event matches a shortcut
export function matchesShortcut(event: KeyboardEvent, shortcut: Shortcut): boolean {
  return (
    event.key.toLowerCase() === shortcut.key.toLowerCase() &&
    !!event.ctrlKey === !!shortcut.ctrlKey &&
    !!event.shiftKey === !!shortcut.shiftKey &&
    !!event.altKey === !!shortcut.altKey &&
    !!event.metaKey === !!shortcut.metaKey
  )
}

// Format shortcut for display
export function formatShortcut(shortcut: Shortcut): string {
  const parts: string[] = []

  if (shortcut.ctrlKey) parts.push("Ctrl")
  if (shortcut.shiftKey) parts.push("Shift")
  if (shortcut.altKey) parts.push("Alt")
  if (shortcut.metaKey) parts.push("Meta")

  // Format special keys
  let key = shortcut.key
  if (key === " ") key = "Space"
  else if (key.length === 1) key = key.toUpperCase()

  parts.push(key)

  return parts.join("+")
}
