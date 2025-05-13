"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { File, Theme, FindReplaceOptions } from "@/lib/types"
import { Editor as MonacoEditor } from "@monaco-editor/react"
import { FindReplacePanel } from "./find-replace-panel"
import { useKeyboardShortcuts } from "./keyboard-shortcuts-provider"
import { useI18n } from "@/lib/i18n"

interface EditorProps {
  file: File
  onChange: (content: string) => void
  onSave: () => void
  theme: Theme
  fontSize: number
  wordWrap: "on" | "off"
  minimapEnabled: boolean
  goToLine: boolean
}

export default function Editor({
  file,
  onChange,
  onSave,
  theme,
  fontSize,
  wordWrap,
  minimapEnabled,
  goToLine,
}: EditorProps) {
  const { t } = useI18n()
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)
  const [showFindReplace, setShowFindReplace] = useState(false)
  const [isReplaceMode, setIsReplaceMode] = useState(false)
  const [findReplaceOptions, setFindReplaceOptions] = useState<FindReplaceOptions>({
    caseSensitive: false,
    wholeWord: false,
    regex: false,
  })

  const { registerShortcutHandler, unregisterShortcutHandler } = useKeyboardShortcuts()

  // 创建记忆化的处理函数
  const handleFindShortcut = useCallback(() => {
    setIsReplaceMode(false)
    setShowFindReplace(true)
  }, [])

  const handleReplaceShortcut = useCallback(() => {
    setIsReplaceMode(true)
    setShowFindReplace(true)
  }, [])

  const handleFormatDocument = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.action.formatDocument")?.run()
    }
  }, [])

  const handleCommentLine = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.action.commentLine")?.run()
    }
  }, [])

  const handleFoldCode = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.fold")?.run()
    }
  }, [])

  const handleUnfoldCode = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.unfold")?.run()
    }
  }, [])

  const handleIndentLine = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.action.indentLines")?.run()
    }
  }, [])

  const handleOutdentLine = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.action.outdentLines")?.run()
    }
  }, [])

  // Register editor-specific keyboard shortcuts
  useEffect(() => {
    registerShortcutHandler("find", handleFindShortcut)
    registerShortcutHandler("replace", handleReplaceShortcut)
    registerShortcutHandler("formatDocument", handleFormatDocument)
    registerShortcutHandler("commentLine", handleCommentLine)
    registerShortcutHandler("foldCode", handleFoldCode)
    registerShortcutHandler("unfoldCode", handleUnfoldCode)
    registerShortcutHandler("indentLine", handleIndentLine)
    registerShortcutHandler("outdentLine", handleOutdentLine)

    return () => {
      unregisterShortcutHandler("find")
      unregisterShortcutHandler("replace")
      unregisterShortcutHandler("formatDocument")
      unregisterShortcutHandler("commentLine")
      unregisterShortcutHandler("foldCode")
      unregisterShortcutHandler("unfoldCode")
      unregisterShortcutHandler("indentLine")
      unregisterShortcutHandler("outdentLine")
    }
  }, [
    registerShortcutHandler,
    unregisterShortcutHandler,
    handleFindShortcut,
    handleReplaceShortcut,
    handleFormatDocument,
    handleCommentLine,
    handleFoldCode,
    handleUnfoldCode,
    handleIndentLine,
    handleOutdentLine,
  ])

  // Handle Escape key to close find panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showFindReplace) {
        setShowFindReplace(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [showFindReplace])

  // Handle go to line
  useEffect(() => {
    if (goToLine && editorRef.current) {
      editorRef.current.getAction("editor.action.gotoLine")?.run()
    }
  }, [goToLine])

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    monacoRef.current = monaco

    // Force layout update to ensure editor renders correctly
    setTimeout(() => {
      editor.layout()
    }, 100)

    // Add editor commands
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave()
    })

    // Configure language features
    configureLanguageFeatures(monaco)

    // Fix bracket pair colorization issues
    fixBracketPairColorization(editor)
  }

  // Fix bracket pair colorization issues
  const fixBracketPairColorization = (editor: any) => {
    // Disable the default bracket pair colorization and guides
    editor.updateOptions({
      bracketPairColorization: { enabled: false },
      guides: {
        bracketPairs: false,
        bracketPairsHorizontal: false,
        highlightActiveBracketPair: false,
        indentation: true,
      },
    })

    // Apply custom editor decorations to override any remaining bracket highlighting
    const model = editor.getModel()
    if (model) {
      // Clear any existing decorations that might be causing the issue
      const oldDecorations = editor
        .getModel()
        .getAllDecorations()
        .filter((d: any) => d.options.className && d.options.className.includes("bracket"))
        .map((d: any) => d.id)

      if (oldDecorations.length > 0) {
        editor.getModel().deltaDecorations(oldDecorations, [])
      }
    }
  }

  const configureLanguageFeatures = (monaco: any) => {
    // JavaScript/TypeScript completions
    monaco.languages.registerCompletionItemProvider("javascript", {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        }

        const suggestions = [
          {
            label: "console.log",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: "console.log($1)",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Log to the console",
            range,
          },
          {
            label: "function",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "function ${1:name}(${2:params}) {\n\t${3}\n}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Function declaration",
            range,
          },
          {
            label: "setTimeout",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: "setTimeout(() => {\n\t${1}\n}, ${2:1000})",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Set a timeout",
            range,
          },
          {
            label: "const",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "const ${1:name} = ${2:value}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Declare a constant",
            range,
          },
          {
            label: "let",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "let ${1:name} = ${2:value}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Declare a variable",
            range,
          },
          {
            label: "if",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "if (${1:condition}) {\n\t${2}\n}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "If statement",
            range,
          },
          {
            label: "for",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "for (let ${1:i} = 0; ${1:i} < ${2:array}.length; ${1:i}++) {\n\t${3}\n}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "For loop",
            range,
          },
          {
            label: "arrow",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "(${1:params}) => {\n\t${2}\n}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Arrow function",
            range,
          },
        ]

        return { suggestions }
      },
    })

    // HTML completions
    monaco.languages.registerCompletionItemProvider("html", {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        }

        const suggestions = [
          {
            label: "div",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "<div>\n\t${1}\n</div>",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Div element",
            range,
          },
          {
            label: "span",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "<span>${1}</span>",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Span element",
            range,
          },
          {
            label: "a",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '<a href="${1:#}">${2:Link}</a>',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Anchor element",
            range,
          },
          {
            label: "img",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '<img src="${1}" alt="${2}" />',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Image element",
            range,
          },
          {
            label: "ul",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "<ul>\n\t<li>${1}</li>\n</ul>",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Unordered list",
            range,
          },
          {
            label: "table",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "<table>\n\t<tr>\n\t\t<td>${1}</td>\n\t</tr>\n</table>",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Table",
            range,
          },
          {
            label: "form",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "<form>\n\t${1}\n</form>",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Form",
            range,
          },
        ]

        return { suggestions }
      },
    })

    // CSS completions
    monaco.languages.registerCompletionItemProvider("css", {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        }

        const suggestions = [
          {
            label: "display",
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: "display: ${1:flex};",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Display property",
            range,
          },
          {
            label: "flex",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "display: flex;\njustify-content: ${1:center};\nalign-items: ${2:center};",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Flexbox layout",
            range,
          },
          {
            label: "grid",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "display: grid;\ngrid-template-columns: ${1:repeat(3, 1fr)};\ngap: ${2:10px};",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Grid layout",
            range,
          },
          {
            label: "position",
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: "position: ${1:relative};",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Position property",
            range,
          },
          {
            label: "media",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "@media (max-width: ${1:768px}) {\n\t${2}\n}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Media query",
            range,
          },
        ]

        return { suggestions }
      },
    })

    // Python completions
    monaco.languages.registerCompletionItemProvider("python", {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        }

        const suggestions = [
          {
            label: "def",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "def ${1:function_name}(${2:parameters}):\n\t${3:pass}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Define a function",
            range,
          },
          {
            label: "class",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "class ${1:ClassName}:\n\tdef __init__(self, ${2:parameters}):\n\t\t${3:pass}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Define a class",
            range,
          },
          {
            label: "if",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "if ${1:condition}:\n\t${2:pass}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "If statement",
            range,
          },
          {
            label: "for",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "for ${1:item} in ${2:iterable}:\n\t${3:pass}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "For loop",
            range,
          },
          {
            label: "while",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "while ${1:condition}:\n\t${2:pass}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "While loop",
            range,
          },
          {
            label: "try",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "try:\n\t${1:pass}\nexcept ${2:Exception} as ${3:e}:\n\t${4:pass}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Try/except block",
            range,
          },
        ]

        return { suggestions }
      },
    })
  }

  const handleFind = (searchText: string) => {
    if (!editorRef.current) return

    const editor = editorRef.current
    const findController = editor._actions["actions.find"]?.run

    if (findController) {
      findController()

      // Set the search string in the find widget
      setTimeout(() => {
        const findInput = document.querySelector(".monaco-editor .find-widget .input") as HTMLInputElement
        if (findInput) {
          findInput.value = searchText
          findInput.dispatchEvent(new Event("input"))
        }
      }, 100)
    }
  }

  const handleReplace = (searchText: string, replaceText: string) => {
    if (!editorRef.current) return

    const editor = editorRef.current
    const model = editor.getModel()

    if (!model) return

    const matches = model.findMatches(
      searchText,
      true,
      findReplaceOptions.regex,
      findReplaceOptions.caseSensitive,
      findReplaceOptions.wholeWord ? " " : null,
      false,
    )

    // Apply replacements in reverse order to avoid position shifts
    const edits = matches.map((match: any) => ({
      range: match.range,
      text: replaceText,
    }))

    if (edits.length > 0) {
      editor.executeEdits("replace-all", edits)
    }
  }

  return (
    <div className="relative flex-1 h-full w-full overflow-hidden">
      {showFindReplace && (
        <FindReplacePanel
          onFind={handleFind}
          onReplace={handleReplace}
          onClose={() => setShowFindReplace(false)}
          options={findReplaceOptions}
          onOptionsChange={setFindReplaceOptions}
          initialMode={isReplaceMode ? "replace" : "find"}
        />
      )}

      <MonacoEditor
        height="100%"
        width="100%"
        language={file.language}
        value={file.content}
        theme={theme}
        onChange={(value) => onChange(value || "")}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: minimapEnabled },
          scrollBeyondLastLine: false,
          fontSize: fontSize,
          lineNumbers: "on",
          renderLineHighlight: "line",
          automaticLayout: true,
          wordWrap: wordWrap,
          tabSize: 2,
          insertSpaces: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          folding: true,
          autoIndent: "full",
          formatOnPaste: true,
          formatOnType: true,
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: "on",
          quickSuggestions: true,
          snippetSuggestions: "inline",
          multiCursorModifier: "alt",
          accessibilitySupport: "off",
          renderWhitespace: "selection",
          bracketPairColorization: { enabled: false }, // Disable built-in bracket pair colorization
          guides: {
            bracketPairs: false, // Disable bracket pair guides
            indentation: true, // Keep indentation guides
          },
        }}
      />
    </div>
  )
}
