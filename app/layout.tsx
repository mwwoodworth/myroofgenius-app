import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '../components/ui/ThemeProvider'
import Navbar from '../components/Navbar'
import CopilotWrapper from '../components/layout/CopilotWrapper'

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
        <div className="bg-bg min-h-screen text-text-primary font-inter">
          <ThemeProvider>
            <Navbar />
            {children}
            <CopilotWrapper />
          </ThemeProvider>
        </div>
      </body>
    </html>
  )
}
