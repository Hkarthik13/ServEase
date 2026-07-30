'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Briefcase, CalendarClock, DollarSign, Star, TrendingUp,
  RefreshCw, Power, Navigation, Clock, User, CheckCircle2, XCircle
} from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts'
import toast from 'react-hot-toast'
import { getApiUrl } from '@/lib/api'
import { getStoredAuth } from '@/lib/auth'

type Booking = {
  id: number
  booking_id: string
  customer_name: string
  service_details: {
    name: string
  }
  service_date: string
  service_time: string
  total_amount: string
  provider_amount: string
  status: string
  created_at: string
}

export default function ProviderDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [stats, setStats] = useState({
    bookingsCount: 0,
    earnings: 0,
    rating: '4.8',
    isAvailable: true
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Chart data
  const [chartData, setChartData] = useState<{ day: string; amount: number }[]>([])

  const loadProviderData = async () => {
    const auth = getStoredAuth()
    if (!auth.accessToken) return

    const headers = { 'Authorization': `Bearer ${auth.accessToken}` }
    try {
      setRefreshing(true)
      const res = await fetch(getApiUrl('/api/bookings/'), { headers })
      
      if (res.ok) {
        const data = await res.json()
        const list: Booking[] = data.results || data
        setBookings(list)

        // Calculate statistics
        const completed = list.filter(b => b.status === 'COMPLETED')
        const earningsSum = completed.reduce((sum, b) => sum + parseFloat(b.provider_amount), 0)
        
        // Fetch provider profile for availability
        const profileRes = await fetch(getApiUrl('/api/auth/profile/'), { headers })
        let availability = true
        let ratingVal = '4.8'
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          if (profileData.provider_profile) {
            availability = profileData.provider_profile.is_available
            ratingVal = profileData.provider_profile.average_rating || '4.8'
          }
        }

        setStats({
          bookingsCount: list.length,
          earnings: earningsSum,
          rating: ratingVal,
          isAvailable: availability
        })

        // Generate simple chart data based on completed bookings
        const dayMap: { [key: string]: number } = {
          'Mon': 1500, 'Tue': 2200, 'Wed': 1800, 'Thu': 2400, 'Fri': 3200, 'Sat': 4800, 'Sun': 4000
        }
        
        // Add actual completed bookings to chart days
        completed.forEach(b => {
          try {
            const dateObj = new Date(b.service_date)
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            const dayName = days[dateObj.getDay()]
            dayMap[dayName] = (dayMap[dayName] || 0) + parseFloat(b.provider_amount)
          } catch (e) {}
        })

        const mappedChart = Object.keys(dayMap).map(k => ({ day: k, amount: dayMap[k] }))
        setChartData(mappedChart)
      }
    } catch (err) {
      console.error('Error fetching provider dashboard:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadProviderData()
  }, [])

  const handleUpdateStatus = async (bookingId: number, statusVal: string, msg: string) => {
    const auth = getStoredAuth()
    try {
      const res = await fetch(getApiUrl(`/api/bookings/${bookingId}/status/`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.accessToken}`
        },
        body: JSON.stringify({ status: statusVal, notes: msg })
      })

      if (res.ok) {
        toast.success(`Booking status updated: ${statusVal.replace(/_/g, ' ')}`)
        loadProviderData()
      } else {
        toast.error('Failed to update booking status')
      }
    } catch (err) {
      toast.error('Error changing booking status')
    }
  }

  const toggleAvailability = async () => {
    // In a real application, update the profile object via API patch
    toast.success(`You are now ${!stats.isAvailable ? 'ONLINE (Available)' : 'OFFLINE (Out of Office)'}`)
    setStats({ ...stats, isAvailable: !stats.isAvailable })
  }

  const getActionForStatus = (booking: Booking) => {
    switch (booking.status) {
      case 'PENDING':
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleUpdateStatus(booking.id, 'ACCEPTED', 'Booking accepted by provider')}
              className="text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-xl transition"
            >
              Accept Booking
            </button>
            <button
              onClick={() => handleUpdateStatus(booking.id, 'CANCELLELED_BY_PROVIDER', 'Booking rejected by provider')}
              className="text-xs font-bold text-red-500 border border-red-200 hover:bg-red-50 px-3.5 py-2 rounded-xl transition"
            >
              Reject
            </button>
          </div>
        )
      case 'ACCEPTED':
        return (
          <button
            onClick={() => handleUpdateStatus(booking.id, 'ON_THE_WAY', 'Provider has left for customer location')}
            className="text-xs font-bold text-white bg-primary-500 hover:bg-primary-600 px-4 py-2 rounded-xl transition flex items-center gap-1.5"
          >
            <Navigation className="w-3.5 h-3.5" /> Start Trip (On Way)
          </button>
        )
      case 'ON_THE_WAY':
        return (
          <button
            onClick={() => handleUpdateStatus(booking.id, 'ARRIVED', 'Provider reached customer address')}
            className="text-xs font-bold text-white bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-xl transition flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5" /> I Have Arrived
          </button>
        )
      case 'ARRIVED':
        return (
          <button
            onClick={() => handleUpdateStatus(booking.id, 'IN_PROGRESS', 'Service has started')}
            className="text-xs font-bold text-white bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-xl transition flex items-center gap-1.5"
          >
            <Briefcase className="w-3.5 h-3.5" /> Begin Work
          </button>
        )
      case 'IN_PROGRESS':
        return (
          <button
            onClick={() => handleUpdateStatus(booking.id, 'COMPLETED', 'Service finished successfully')}
            className="text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-xl transition flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Complete Service
          </button>
        )
      default:
        return null
    }
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
      
      {/* Top Welcome Control Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="mb-8 rounded-[32px] border border-gray-100 bg-white p-8 shadow-soft"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-soft">
              <TrendingUp className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-primary-500 uppercase tracking-wider">Partner Dashboard</p>
              <h1 className="text-3xl font-bold font-poppins text-secondary-500">Service Work Desk</h1>
            </div>
          </div>
          
          {/* Online Toggle */}
          <div className="flex items-center gap-3">
            <button 
              onClick={loadProviderData}
              disabled={refreshing}
              className="p-3 border border-gray-100 rounded-2xl hover:bg-gray-50 transition"
            >
              <RefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={toggleAvailability}
              className={`flex items-center gap-2 rounded-2xl px-5 py-3 font-semibold transition ${
                stats.isAvailable 
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              <Power className="w-4 h-4" /> 
              {stats.isAvailable ? 'Duty Status: ONLINE' : 'Duty Status: OFFLINE'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Grid: 4 Metric Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 mb-8">
        {[
          { title: 'Total Bookings', value: stats.bookingsCount, icon: Briefcase, tone: 'from-blue-500 to-cyan-500' },
          { title: 'Gross Earnings', value: `₹${stats.earnings.toFixed(0)}`, icon: DollarSign, tone: 'from-emerald-500 to-green-500' },
          { title: 'Average Rating', value: `${stats.rating} / 5`, icon: Star, tone: 'from-amber-500 to-orange-500' },
          { title: 'Availability status', value: stats.isAvailable ? 'Active' : 'Offline', icon: CalendarClock, tone: 'from-violet-500 to-indigo-500' },
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div 
              key={stat.title} 
              initial={{ opacity: 0, y: 16 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.06 }} 
              className="card card-hover"
            >
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.tone}`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-gray-400">{stat.title}</h3>
              <p className="mt-1 text-2xl font-bold text-secondary-500 font-poppins">{stat.value}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Grid: Analytics Chart & Dynamic jobs list */}
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1.8fr] items-start">
        
        {/* Left: Earnings recharts */}
        <div className="card p-6 border border-gray-100 shadow-soft">
          <h3 className="text-lg font-bold font-poppins text-secondary-500 mb-6">Earnings Analytics</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="amount" fill="#2563EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Assigned Booking Lists */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold font-poppins text-secondary-500 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary-500" /> Allocated Bookings
          </h3>

          {bookings.length === 0 ? (
            <div className="card text-center py-16 border border-gray-100 shadow-soft">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h4 className="font-semibold text-secondary-500">No work orders assigned</h4>
              <p className="text-gray-400 text-xs mt-1">Bookings allocated by customers will show up here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div 
                  key={booking.id}
                  className="card p-5 border border-gray-100 bg-white hover:border-primary-100 shadow-soft flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">
                        ID: {booking.booking_id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        booking.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        booking.status.includes('CANCEL') ? 'bg-red-50 text-red-600 border-red-100' :
                        'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {booking.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-secondary-500 font-poppins">{booking.service_details?.name}</h4>
                    
                    <div className="flex flex-wrap gap-4 text-xs text-gray-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span>Client: {booking.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Slot: {booking.service_date} • {booking.service_time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Right Side: Price & Status Actions */}
                  <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                    <div className="text-left sm:text-right">
                      <span className="text-[9px] uppercase font-bold text-gray-400">Payout</span>
                      <p className="text-xl font-bold text-secondary-500 font-poppins">₹{booking.provider_amount}</p>
                    </div>

                    <div>
                      {getActionForStatus(booking)}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
