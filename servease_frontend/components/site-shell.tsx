'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BellRing, Menu, ShieldCheck, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { clearStoredAuth, getStoredAuth } from '@/lib/auth'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
]

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [authState, setAuthState] = useState<{ accessToken: string | null; refreshToken: string | null; user: any | null }>({ accessToken: null, refreshToken: null, user: null })

  useEffect(() => {
    setAuthState(getStoredAuth())
    setIsMounted(true)
  }, [pathname])

  const handleLogout = () => {
    clearStoredAuth()
    setAuthState({ accessToken: null, refreshToken: null, user: null })
    toast.success('Logged out successfully')
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(20,108,95,0.14),_transparent_34%),linear-gradient(135deg,_#f7f4ec_0%,_#f8fafc_100%)]">
      <header className="sticky top-0 z-50 border-b border-white/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-accent-500/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-lg font-semibold text-secondary-500">ServEase</p>
              <p className="text-xs text-gray-500">Trusted home services</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition ${isActive ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'}`}
                >
                  {item.label}
                </Link>
              )
            })}
            {authState.accessToken ? (
              <>
                {authState.user?.role === 'PROVIDER' && (
                  <Link href="/provider/profile" className="text-sm font-medium text-gray-600 hover:text-primary-600">
                    Business Profile
                  </Link>
                )}
                <Link 
                  href={
                    authState.user?.role === 'PROVIDER' ? '/provider/dashboard' :
                    authState.user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'
                  } 
                  className="text-sm font-medium text-gray-600 hover:text-primary-600"
                >
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-primary-200 hover:text-primary-600">
                  Logout
                </button>
              </>
            ) : (
              <Link href="/auth/signup" className="btn-primary rounded-xl px-4 py-2 text-sm">
                Get Started
              </Link>
            )}
          </nav>
 
          <button className="rounded-2xl border border-gray-200 p-2 text-gray-700 md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
 
        {menuOpen && (
          <div className="border-t border-gray-200 bg-white/95 px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
                  {item.label}
                </Link>
              ))}
              {isMounted ? (
                authState.accessToken ? (
                  <>
                    {authState.user?.role === 'PROVIDER' && (
                      <Link href="/provider/profile" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
                        Business Profile
                      </Link>
                    )}
                    <Link 
                      href={
                        authState.user?.role === 'PROVIDER' ? '/provider/dashboard' :
                        authState.user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'
                      } 
                      className="text-sm font-medium text-gray-700" 
                      onClick={() => setMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="text-left text-sm font-medium text-gray-700">
                      Logout
                    </button>
                  </>
                ) : (
                  <Link href="/auth/signup" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
                    Get Started
                  </Link>
                )
              ) : (
                <div className="h-10 w-full rounded-xl bg-gray-100 animate-pulse" />
              )}
            </div>
          </div>
        )}
      </header>

      <main className="relative overflow-hidden">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </main>

      <footer className="border-t border-white/10 bg-[linear-gradient(135deg,#0b1714_0%,#1b2430_58%,#3d2b12_100%)] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">ServEase</p>
                <p className="text-sm text-gray-300">Premium home services</p>
              </div>
            </div>
            <p className="text-sm leading-7 text-gray-300">Book trusted professionals in minutes with transparent pricing and live booking flows.</p>
          </div>
          <div>
            <h3 className="mb-4 font-semibold">Popular Services</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/services" className="hover:text-white transition">Electrician</Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition">Plumbing</Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition">Cleaning</Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition">AC Service</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-semibold">Company</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/company/about" className="hover:text-white transition">About Us</Link>
              </li>
              <li>
                <Link href="/company/careers" className="hover:text-white transition">Careers</Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-white transition">Support Helpdesk</Link>
              </li>
              <li>
                <Link href="/company/contact" className="hover:text-white transition">Contact Us</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-semibold">Stay Updated</h3>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <BellRing className="h-5 w-5 text-accent-400" />
              <span className="text-sm text-gray-200">New offers every week</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
