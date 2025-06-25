import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '../components/ui/ThemeProvider'
import Navbar from '../components/Navbar'
import CopilotPanel from '../components/CopilotPanel'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'MyRoofGenius - Smart Roofing Solutions',
  description: 'AI-powered roofing tools and marketplace',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ThemeProvider>
          <Navbar />
          <main className="bg-background text-foreground min-h-screen">
            {children}
          </main>
          <CopilotPanel />
        </ThemeProvider>
      </body>
    </html>
  )
}
