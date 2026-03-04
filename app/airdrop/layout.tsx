import Link from 'next/link'

export default function AirdropLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-xs font-black text-white">P</div>
            <div>
              <h1 className="text-base font-bold text-white leading-none">Polymarket MM</h1>
              <p className="text-xs text-slate-400 mt-0.5">Market Maker Dashboard</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-xs text-slate-400 hover:text-slate-200 transition-colors">← Overview</Link>
            <Link href="/markets" className="text-xs text-slate-400 hover:text-slate-200 transition-colors">Live Markets</Link>
            <Link href="/airdrop" className="text-xs text-blue-400 font-semibold">Airdrop</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  )
}
