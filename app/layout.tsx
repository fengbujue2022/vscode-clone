import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'vscode-clone',
  description: 'A clone of Visual Studio Code editor',
  generator: 'fengbujue2022',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
