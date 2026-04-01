import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'JanDhan Plus - Blockchain Agricultural Marketplace',
  description: 'Fair trade for farmers, transparency for consumers, security for all',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <header className="sticky top-0 z-50 bg-white shadow-sm">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="text-2xl font-bold text-agri-green">🌾 JanDhan Plus</div>
            <ul className="flex gap-6 text-sm">
              <li><a href="/login" className="hover:text-agri-green font-medium">Farmer</a></li>
              <li><a href="/login" className="hover:text-agri-green font-medium">Buyer</a></li>
              <li><a href="/consumer" className="hover:text-agri-green font-medium">Consumer</a></li>
              <li><a href="/admin" className="hover:text-agri-green font-medium">Admin</a></li>
              <li><a href="/ussd-simulation" className="hover:text-agri-green font-medium">📱 USSD</a></li>
            </ul>
          </nav>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-12">
          {children}
        </main>

        <footer className="mt-20 bg-slate-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="font-bold mb-3">About</h3>
                <p className="text-sm text-slate-300">Fair prices for farmers. Trust for consumers.</p>
              </div>
              <div>
                <h3 className="font-bold mb-3">Links</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li><a href="/privacy">Privacy</a></li>
                  <li><a href="/terms">Terms</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-3">Contact</h3>
                <p className="text-sm text-slate-300">Blockchain + Agriculture</p>
              </div>
            </div>
            <div className="border-t border-slate-700 pt-4 text-center text-slate-400 text-sm">
              © 2025 JanDhan Plus. Built for BGSCET Hackathon.
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
