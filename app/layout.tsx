import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider, RoleProvider, RoleSwitcher, ARModeProvider } from '../components/ui'
import Navbar from '../components/Navbar'
import CopilotWrapper from '../components/layout/CopilotWrapper'
import './lib/sentry'
import { maintenanceMode, aiCopilotEnabled, arModeEnabled } from './lib/features'

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
  if (maintenanceMode) {
    return (
      <html lang="en" className="dark">
        <body className={inter.className}>
          <div className="min-h-screen flex items-center justify-center">
            <p>Site is under maintenance. Please check back soon.</p>
          </div>
        </body>
      </html>
    )
  }
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="bg-bg min-h-screen text-text-primary font-inter">
          <RoleProvider>
            <ThemeProvider>
              {arModeEnabled ? (
                <ARModeProvider>
                  <Navbar />
                  <RoleSwitcher />
                  {children}
                  {aiCopilotEnabled && <CopilotWrapper />}
                </ARModeProvider>
              ) : (
                <>
                  <Navbar />
                  <RoleSwitcher />
                  {children}
                  {aiCopilotEnabled && <CopilotWrapper />}
                </>
              )}
            </ThemeProvider>
          </RoleProvider>
        </div>
      </body>
    </html>
  )
}
