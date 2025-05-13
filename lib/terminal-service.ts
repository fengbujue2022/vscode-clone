// This service handles communication with the native terminal
import { EventEmitter } from "events"

export type TerminalType = "powershell" | "cmd" | "bash" | "zsh" | "unknown"
export type OperatingSystem = "windows" | "macos" | "linux" | "unknown"

export interface TerminalSession {
  id: string
  type: TerminalType
  cwd: string
  processId: number
}

export interface CommandResult {
  output: string
  error: string | null
  exitCode: number
}

class TerminalService extends EventEmitter {
  private static instance: TerminalService
  private sessions: Map<string, TerminalSession> = new Map()
  private detectedOS: OperatingSystem = "unknown"
  private defaultTerminalType: TerminalType = "unknown"
  private isInitialized = false

  private constructor() {
    super()
  }

  public static getInstance(): TerminalService {
    if (!TerminalService.instance) {
      TerminalService.instance = new TerminalService()
    }
    return TerminalService.instance
  }

  /**
   * Initialize the terminal service by detecting the OS and default terminal
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    // Detect OS
    this.detectOperatingSystem()

    // Detect default terminal based on OS
    this.detectDefaultTerminal()

    this.isInitialized = true
    this.emit("initialized", {
      os: this.detectedOS,
      terminalType: this.defaultTerminalType,
    })
  }

  /**
   * Detect the operating system
   */
  private detectOperatingSystem(): void {
    const userAgent = window.navigator.userAgent.toLowerCase()

    if (userAgent.indexOf("win") !== -1) {
      this.detectedOS = "windows"
    } else if (userAgent.indexOf("mac") !== -1) {
      this.detectedOS = "macos"
    } else if (userAgent.indexOf("linux") !== -1) {
      this.detectedOS = "linux"
    } else {
      this.detectedOS = "unknown"
    }
  }

  /**
   * Detect the default terminal based on the OS
   */
  private detectDefaultTerminal(): void {
    switch (this.detectedOS) {
      case "windows":
        this.defaultTerminalType = "powershell"
        break
      case "macos":
        this.defaultTerminalType = "zsh"
        break
      case "linux":
        this.defaultTerminalType = "bash"
        break
      default:
        this.defaultTerminalType = "bash"
    }
  }

  /**
   * Create a new terminal session
   */
  public createSession(cwd = "D:\\g\\q"): TerminalSession {
    // Use Windows-style path for PowerShell by default to match the screenshot
    const defaultCwd = this.defaultTerminalType === "powershell" ? "D:\\g\\q" : "/"

    const id = `terminal-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    const session: TerminalSession = {
      id,
      type: this.defaultTerminalType,
      cwd: cwd || defaultCwd,
      processId: Math.floor(Math.random() * 10000), // Simulate a process ID
    }

    this.sessions.set(id, session)
    this.emit("session-created", session)

    return session
  }

  /**
   * Close a terminal session
   */
  public closeSession(sessionId: string): boolean {
    const success = this.sessions.delete(sessionId)
    if (success) {
      this.emit("session-closed", sessionId)
    }
    return success
  }

  /**
   * Execute a command in a terminal session
   */
  public async executeCommand(sessionId: string, command: string): Promise<CommandResult> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Terminal session ${sessionId} not found`)
    }

    // Simulate command execution delay
    await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 300))

    // Handle built-in commands
    if (command.trim() === "clear" || command.trim() === "cls") {
      this.emit("terminal-cleared", sessionId)
      return {
        output: "",
        error: null,
        exitCode: 0,
      }
    }

    // Handle cd command to change directory
    if (command.trim().startsWith("cd ")) {
      const newPath = command.trim().substring(3)
      const updatedSession = { ...session, cwd: this.resolvePath(session.cwd, newPath) }
      this.sessions.set(sessionId, updatedSession)

      return {
        output: "",
        error: null,
        exitCode: 0,
      }
    }

    // Simulate git pull command from the screenshot
    if (command.trim() === "git pull") {
      return {
        output: "Already up to date.",
        error: null,
        exitCode: 0,
      }
    }

    // Simulate command execution based on terminal type
    return this.simulateCommandExecution(session, command)
  }

  /**
   * Simulate command execution based on terminal type
   */
  private simulateCommandExecution(session: TerminalSession, command: string): CommandResult {
    // Common commands across terminals
    if (command.trim() === "pwd") {
      return {
        output: session.cwd,
        error: null,
        exitCode: 0,
      }
    }

    if (command.trim() === "whoami") {
      return {
        output: "user",
        error: null,
        exitCode: 0,
      }
    }

    if (command.trim() === "echo $SHELL" || command.trim() === "echo %COMSPEC%") {
      const shellPath = this.getShellPath(session.type)
      return {
        output: shellPath,
        error: null,
        exitCode: 0,
      }
    }

    if (command.trim().startsWith("ls") || command.trim().startsWith("dir")) {
      return this.simulateListDirectory(session)
    }

    // Simulate git status command to match the screenshot
    if (command.trim() === "git status") {
      return {
        output: `packages/openrice/utils/domainUtil.ts      |   6 +
.../openrice/views/BizCoupon/MyBizCouponSR1.tsx  |   6 +
.../openrice/views/BizCoupon/MyBizCouponSR2.tsx  |  10 +-
packages/openrice/views/LNC/AllApplicablePoi.tsx |  78 +++++-
.../openrice/views/User/Bookmark/SelectRegion.tsx |   6 +
packages/openrice/views/booking/BookingForm.tsx  |   4 +-
20 files changed, 450 insertions(+), 311 deletions(-)`,
        error: null,
        exitCode: 0,
      }
    }

    // Terminal-specific command handling
    switch (session.type) {
      case "powershell":
        return this.simulatePowerShellCommand(command)
      case "cmd":
        return this.simulateCmdCommand(command)
      case "bash":
      case "zsh":
        return this.simulateUnixCommand(command)
      default:
        return {
          output: `Command executed: ${command}`,
          error: null,
          exitCode: 0,
        }
    }
  }

  /**
   * Simulate PowerShell command execution
   */
  private simulatePowerShellCommand(command: string): CommandResult {
    if (command.trim() === "Get-Host") {
      return {
        output:
          "Name             : ConsoleHost\nVersion          : 7.3.4\nInstanceId       : 2d3f5712-5a97-4e3e-a42d-cf3c59c17a34\nUI               : System.Management.Automation.Internal.Host.InternalHostUserInterface\nCurrentCulture   : en-US\nCurrentUICulture : en-US\nPrivateData      : Microsoft.PowerShell.ConsoleHost+ConsoleColorProxy\nDebuggerEnabled  : True\nIsRunspacePushed : False\nRunspace         : System.Management.Automation.Runspaces.LocalRunspace",
        error: null,
        exitCode: 0,
      }
    }

    if (command.trim() === "Get-Process" || command.trim().startsWith("Get-Process ")) {
      return {
        output: this.generateProcessList("powershell"),
        error: null,
        exitCode: 0,
      }
    }

    // Unknown command
    if (!this.isCommonCommand(command)) {
      return {
        output: "",
        error: `The term '${command.split(" ")[0]}' is not recognized as the name of a cmdlet, function, script file, or operable program.`,
        exitCode: 1,
      }
    }

    return {
      output: `Executed PowerShell command: ${command}`,
      error: null,
      exitCode: 0,
    }
  }

  /**
   * Simulate CMD command execution
   */
  private simulateCmdCommand(command: string): CommandResult {
    if (command.trim() === "ver") {
      return {
        output: "Microsoft Windows [Version 10.0.19045.3693]",
        error: null,
        exitCode: 0,
      }
    }

    if (command.trim() === "tasklist" || command.trim().startsWith("tasklist ")) {
      return {
        output: this.generateProcessList("cmd"),
        error: null,
        exitCode: 0,
      }
    }

    // Unknown command
    if (!this.isCommonCommand(command)) {
      return {
        output: "",
        error: `'${command.split(" ")[0]}' is not recognized as an internal or external command, operable program or batch file.`,
        exitCode: 1,
      }
    }

    return {
      output: `Executed CMD command: ${command}`,
      error: null,
      exitCode: 0,
    }
  }

  /**
   * Simulate Unix command execution (Bash/Zsh)
   */
  private simulateUnixCommand(command: string): CommandResult {
    if (command.trim() === "uname -a") {
      return {
        output:
          "Darwin MacBook-Pro.local 21.6.0 Darwin Kernel Version 21.6.0: Mon Aug 22 20:20:05 PDT 2022; root:xnu-8020.140.49~2/RELEASE_X86_64 x86_64",
        error: null,
        exitCode: 0,
      }
    }

    if (command.trim() === "ps aux" || command.trim().startsWith("ps ")) {
      return {
        output: this.generateProcessList("bash"),
        error: null,
        exitCode: 0,
      }
    }

    // Unknown command
    if (!this.isCommonCommand(command)) {
      return {
        output: "",
        error: `command not found: ${command.split(" ")[0]}`,
        exitCode: 127,
      }
    }

    return {
      output: `Executed Unix command: ${command}`,
      error: null,
      exitCode: 0,
    }
  }

  /**
   * Check if a command is common across terminals
   */
  private isCommonCommand(command: string): boolean {
    const commonCommands = [
      "echo",
      "cd",
      "pwd",
      "ls",
      "dir",
      "cat",
      "type",
      "mkdir",
      "rmdir",
      "touch",
      "rm",
      "cp",
      "mv",
      "grep",
      "find",
      "whoami",
      "date",
      "time",
      "git",
    ]

    const commandName = command.trim().split(" ")[0]
    return commonCommands.includes(commandName)
  }

  /**
   * Simulate listing directory contents
   */
  private simulateListDirectory(session: TerminalSession): CommandResult {
    const isWindows = session.type === "powershell" || session.type === "cmd"

    // Generate a list of files and directories based on the current path
    const files = [
      isWindows ? "Directory: " + session.cwd : "total 32",
      isWindows ? "" : "drwxr-xr-x  2 user  staff  4096 Nov 15 10:24 .",
      isWindows ? "" : "drwxr-xr-x  6 user  staff  4096 Nov 15 10:20 ..",
      isWindows
        ? "Mode                 LastWriteTime         Length Name"
        : "-rw-r--r--  1 user  staff  2048 Nov 15 10:22 README.md",
      isWindows
        ? "----                 -------------         ------ ----"
        : "-rw-r--r--  1 user  staff  8192 Nov 15 10:23 package.json",
      isWindows
        ? "d----          11/15/2023    10:24                src"
        : "drwxr-xr-x  4 user  staff  4096 Nov 15 10:24 src",
      isWindows
        ? "d----          11/15/2023    10:23                public"
        : "drwxr-xr-x  3 user  staff  4096 Nov 15 10:23 public",
      isWindows
        ? "-a---          11/15/2023    10:22           2048 README.md"
        : "-rw-r--r--  1 user  staff  1024 Nov 15 10:22 tsconfig.json",
      isWindows
        ? "-a---          11/15/2023    10:23           8192 package.json"
        : "-rwxr-xr-x  1 user  staff   512 Nov 15 10:21 setup.sh",
    ]

    return {
      output: files.join("\n"),
      error: null,
      exitCode: 0,
    }
  }

  /**
   * Generate a list of processes
   */
  private generateProcessList(terminalType: string): string {
    if (terminalType === "powershell") {
      return `
Handles  NPM(K)    PM(K)      WS(K)     CPU(s)     Id  SI ProcessName
-------  ------    -----      -----     ------     --  -- -----------
    435      32    94384      52496       5.70   1234   1 chrome
    128      14    12484      13792       0.13   2345   1 code
    208      25    32816      38908       0.86   3456   1 explorer
     89       9     1848       5456       0.02   4567   1 powershell
    112      12     9284      14320       0.08   5678   1 WindowsTerminal
`
    } else if (terminalType === "cmd") {
      return `
Image Name                     PID Session Name        Session#    Mem Usage
========================= ======== ================ =========== ============
System Idle Process              0 Services                   0          8 K
System                           4 Services                   0      1,480 K
Registry                       104 Services                   0     48,904 K
smss.exe                       432 Services                   0        364 K
csrss.exe                      644 Services                   0      4,040 K
chrome.exe                    1234 Console                    1     94,384 K
code.exe                      2345 Console                    1     12,484 K
explorer.exe                  3456 Console                    1     32,816 K
cmd.exe                       4567 Console                    1      1,848 K
WindowsTerminal.exe           5678 Console                    1      9,284 K
`
    } else {
      return `
USER       PID  %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
user      1234   3.0  2.5 543216 94384 ?        Sl   10:12   5:42 /usr/bin/chrome
user      2345   0.5  0.7 234567 12484 ?        Sl   10:15   0:08 /usr/bin/code
user      3456   1.2  1.9 345678 32816 ?        Sl   09:45   0:52 /usr/bin/explorer
user      4567   0.1  0.1  21456  1848 pts/0    Ss   11:30   0:01 bash
user      5678   0.3  0.5 123456  9284 pts/1    Sl+  11:35   0:05 /usr/bin/terminal
`
    }
  }

  /**
   * Get the shell path based on terminal type
   */
  private getShellPath(terminalType: TerminalType): string {
    switch (terminalType) {
      case "powershell":
        return "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe"
      case "cmd":
        return "C:\\Windows\\System32\\cmd.exe"
      case "bash":
        return "/bin/bash"
      case "zsh":
        return "/bin/zsh"
      default:
        return "/bin/sh"
    }
  }

  /**
   * Resolve a path relative to the current working directory
   */
  private resolvePath(cwd: string, path: string): string {
    // For Windows paths
    if (this.detectedOS === "windows") {
      // Handle absolute Windows paths
      if (path.match(/^[A-Za-z]:\\/)) {
        return path
      }

      // Handle special cases
      if (path === "." || path === "") {
        return cwd
      }

      if (path === "..") {
        const parts = cwd.split("\\").filter(Boolean)
        if (parts.length <= 1) {
          return parts[0] + ":\\"
        }
        parts.pop()
        return parts.join("\\")
      }

      // Handle relative paths
      if (cwd.endsWith("\\")) {
        return cwd + path
      } else {
        return cwd + "\\" + path
      }
    }

    // For Unix paths
    // Handle absolute paths
    if (path.startsWith("/")) {
      return path
    }

    // Handle special cases
    if (path === "." || path === "") {
      return cwd
    }

    if (path === "..") {
      const parts = cwd.split("/").filter(Boolean)
      if (parts.length === 0) {
        return "/"
      }
      parts.pop()
      return "/" + parts.join("/")
    }

    // Handle relative paths
    if (cwd.endsWith("/")) {
      return cwd + path
    } else {
      return cwd + "/" + path
    }
  }

  /**
   * Get the terminal prompt based on session
   */
  public getPrompt(session: TerminalSession): string {
    switch (session.type) {
      case "powershell":
        return `PS ${session.cwd}> `
      case "cmd":
        return `${session.cwd}> `
      case "bash":
      case "zsh":
        return `user@host:${session.cwd}$ `
      default:
        return `$ `
    }
  }

  /**
   * Get the detected operating system
   */
  public getOperatingSystem(): OperatingSystem {
    return this.detectedOS
  }

  /**
   * Get the default terminal type
   */
  public getDefaultTerminalType(): TerminalType {
    return this.defaultTerminalType
  }
}

export default TerminalService.getInstance()
