'use client'

import { motion } from 'framer-motion'
import { Award, ShieldCheck, Sparkles, Star, Users } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      {/* Intro Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="mb-16 text-center max-w-3xl mx-auto"
      >
        <p className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700">
          <Sparkles className="w-4 h-4 text-accent-500" /> About ServEase
        </p>
        <h1 className="text-4xl font-bold font-poppins text-secondary-500 sm:text-5xl">
          On-Demand Home Services, Redefined
        </h1>
        <p className="mt-4 text-lg text-gray-500 leading-relaxed">
          We connect background-verified, high-quality local professionals with customers who value transparency, punctuality, and stellar service delivery.
        </p>
      </motion.div>

      {/* Grid: Trust Metrics */}
      <div className="grid gap-6 md:grid-cols-3 mb-20 text-center">
        {[
          { label: 'Active Service Providers', value: '150+', icon: Users },
          { label: 'Completed Bookings', value: '5,000+', icon: Award },
          { label: 'Customer Rating Average', value: '4.8 / 5', icon: Star },
        ].map((item, index) => {
          const Icon = item.icon
          return (
            <motion.div 
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-8 border border-gray-100 bg-white shadow-soft rounded-3xl"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                <Icon className="h-6 w-6" />
              </div>
              <p className="text-3xl font-bold text-secondary-500 font-poppins">{item.value}</p>
              <p className="mt-2 text-sm text-gray-400 font-medium">{item.label}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Core Values Section */}
      <div className="grid gap-8 lg:grid-cols-2 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <h2 className="text-3xl font-bold font-poppins text-secondary-500">Why choose ServEase?</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Founded with a vision to streamline local service catalogs, we address common booking challenges (like provider unresponsiveness, lack of pricing standards, and safety verification issues) using an integrated tech suite.
          </p>

          <div className="space-y-4 pt-4">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-secondary-500 text-sm">3-Step Partner Verification</h4>
                <p className="text-xs text-gray-400 mt-1">We inspect PAN, Aadhaar, and background references of every partner before they go online.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-secondary-500 text-sm">Instant Wallet Cancellations</h4>
                <p className="text-xs text-gray-400 mt-1">Change of plans? Cancel a pending job and get refunded instantly to your ServEase Wallet.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Visual graphic cards box */}
        <motion.div 
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-tr from-secondary-500 to-primary-700 p-8 rounded-[36px] text-white shadow-soft"
        >
          <h3 className="text-2xl font-bold font-poppins mb-3">Our Mission Statement</h3>
          <p className="text-white/80 text-sm leading-6 mb-6">
            &quot;To empower local technicians with predictable, high-value earnings while offering consumers an effortless home services workspace.&quot;
          </p>
          <Link href="/services" className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-primary-600 hover:shadow-glow transition">
            Explore Offerings <Award className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
