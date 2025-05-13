"use client"

import { Files, Search, GitBranch, Bug, Package, Settings, Terminal } from "lucide-react"
import { useI18n } from "@/lib/i18n"

interface ActivityBarProps {
  toggleSidebar: () => void
  toggleTerminal: () => void
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function ActivityBar({ toggleSidebar, toggleTerminal, activeTab, onTabChange }: ActivityBarProps) {
  const { t } = useI18n()

  return (
    <div className="flex flex-col items-center py-2 h-full">
      <button
        className={`p-2 ${activeTab === "explorer" ? "text-white bg-[#252526]" : "text-gray-400"} hover:bg-[#505050] mb-2`}
        onClick={() => onTabChange("explorer")}
        title={`${t("explorer.title")} (Ctrl+B)`}
      >
        <Files size={24} />
      </button>
      <button
        className={`p-2 ${activeTab === "search" ? "text-white bg-[#252526]" : "text-gray-400"} hover:bg-[#505050] mb-2`}
        onClick={() => onTabChange("search")}
        title={`${t("search.title")} (Ctrl+Shift+F)`}
      >
        <Search size={24} />
      </button>
      <button className="p-2 text-gray-400 hover:bg-[#505050] mb-2" title="Git">
        <GitBranch size={24} />
      </button>
      <button className="p-2 text-gray-400 hover:bg-[#505050] mb-2" title={t("common.run")}>
        <Bug size={24} />
      </button>
      <button className="p-2 text-gray-400 hover:bg-[#505050] mb-2" title="Extensions">
        <Package size={24} />
      </button>

      <div className="flex-1"></div>

      <button
        className="p-2 text-gray-400 hover:bg-[#505050] mb-2"
        onClick={toggleTerminal}
        title={`${t("terminal.title")} (Ctrl+\`)`}
      >
        <Terminal size={24} />
      </button>
      <button className="p-2 text-gray-400 hover:bg-[#505050]" title={t("common.settings")}>
        <Settings size={24} />
      </button>
    </div>
  )
}
