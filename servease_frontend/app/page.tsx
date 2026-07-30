'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  Home,
  IndianRupee,
  MapPin,
  Paintbrush,
  Play,
  Search,
  Shield,
  Sparkles,
  Star,
  Wrench,
  Zap,
} from 'lucide-react'

const categories = [
  { name: 'Electrician', icon: Zap, meta: 'Switches, wiring, faults', color: 'from-amber-300 to-yellow-600' },
  { name: 'Plumber', icon: Wrench, meta: 'Leaks, fittings, pumps', color: 'from-sky-300 to-cyan-700' },
  { name: 'Painter', icon: Paintbrush, meta: 'Fresh walls, texture work', color: 'from-rose-300 to-fuchsia-700' },
  { name: 'Carpenter', icon: Home, meta: 'Doors, shelves, repair', color: 'from-orange-300 to-amber-700' },
  { name: 'Cleaning', icon: Sparkles, meta: 'Deep clean, move-in clean', color: 'from-emerald-300 to-teal-700' },
  { name: 'AC Service', icon: Shield, meta: 'Cooling, gas, annual care', color: 'from-indigo-300 to-blue-700' },
]

const features = [
  {
    icon: Shield,
    title: 'Verified local pros',
    description: 'KYC, skill checks, ratings, and job history sit in one clean provider profile.',
  },
  {
    icon: CalendarClock,
    title: 'Real-time dispatch',
    description: 'Customers can book the right slot and providers get a focused daily job queue.',
  },
  {
    icon: IndianRupee,
    title: 'Clear estimates',
    description: 'Visible base rates, repair scope, and secure checkout reduce back-and-forth.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-secondary-50">
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#07110f_0%,#14251f_42%,#3d2b12_100%)] text-white">
        <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-primary-400/20 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-accent-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75 }}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
                <BadgeCheck className="h-4 w-4 text-accent-200" />
                Chennai&apos;s premium local service network
              </div>

              <h1 className="max-w-4xl text-5xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl">
                ServEase
                <span className="mt-4 block text-3xl font-semibold text-white/88 sm:text-4xl lg:text-5xl">
                  majestic home service, minus the waiting.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78 sm:text-xl">
                Find verified electricians, plumbers, cleaners, painters, and AC specialists nearby with clear pricing and live booking flow.
              </p>

              <div className="mt-8 max-w-2xl rounded-2xl border border-white/15 bg-white p-2 shadow-gold">
                <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
                  <div className="flex items-center gap-3 rounded-xl bg-secondary-50 px-4 py-3 text-secondary-500">
                    <Search className="h-5 w-5 text-primary-500" />
                    <span className="text-sm font-semibold text-gray-500">Search electrician, cleaning, AC service...</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-gray-100 px-4 py-3 text-sm font-bold text-secondary-500">
                    <MapPin className="h-4 w-4 text-accent-500" />
                    Chennai
                  </div>
                  <Link href="/services" className="btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm">
                    Find Pros <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3 text-center">
                {[
                  ['10k+', 'homes served'],
                  ['4.8', 'avg rating'],
                  ['25 min', 'fast dispatch'],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/10 px-3 py-4 backdrop-blur">
                    <p className="text-2xl font-bold text-accent-100">{value}</p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-white/60">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12, duration: 0.75 }}
              className="majestic-panel rounded-[28px] p-4"
            >
              <div className="relative min-h-[520px] overflow-hidden rounded-3xl border border-white/10 bg-[#101820] p-5 shadow-2xl">
                <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_20%_25%,rgba(20,108,95,0.45),transparent_28%),radial-gradient(circle_at_80%_12%,rgba(194,139,44,0.32),transparent_24%)]" />
                <div className="relative rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-accent-200">Live city board</p>
                      <h2 className="mt-1 text-2xl font-bold">4 experts available now</h2>
                    </div>
                    <div className="rounded-2xl bg-emerald-400/15 px-3 py-2 text-xs font-bold text-emerald-100">Online</div>
                  </div>

                  <div className="relative mt-5 h-56 overflow-hidden rounded-2xl border border-white/10 bg-[#17242d]">
                    <div className="absolute inset-4 rounded-2xl border border-dashed border-white/12" />
                    <div className="absolute left-9 top-10 h-3 w-24 rotate-12 rounded-full bg-accent-300/50" />
                    <div className="absolute bottom-16 left-24 h-3 w-32 -rotate-6 rounded-full bg-primary-300/45" />
                    <div className="absolute right-12 top-20 h-3 w-28 rotate-45 rounded-full bg-white/20" />
                    <div className="absolute left-12 top-20 h-4 w-4 rounded-full bg-accent-300 animate-pulse-soft" />
                    <div className="absolute right-16 top-16 h-4 w-4 rounded-full bg-primary-300 animate-pulse-soft" />
                    <div className="absolute bottom-12 left-36 h-4 w-4 rounded-full bg-white animate-pulse-soft" />
                    <div className="animate-route absolute left-16 top-28 flex h-11 w-11 items-center justify-center rounded-full bg-accent-400 text-secondary-900 shadow-gold">
                      <Wrench className="h-5 w-5" />
                    </div>
                    <div className="absolute bottom-4 left-4 rounded-2xl bg-white px-4 py-3 text-secondary-500 shadow-xl">
                      <p className="text-xs font-bold uppercase text-gray-400">ETA</p>
                      <p className="text-lg font-bold">24 mins</p>
                    </div>
                  </div>
                </div>

                <div className="relative mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    ['Raj Kumar', 'Plumber', 'Rs 249', '4.9'],
                    ['Meera Works', 'Deep cleaning', 'Rs 699', '4.8'],
                    ['BrightFix', 'Electrician', 'Rs 199', '4.9'],
                    ['CoolCare', 'AC service', 'Rs 499', '4.7'],
                  ].map(([name, skill, price, rating]) => (
                    <div key={name} className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                          <Briefcase className="h-5 w-5 text-accent-200" />
                        </div>
                        <div className="flex items-center gap-1 text-sm font-bold text-accent-100">
                          <Star className="h-4 w-4 fill-accent-200 text-accent-200" />
                          {rating}
                        </div>
                      </div>
                      <p className="font-bold text-white">{name}</p>
                      <p className="mt-1 text-sm text-white/60">{skill}</p>
                      <p className="mt-3 text-sm font-bold text-emerald-100">{price} base visit</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-secondary-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-primary-600">Popular work categories</p>
              <h2 className="mt-3 text-4xl font-bold text-secondary-500 lg:text-5xl">Book the right specialist</h2>
            </div>
            <Link href="/services" className="btn-secondary inline-flex w-fit items-center gap-2">
              View marketplace <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="card card-hover group border border-white"
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${category.color} shadow-lg transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105`}>
                    <category.icon className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-secondary-500">{category.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600">{category.meta}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl border border-gray-100 bg-white p-8 shadow-soft"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500">
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-secondary-500">{feature.title}</h3>
              <p className="mt-3 leading-7 text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-[linear-gradient(135deg,#0b1714_0%,#1b2430_55%,#563b11_100%)] py-16 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-accent-100">
              <CheckCircle2 className="h-4 w-4" />
              Built for customers and providers
            </p>
            <h2 className="max-w-3xl text-4xl font-bold lg:text-5xl">Get reliable help today, or grow your local service business.</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/auth/signup" className="btn-primary inline-flex items-center justify-center gap-2">
              Create account <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/services" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/20">
              <Play className="h-5 w-5" /> Browse services
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
