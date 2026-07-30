'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send, HelpCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      toast.success('Message received! Our team will get back to you within 24 hours.')
      setForm({ name: '', email: '', message: '' })
      setSubmitting(false)
    }, 1000)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-bold font-poppins text-secondary-500 sm:text-5xl">We would love to hear from you</h1>
        <p className="mt-4 text-gray-500 text-sm sm:text-base leading-relaxed">
          Questions about partnerships, corporate booking support, or feedback? Send us a message!
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr] items-start">
        
        {/* Left: Contact Info */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-secondary-500 font-poppins">Get in Touch</h2>
          
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-secondary-500 text-sm">Customer Support</h4>
                <p className="text-xs text-gray-400 mt-1">support@servease.com</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-secondary-500 text-sm">Call Center Helpline</h4>
                <p className="text-xs text-gray-400 mt-1">+91 44 2839 0042</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-secondary-500 text-sm">Registered Headquarters</h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  ServEase Solutions, 12, G.N. Chetty Road, T. Nagar, Chennai - 600017
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Message Form */}
        <div className="card p-8 border border-gray-100 bg-white shadow-soft rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Your Name</label>
                <input 
                  type="text" 
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field py-2"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field py-2"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Message Content</label>
              <textarea 
                rows={5}
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="input-field resize-none py-2"
                placeholder="Write your suggestions or details..."
              />
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="btn-primary w-full flex justify-center items-center gap-1.5 py-3 rounded-2xl"
            >
              {submitting ? 'Sending...' : 'Send Message'} <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
