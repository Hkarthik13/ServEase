'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HelpCircle, MessageSquare, ChevronDown, Send, ShieldAlert, 
  Clock, Plus, X, ListTodo, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getApiUrl } from '@/lib/api'
import { getStoredAuth, isAuthenticated } from '@/lib/auth'

type Ticket = {
  id: number
  ticket_id: string
  subject: string
  description: string
  category: string
  priority: string
  status: string
  created_at: string
}

const FAQS = [
  { q: 'How do I request a booking cancellation?', a: 'You can cancel any booking before the service is accepted/started directly from your Customer Dashboard. The booking amount will be instantly credited back to your ServEase Wallet.' },
  { q: 'How does provider vetting work?', a: 'Our safety protocol requires all home service professionals to go through Aadhaar identity checks, PAN verification, and an active reference review before onboarding.' },
  { q: 'What is the refund turnaround time?', a: 'All cancellations process instantly into your wallet balance. Bank account transfers depend on your card provider and take 3-5 business days.' },
  { q: 'Are prices fixed?', a: 'Yes! All services listed on ServEase feature fixed upfront pricing, including GST and platform charges, to ensure complete transparency before you book.' },
]

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null)
  
  // Create ticket states
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    subject: '',
    category: 'BILLING',
    priority: 'MEDIUM',
    description: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const loadTickets = async () => {
    if (!isAuthenticated()) return
    setAuthenticated(true)
    const auth = getStoredAuth()
    const headers = { 'Authorization': `Bearer ${auth.accessToken}` }

    try {
      setLoading(true)
      const res = await fetch(getApiUrl('/api/support/'), { headers })
      if (res.ok) {
        const data = await res.json()
        setTickets(data.results || data)
      }
    } catch (err) {
      console.error('Error fetching support tickets:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTickets()
  }, [])

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.subject || !form.description) {
      toast.error('Please enter support request details')
      return
    }

    setSubmitting(true)
    const auth = getStoredAuth()

    try {
      const res = await fetch(getApiUrl('/api/support/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.accessToken}`
        },
        body: JSON.stringify(form)
      })

      if (res.ok) {
        toast.success('Support ticket created successfully!')
        setShowForm(false)
        setForm({ subject: '', category: 'BILLING', priority: 'MEDIUM', description: '' })
        loadTickets()
      } else {
        toast.error('Failed to submit ticket request')
      }
    } catch (err) {
      toast.error('Error creating support ticket')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      {/* Intro Banner */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-bold font-poppins text-secondary-500 sm:text-5xl">ServEase Help & Support</h1>
        <p className="mt-4 text-gray-500 text-sm sm:text-base leading-relaxed">
          Need help with a payment, booking delay, or general queries? Create a support request or read our FAQs.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] items-start mb-16">
        
        {/* Left: Support Tickets Log */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-secondary-500 font-poppins flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary-500" /> My Tickets
            </h2>
            {authenticated && (
              <button 
                onClick={() => setShowForm(!showForm)}
                className="btn-primary rounded-xl px-4 py-2.5 text-xs flex items-center gap-1.5 shadow-soft"
              >
                {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} Create Ticket
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {showForm ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="card p-6 border border-gray-100 bg-white shadow-soft"
              >
                <form onSubmit={handleCreateTicket} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Ticket Subject</label>
                    <input 
                      type="text" 
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="input-field py-2"
                      placeholder="E.g., Payment charged twice but order failed"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Category</label>
                      <select 
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="input-field py-2"
                      >
                        <option value="BILLING">Payments & Billing</option>
                        <option value="BOOKING">Booking conflicts</option>
                        <option value="PROVIDER">Technician complaints</option>
                        <option value="OTHER">General Support</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Priority</label>
                      <select 
                        value={form.priority}
                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                        className="input-field py-2"
                      >
                        <option value="LOW">Low priority</option>
                        <option value="MEDIUM">Medium priority</option>
                        <option value="HIGH">High priority</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Detailed Description</label>
                    <textarea 
                      rows={4}
                      required
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="input-field resize-none py-2"
                      placeholder="Please add as many details as possible..."
                    />
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="btn-primary w-full py-2.5 rounded-xl text-xs flex justify-center items-center gap-1.5"
                    >
                      {submitting ? 'Submitting...' : 'Submit Support Request'} <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {!authenticated ? (
            <div className="card text-center py-16 border border-gray-100 shadow-soft bg-white p-8">
              <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-secondary-500">Authentication Required</h3>
              <p className="text-gray-400 text-xs mt-1">Please log in to submit ticket issues and view resolving status logs.</p>
            </div>
          ) : loading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="card text-center py-16 border border-gray-100 shadow-soft bg-white">
              <ListTodo className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-secondary-500">No active support tickets</h3>
              <p className="text-gray-400 text-xs mt-1">Any issues you raise with our call desk will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((t) => (
                <div key={t.id} className="card p-5 border border-gray-100 bg-white hover:border-primary-100 shadow-soft">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">
                        Ticket ID: {t.ticket_id}
                      </span>
                      <h4 className="text-base font-bold font-poppins text-secondary-500 mt-1">{t.subject}</h4>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      t.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      t.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">{t.description}</p>
                  
                  <div className="mt-4 pt-3 border-t border-gray-50 flex gap-4 text-[10px] text-gray-400 font-medium">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Raised: {new Date(t.created_at).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5 text-primary-400" /> Priority: {t.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: FAQ Accordions */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-secondary-500 font-poppins flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary-500" /> FAQ Desk
          </h2>
          
          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <div 
                key={idx}
                className="card border border-gray-100 bg-white overflow-hidden shadow-soft"
              >
                <button
                  onClick={() => setOpenFaqIdx(openFaqIdx === idx ? null : idx)}
                  className="w-full p-4 text-left font-bold text-sm text-secondary-500 flex justify-between items-center transition hover:text-primary-500"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openFaqIdx === idx ? 'rotate-180 text-primary-500' : ''}`} />
                </button>

                <AnimatePresence initial={false}>
                  {openFaqIdx === idx && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-4 text-xs text-gray-500 leading-5 border-t border-gray-50/50 pt-3">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
