import Providers from './providers'
import '@/i18n'
import './globals.css'

export const metadata = {
  title: 'GFR',
  description: 'Global Research Forum platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
