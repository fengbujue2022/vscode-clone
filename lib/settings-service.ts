import type { Theme } from "./types"

export interface EditorSettings {
  theme: Theme
  fontSize: number
  wordWrap: "on" | "off"
  minimapEnabled: boolean
  sidebarVisible: boolean
  terminalVisible: boolean
  sidebarWidth: number
  terminalHeight: number
  locale: string
}

const DEFAULT_SETTINGS: EditorSettings = {
  theme: "vs-dark",
  fontSize: 14,
  wordWrap: "on",
  minimapEnabled: true,
  sidebarVisible: true,
  terminalVisible: false,
  sidebarWidth: 250,
  terminalHeight: 300,
  locale: "en",
}

class SettingsService {
  private static instance: SettingsService
  private readonly STORAGE_KEY = "vscode-clone-settings"

  private constructor() {}

  public static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService()
    }
    return SettingsService.instance
  }

  /**
   * Get all editor settings
   */
  public getSettings(): EditorSettings {
    if (typeof window === "undefined") {
      return DEFAULT_SETTINGS
    }

    const storedSettings = localStorage.getItem(this.STORAGE_KEY)
    if (!storedSettings) {
      return DEFAULT_SETTINGS
    }

    try {
      const parsedSettings = JSON.parse(storedSettings)
      return { ...DEFAULT_SETTINGS, ...parsedSettings }
    } catch (error) {
      console.error("Failed to parse stored settings:", error)
      return DEFAULT_SETTINGS
    }
  }

  /**
   * Update editor settings
   */
  public updateSettings(settings: Partial<EditorSettings>): EditorSettings {
    if (typeof window === "undefined") {
      return DEFAULT_SETTINGS
    }

    const currentSettings = this.getSettings()
    const newSettings = { ...currentSettings, ...settings }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newSettings))
    return newSettings
  }

  /**
   * Get a specific setting value
   */
  public getSetting<K extends keyof EditorSettings>(key: K): EditorSettings[K] {
    const settings = this.getSettings()
    return settings[key]
  }

  /**
   * Update a specific setting value
   */
  public updateSetting<K extends keyof EditorSettings>(key: K, value: EditorSettings[K]): EditorSettings {
    const settings = this.getSettings()
    settings[key] = value
    return this.updateSettings(settings)
  }

  /**
   * Reset all settings to default values
   */
  public resetSettings(): EditorSettings {
    if (typeof window === "undefined") {
      return DEFAULT_SETTINGS
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS))
    return DEFAULT_SETTINGS
  }
}

export default SettingsService.getInstance()
