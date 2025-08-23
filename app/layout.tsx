import Link from 'next/link'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <header>
          <nav className="container">
            <div className="logo">🌱 Dream Seed</div>
            <ul className="nav-links">
              <li><Link href="/">Home</Link></li>
              <li><Link href="#services">Services</Link></li>
              <li><Link href="/domain-checker">Domain Checker</Link></li>
              <li><Link href="/customer-portal">Portal</Link></li>
              <li><Link href="#contact">Contact</Link></li>
            </ul>
          </nav>
        </header>
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}