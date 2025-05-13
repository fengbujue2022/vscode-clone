import { FileIcon, FileJsonIcon, FileCodeIcon, FileText } from "lucide-react"
import { getFileIconByName } from "@/lib/utils"

interface FileIconProps {
  fileName: string
  size?: number
}

export function FileTypeIcon({ fileName, size = 16 }: FileIconProps) {
  const iconType = getFileIconByName(fileName)

  switch (iconType) {
    case "js":
      return <FileJsonIcon size={size} className="text-[#e6cd83]" />
    case "ts":
      return <FileIcon size={size} className="text-[#3178c6]" />
    case "html":
      return <FileIcon size={size} className="text-[#e34c26]" />
    case "css":
      return <FileCodeIcon size={size} className="text-[#563d7c]" />
    case "json":
      return <FileJsonIcon size={size} className="text-[#f5de19]" />
    case "md":
      return <FileText size={size} className="text-[#ffffff]" />
    case "py":
      return <FileIcon size={size} className="text-[#3572A5]" />
    default:
      return <FileIcon size={size} className="text-[#cccccc]" />
  }
}
