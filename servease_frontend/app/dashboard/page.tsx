'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, CalendarRange, CreditCard, Heart, MessageSquare, 
  ShieldCheck, Sparkles, Star, Clock, CheckCircle2, AlertCircle,
  X, Send, RefreshCw, Landmark, Trash2
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { getApiUrl } from '@/lib/api'
import { getStoredAuth } from '@/lib/auth'

type Booking = {
  id: number
  booking_id: string
  customer_name: string
  provider_name: string
  provider_business: string
  service_details: {
    name: string
    base_price: string
  }
  category_name: string
  service_date: string
  service_time: string
  total_amount: string
  status: string
  is_rated: boolean
}

type WalletTransaction = {
  id: number
  transaction_type: 'CREDIT' | 'DEBIT'
  amount: string
  description: string
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [walletBalance, setWalletBalance] = useState('0.00')
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    review: ''
  })
  const [submittingReview, setSubmittingReview] = useState(false)

  const loadDashboardData = useCallback(async () => {
    const auth = getStoredAuth()
    if (!auth.accessToken) return
    
    if (auth.user?.role === 'PROVIDER') {
      router.push('/provider/dashboard')
      return
    }
    if (auth.user?.role === 'ADMIN') {
      router.push('/admin/dashboard')
      return
    }
    
    setUser(auth.user)

    const headers = { 'Authorization': `Bearer ${auth.accessToken}` }
    try {
      setRefreshing(true)
      const [bookRes, walletRes] = await Promise.all([
        fetch(getApiUrl('/api/bookings/'), { headers }),
        fetch(getApiUrl('/api/payments/wallet/'), { headers })
      ])

      if (bookRes.ok) {
        const bookData = await bookRes.json()
        setBookings(bookData.results || bookData)
      }
      if (walletRes.ok) {
        const walletData = await walletRes.json()
        setWalletBalance(walletData.balance)
        setWalletTransactions(walletData.transactions || [])
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [router])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    
    const auth = getStoredAuth()
    try {
      const res = await fetch(getApiUrl(`/api/bookings/${bookingId}/cancel/`), {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.accessToken}` 
        },
        body: JSON.stringify({ notes: 'Canceled by customer from dashboard' })
      })

      if (res.ok) {
        toast.success('Booking canceled successfully. Refund credited to wallet.')
        loadDashboardData()
      } else {
        toast.error('Failed to cancel booking')
      }
    } catch (err) {
      toast.error('Error canceling booking')
    }
  }

  const handleOpenReview = (booking: Booking) => {
    setSelectedBooking(booking)
    setReviewForm({ rating: 5, title: '', review: '' })
    setShowReviewModal(true)
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBooking) return
    setSubmittingReview(true)

    const auth = getStoredAuth()
    try {
      const res = await fetch(getApiUrl('/api/reviews/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.accessToken}`
        },
        body: JSON.stringify({
          booking: selectedBooking.id,
          rating: reviewForm.rating,
          title: reviewForm.title,
          review: reviewForm.review
        })
      })

      if (res.ok) {
        toast.success('Review submitted successfully!')
        setShowReviewModal(false)
        loadDashboardData()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to submit review')
      }
    } catch (err) {
      toast.error('Error submitting review')
    } finally {
      setSubmittingReview(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'ACCEPTED': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'ON_THE_WAY': return 'bg-cyan-100 text-cyan-700 border-cyan-200'
      case 'ARRIVED': return 'bg-indigo-100 text-indigo-700 border-indigo-200'
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      default: return 'bg-red-100 text-red-700 border-red-200'
    }
  }

  const getTimelineStep = (status: string) => {
    const steps = ['PENDING', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED']
    return steps.indexOf(status)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      
      {/* Dashboard Top banner */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="mb-8 rounded-[32px] border border-primary-100 bg-gradient-to-br from-primary-600 to-accent-500 p-8 text-white shadow-soft relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.1),_transparent_40%)]" />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between relative z-10">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              Customer dashboard
            </p>
            <h1 className="text-3xl font-bold font-poppins sm:text-4xl">
              Vanakkam, {user?.first_name || 'Guest'}!
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/80">
              Manage your address books, track live booking updates, and review completed service provider activities.
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={loadDashboardData}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 border border-white/20 px-4 py-3 font-semibold text-white backdrop-blur hover:bg-white/20 transition"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <Link href="/services" className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-primary-600 hover:shadow-glow transition">
              Book Service <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Grid: Bookings & Wallet */}
      <div className="grid gap-8 lg:grid-cols-[1.8fr_1.2fr] items-start">
        
        {/* Left Side: Active Bookings and Timeline */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-secondary-500 font-poppins flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-primary-500" /> Current Bookings
          </h2>

          {bookings.length === 0 ? (
            <div className="card text-center py-16 border border-gray-100 shadow-soft">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-secondary-500">No bookings placed yet</h3>
              <p className="text-gray-500 text-sm mt-1">Book your first service and get high quality help.</p>
              <Link href="/services" className="btn-primary mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm">
                Explore Services <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => {
                const currentStepIndex = getTimelineStep(booking.status)
                const isCancelled = booking.status.includes('CANCEL')
                
                return (
                  <motion.div 
                    layout
                    key={booking.id}
                    className="card p-6 border border-gray-100 bg-white hover:border-primary-100 shadow-soft flex flex-col justify-between"
                  >
                    <div>
                      {/* Booking Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-xs font-bold text-gray-400">ID: {booking.booking_id}</span>
                          <h3 className="text-xl font-bold font-poppins text-secondary-500 mt-1">
                            {booking.service_details?.name}
                          </h3>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-bold ${getStatusColor(booking.status)}`}>
                          {booking.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {/* Details row */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-medium text-gray-500 pb-4 border-b border-gray-50">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-primary-400" />
                          <span>Date: {booking.service_date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-primary-400" />
                          <span>Time: {booking.service_time}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-accent-500" />
                          <span>By: {booking.provider_business || booking.provider_name || 'Assigning...'}</span>
                        </div>
                      </div>

                      {/* Live Tracking Status Timeline */}
                      {!isCancelled && currentStepIndex >= 0 && (
                        <div className="mt-6">
                          <p className="text-xs font-bold text-secondary-500 mb-4 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-primary-500" /> Live Status Tracking
                          </p>
                          <div className="flex justify-between items-center relative max-w-md">
                            {/* Horizontal Line Background */}
                            <div className="absolute left-0 right-0 h-1 bg-gray-100 -z-10" />
                            {/* Highlighted completed line */}
                            <div 
                              className="absolute left-0 h-1 bg-primary-500 -z-10 transition-all duration-500"
                              style={{ width: `${(currentStepIndex / 5) * 100}%` }}
                            />

                            {['Pending', 'Accepted', 'On Way', 'Arrived', 'In Progress', 'Completed'].map((label, stepIdx) => (
                              <div key={label} className="flex flex-col items-center gap-1.5">
                                <div 
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition duration-300 ${
                                    currentStepIndex >= stepIdx 
                                      ? 'bg-primary-500 text-white border-primary-500 shadow-soft scale-110' 
                                      : 'bg-white text-gray-300 border-gray-200'
                                  }`}
                                >
                                  {currentStepIndex > stepIdx ? '✓' : stepIdx + 1}
                                </div>
                                <span className={`text-[9px] font-bold ${currentStepIndex >= stepIdx ? 'text-primary-600' : 'text-gray-400'}`}>
                                  {label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Dashboard Actions */}
                    <div className="mt-6 flex justify-between items-center border-t border-gray-50 pt-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400">Total Charged</span>
                        <p className="text-lg font-bold text-secondary-500 font-poppins">₹{booking.total_amount}</p>
                      </div>

                      <div className="flex gap-2">
                        {booking.status === 'PENDING' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="text-xs font-bold text-red-500 border border-red-200 hover:bg-red-50 px-3.5 py-2 rounded-xl transition"
                          >
                            Cancel Booking
                          </button>
                        )}
                        {booking.status === 'COMPLETED' && !booking.is_rated && (
                          <button
                            onClick={() => handleOpenReview(booking)}
                            className="text-xs font-bold text-primary-500 border border-primary-200 hover:bg-primary-50 px-4 py-2 rounded-xl transition flex items-center gap-1.5"
                          >
                            <Star className="w-3.5 h-3.5 fill-primary-500" /> Leave a Review
                          </button>
                        )}
                        {booking.status === 'COMPLETED' && booking.is_rated && (
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Reviewed
                          </span>
                        )}
                      </div>
                    </div>

                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Side: Wallet & Activity Logs */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-secondary-500 font-poppins flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary-500" /> ServEase Wallet
          </h2>
          
          <div className="card p-6 border border-gray-100 bg-gradient-to-br from-secondary-500 to-secondary-600 text-white shadow-soft rounded-3xl relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-white/80">Available Wallet Balance</span>
              <Landmark className="w-5 h-5 text-accent-400" />
            </div>
            <p className="text-4xl font-bold font-poppins">₹{walletBalance}</p>
            <p className="text-[10px] text-white/60 mt-3">Used automatically during service checkouts & instant booking cancellations refund.</p>
          </div>

          {/* Transactions List */}
          <div className="card p-6 border border-gray-100 shadow-soft">
            <h3 className="font-bold text-sm text-secondary-500 border-b border-gray-50 pb-2 mb-3">Wallet Activity</h3>
            {walletTransactions.length === 0 ? (
              <p className="text-xs text-gray-400">No transaction logs available.</p>
            ) : (
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {walletTransactions.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-semibold text-secondary-500">{tx.description}</p>
                      <span className="text-[10px] text-gray-400">{new Date(tx.created_at).toLocaleDateString()}</span>
                    </div>
                    <span className={`font-bold ${tx.transaction_type === 'CREDIT' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {tx.transaction_type === 'CREDIT' ? '+' : '-'}₹{tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Review Submission Dialog Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card w-full max-w-md p-6 bg-white shadow-xl relative"
            >
              <button 
                onClick={() => setShowReviewModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold font-poppins text-secondary-500 mb-1 flex items-center gap-2">
                <Star className="w-5 h-5 text-warning fill-warning" /> Rate Service Provider
              </h3>
              <p className="text-xs text-gray-500 mb-6">Review for {selectedBooking?.service_details?.name}</p>

              <form onSubmit={handleSubmitReview} className="space-y-5">
                {/* Stars choice */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">Rating Scale</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="text-2xl"
                      >
                        <Star 
                          className={`w-8 h-8 transition duration-150 ${
                            reviewForm.rating >= star 
                              ? 'text-warning fill-warning scale-110' 
                              : 'text-gray-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Feedback Title</label>
                  <input 
                    type="text"
                    required
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                    placeholder="Excellent service, very fast..."
                    className="input-field py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Detailed Review</label>
                  <textarea 
                    rows={4}
                    value={reviewForm.review}
                    onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })}
                    placeholder="Share your experience about punctuality, service delivery..."
                    className="input-field resize-none py-2"
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={submittingReview}
                    className="btn-primary w-full flex justify-center items-center gap-2 py-3 rounded-2xl"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Feedback'} <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
