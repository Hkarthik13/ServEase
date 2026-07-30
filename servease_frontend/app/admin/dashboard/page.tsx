'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3, ShieldCheck, Users, Wallet, CheckCircle, XCircle, 
  RefreshCw, FileText, BadgeAlert, Award, Star, Mail, Phone,
  Search, Eye, ToggleLeft, ToggleRight, UserCheck, UserX, Calendar,
  Clock, MapPin, Tag, Check, X, ShieldAlert, DollarSign, Info
} from 'lucide-react'
import { 
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid 
} from 'recharts'
import toast from 'react-hot-toast'
import { getApiUrl } from '@/lib/api'
import { getStoredAuth } from '@/lib/auth'

type UserProfile = {
  id: number
  email: string
  phone: string
  first_name: string
  last_name: string
  full_name: string
  role: string
  is_verified: boolean
  is_active: boolean
  created_at: string
}

type Provider = {
  id: number
  provider_name: string
  provider_email: string
  provider_phone: string
  business_name: string
  business_description: string
  pan_number: string
  gst_number: string
  years_of_experience: number
  verification_status: string
  average_rating: string
}

type Booking = {
  id: number
  booking_id: string
  customer_name: string
  provider_name: string
  provider_business: string
  category_name: string
  service_details: {
    name: string
    base_price: string
  }
  service_date: string
  service_time: string
  total_amount: string
  platform_fee: string
  tax_amount: string
  status: string
  payment_status: string
  payment_method: string
  special_instructions: string
  address_details: {
    address_line: string
    city: string
    state: string
    pincode: string
    landmark: string
  } | null
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'users'>('overview')
  const [providers, setProviders] = useState<Provider[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  
  // Dashboard Aggregates from backend admin view
  const [metrics, setMetrics] = useState({
    platformRevenue: 0,
    providersCount: 0,
    pendingVerifications: 0,
    successRate: '100%',
    totalUsersCount: 0,
    openTicketsCount: 0
  })
  
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  // Filters
  const [bookingSearch, setBookingSearch] = useState('')
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL')
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('ALL')

  // Chart data
  const [revenueData, setRevenueData] = useState<{ name: string; platformCommission: number }[]>([])
  const [categoryData, setCategoryData] = useState<{ category: string; bookings: number }[]>([])

  const loadAdminData = async () => {
    const auth = getStoredAuth()
    if (!auth.accessToken) return

    const headers = { 'Authorization': `Bearer ${auth.accessToken}` }
    try {
      setRefreshing(true)
      const [metricsRes, provRes, bookRes, usersRes] = await Promise.all([
        fetch(getApiUrl('/api/admin/dashboard/'), { headers }),
        fetch(getApiUrl('/api/providers/'), { headers }),
        fetch(getApiUrl('/api/bookings/'), { headers }),
        fetch(getApiUrl('/api/admin/users/'), { headers })
      ])

      if (metricsRes.ok && provRes.ok && bookRes.ok && usersRes.ok) {
        const metricsData = await metricsRes.json()
        const provData = await provRes.json()
        const bookData = await bookRes.json()
        const usersData = await usersRes.json()

        const provList: Provider[] = provData.results || provData
        const bookList: Booking[] = bookData.results || bookData
        const usersList: UserProfile[] = usersData.results || usersData

        setProviders(provList)
        setBookings(bookList)
        setUsers(usersList)

        // Calculate success rate client side
        const completedBookings = bookList.filter(b => b.status === 'COMPLETED')
        const totalClosed = bookList.filter(b => b.status === 'COMPLETED' || b.status.includes('CANCEL')).length
        const successPercent = totalClosed > 0 
          ? `${Math.round((completedBookings.length / totalClosed) * 100)}%` 
          : '100%'

        setMetrics({
          platformRevenue: parseFloat(metricsData.total_revenue),
          providersCount: metricsData.total_providers,
          pendingVerifications: metricsData.pending_verifications,
          successRate: successPercent,
          totalUsersCount: metricsData.total_users,
          openTicketsCount: metricsData.open_tickets
        })

        // Generate category chart data
        const catMap: { [key: string]: number } = {}
        bookList.forEach(b => {
          if (b.category_name) {
            catMap[b.category_name] = (catMap[b.category_name] || 0) + 1
          }
        })
        const mappedCat = Object.keys(catMap).map(k => ({ category: k, bookings: catMap[k] }))
        setCategoryData(mappedCat)

        // Generate mock revenue flow weekly trending
        const revenueTotal = parseFloat(metricsData.total_revenue)
        setRevenueData([
          { name: 'Mon', platformCommission: Math.round(revenueTotal * 0.1) },
          { name: 'Tue', platformCommission: Math.round(revenueTotal * 0.15) },
          { name: 'Wed', platformCommission: Math.round(revenueTotal * 0.25) },
          { name: 'Thu', platformCommission: Math.round(revenueTotal * 0.35) },
          { name: 'Fri', platformCommission: Math.round(revenueTotal * 0.6) },
          { name: 'Sat', platformCommission: Math.round(revenueTotal * 0.8) },
          { name: 'Sun', platformCommission: revenueTotal }
        ])
      }
    } catch (err) {
      console.error('Error fetching admin dashboard metrics:', err)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadAdminData()
  }, [])

  const handleVerifyProvider = async (providerId: number, approve: boolean) => {
    const auth = getStoredAuth()
    const statusVal = approve ? 'APPROVED' : 'REJECTED'
    
    try {
      const res = await fetch(getApiUrl(`/api/providers/${providerId}/`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.accessToken}`
        },
        body: JSON.stringify({ 
          verification_status: statusVal,
          verification_notes: approve ? 'Verified by Admin' : 'Documents rejected by Admin'
        })
      })

      if (res.ok) {
        toast.success(`Provider status set to: ${statusVal}`)
        loadAdminData()
      } else {
        toast.error('Failed to change provider verification status')
      }
    } catch (err) {
      toast.error('Error verifying provider')
    }
  }

  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    const auth = getStoredAuth()
    try {
      const res = await fetch(getApiUrl(`/api/admin/users/${userId}/toggle-active/`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.accessToken}`
        }
      })

      if (res.ok) {
        const resData = await res.json()
        toast.success(resData.message)
        loadAdminData()
      } else {
        const errorData = await res.json()
        toast.error(errorData.error || 'Failed to update user status')
      }
    } catch (err) {
      toast.error('Error updating user status')
    }
  }

  const handleCancelBooking = async (bookingId: number) => {
    const auth = getStoredAuth()
    if (!confirm('Are you sure you want to cancel this booking?')) return

    try {
      const res = await fetch(getApiUrl(`/api/bookings/${bookingId}/cancel/`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.accessToken}`
        },
        body: JSON.stringify({ notes: 'Booking canceled by Administrator' })
      })

      if (res.ok) {
        toast.success('Booking canceled successfully')
        setSelectedBooking(null)
        loadAdminData()
      } else {
        toast.error('Failed to cancel booking')
      }
    } catch (err) {
      toast.error('Error canceling booking')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Filter bookings
  const filteredBookings = bookings.filter(b => {
    const searchLower = bookingSearch.toLowerCase()
    const matchesSearch = 
      (b.booking_id && b.booking_id.toLowerCase().includes(searchLower)) ||
      (b.customer_name && b.customer_name.toLowerCase().includes(searchLower)) ||
      (b.provider_name && b.provider_name.toLowerCase().includes(searchLower)) ||
      (b.category_name && b.category_name.toLowerCase().includes(searchLower)) ||
      (b.service_details?.name && b.service_details.name.toLowerCase().includes(searchLower))

    const matchesStatus = bookingStatusFilter === 'ALL' || b.status === bookingStatusFilter
    return matchesSearch && matchesStatus
  })

  // Filter users
  const filteredUsers = users.filter(u => {
    const searchLower = userSearch.toLowerCase()
    const matchesSearch = 
      (u.full_name && u.full_name.toLowerCase().includes(searchLower)) ||
      (u.email && u.email.toLowerCase().includes(searchLower)) ||
      (u.phone && u.phone.toLowerCase().includes(searchLower))

    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter
    return matchesSearch && matchesRole
  })

  const pendingProviders = providers.filter(p => p.verification_status === 'PENDING')

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      
      {/* Top Header Controls */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="mb-8 rounded-[32px] border border-gray-100 bg-white p-8 shadow-soft"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold font-poppins text-secondary-500 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">Admin Control Center</h1>
            <p className="mt-1.5 text-sm leading-6 text-gray-500">
              Verify partner documentation, monitor platform operations, manage users, and audit booking lists.
            </p>
          </div>
          
          <button 
            onClick={loadAdminData}
            disabled={refreshing}
            className="self-start md:self-auto inline-flex items-center gap-2 rounded-2xl bg-primary-50 border border-primary-100 px-4 py-3 font-semibold text-primary-600 hover:bg-primary-100 transition shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh Data
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="mt-8 flex border-b border-gray-100">
          {[
            { id: 'overview', label: 'Overview & Charts', icon: BarChart3 },
            { id: 'bookings', label: 'Bookings Management', icon: FileText },
            { id: 'users', label: 'Users Management', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon
            const isTabActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  isTabActive ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {isTabActive && (
                  <motion.div 
                    layoutId="activeTabIndicator" 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" 
                  />
                )}
              </button>
            )
          })}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {/* Metric Cards Grid */}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 mb-8">
              {[
                { title: 'Platform Commission', value: `₹${metrics.platformRevenue.toFixed(0)}`, icon: Wallet, tone: 'from-emerald-500 to-teal-500' },
                { title: 'Registered Users', value: metrics.totalUsersCount, icon: Users, tone: 'from-blue-500 to-indigo-500' },
                { title: 'Active Service Partners', value: metrics.providersCount, icon: UserCheck, tone: 'from-cyan-500 to-teal-500' },
                { title: 'Verification Backlog', value: metrics.pendingVerifications, icon: BadgeAlert, tone: 'from-amber-500 to-orange-500' },
              ].map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={stat.title} className="card bg-white border border-gray-100 p-6 shadow-soft hover:shadow-md transition">
                    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.tone}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-400">{stat.title}</h3>
                    <p className="mt-1 text-3xl font-bold text-secondary-500 font-poppins">{stat.value}</p>
                  </div>
                )
              })}
            </div>

            {/* Grid: Charts Area */}
            <div className="grid gap-8 lg:grid-cols-2 mb-10">
              {/* Category demand bar chart */}
              <div className="card bg-white p-6 border border-gray-100 shadow-soft">
                <h3 className="text-lg font-bold font-poppins text-secondary-500 mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary-500" /> Category Booking Volume
                </h3>
                <div className="h-64">
                  {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                        <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} />
                        <Bar dataKey="bookings" fill="#14B8A6" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-gray-400">
                      No categories booked yet
                    </div>
                  )}
                </div>
              </div>

              {/* Revenue Line Chart */}
              <div className="card bg-white p-6 border border-gray-100 shadow-soft">
                <h3 className="text-lg font-bold font-poppins text-secondary-500 mb-6 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-primary-500" /> Platform Revenue Flow
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="platformCommission" stroke="#2563EB" strokeWidth={3} dot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Verification Backlog Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-secondary-500 font-poppins flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary-500" /> Verification Requests
              </h2>

              {pendingProviders.length === 0 ? (
                <div className="card bg-white text-center py-12 border border-gray-100 shadow-soft">
                  <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="font-semibold text-secondary-500">Backlog completely verified!</h4>
                  <p className="text-gray-400 text-xs mt-1">New partner profiles requiring document reviews will appear here.</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {pendingProviders.map((prov) => (
                    <div 
                      key={prov.id}
                      className="card p-5 border border-gray-100 bg-white hover:border-primary-100 shadow-soft space-y-4"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-lg font-bold text-secondary-500 font-poppins">{prov.business_name}</h4>
                            <p className="text-xs text-gray-500 font-medium">Owner: {prov.provider_name}</p>
                          </div>
                          <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                            Pending Approval
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">{prov.business_description}</p>
                      </div>

                      {/* KYC Documents representation */}
                      <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-xs text-gray-600">
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-400">PAN ID Card:</span>
                          <span className="font-bold text-secondary-500">{prov.pan_number || 'PAN-7492M'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-400">GST Registration:</span>
                          <span className="font-bold text-secondary-500">{prov.gst_number || 'GSTIN-3329L'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-400">Years Experience:</span>
                          <span className="font-bold text-secondary-500">{prov.years_of_experience} Years</span>
                        </div>
                      </div>

                      {/* Verification Actions */}
                      <div className="flex gap-3 pt-2">
                        <button 
                          onClick={() => handleVerifyProvider(prov.id, false)}
                          className="w-1/2 text-xs font-bold text-red-500 border border-red-200 hover:bg-red-50 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" /> Reject Request
                        </button>
                        <button 
                          onClick={() => handleVerifyProvider(prov.id, true)}
                          className="w-1/2 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-soft"
                        >
                          <CheckCircle className="w-4 h-4" /> Approve Partner
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 2: BOOKINGS MANAGEMENT */}
        {activeTab === 'bookings' && (
          <motion.div
            key="bookings"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between bg-white border border-gray-100 p-5 rounded-[24px] shadow-soft">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bookings by ID, customer, provider, service..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm text-gray-700"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 outline-none text-sm text-gray-700 bg-white"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLELED_BY_CUSTOMER">Canceled by Customer</option>
                  <option value="CANCELLELED_BY_PROVIDER">Canceled by Provider</option>
                  <option value="CANCELLELED_BY_ADMIN">Canceled by Admin</option>
                </select>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="overflow-x-auto bg-white rounded-[24px] border border-gray-100 shadow-soft">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="p-5 font-semibold text-gray-500">Booking ID</th>
                    <th className="p-5 font-semibold text-gray-500">Customer</th>
                    <th className="p-5 font-semibold text-gray-500">Service Category</th>
                    <th className="p-5 font-semibold text-gray-500">Date & Time</th>
                    <th className="p-5 font-semibold text-gray-500 text-right">Price</th>
                    <th className="p-5 font-semibold text-gray-500">Status</th>
                    <th className="p-5 font-semibold text-gray-500 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400">
                        No bookings found matching filters.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50/40 transition">
                        <td className="p-5 font-semibold text-secondary-500">{b.booking_id}</td>
                        <td className="p-5">
                          <p className="font-semibold text-gray-700">{b.customer_name}</p>
                        </td>
                        <td className="p-5">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full border border-primary-100">
                            {b.category_name || 'Service'}
                          </span>
                        </td>
                        <td className="p-5 text-gray-600">
                          <p className="font-medium">{b.service_date}</p>
                          <p className="text-xs text-gray-400">{b.service_time}</p>
                        </td>
                        <td className="p-5 text-right font-bold text-secondary-500 font-poppins">
                          ₹{parseFloat(b.total_amount).toFixed(2)}
                        </td>
                        <td className="p-5">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${
                            b.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            b.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                            'bg-red-50 text-red-600 border-red-100'
                          }`}>
                            {b.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-5 text-center">
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-primary-100 hover:bg-primary-50 text-xs font-bold text-gray-600 hover:text-primary-600 transition"
                          >
                            <Eye className="w-3.5 h-3.5" /> Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* TAB 3: USERS MANAGEMENT */}
        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between bg-white border border-gray-100 p-5 rounded-[24px] shadow-soft">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name, email, phone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm text-gray-700"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 outline-none text-sm text-gray-700 bg-white"
                >
                  <option value="ALL">All Roles</option>
                  <option value="CUSTOMER">Customer Only</option>
                  <option value="PROVIDER">Provider Only</option>
                  <option value="ADMIN">Admin Only</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto bg-white rounded-[24px] border border-gray-100 shadow-soft">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="p-5 font-semibold text-gray-500">Full Name</th>
                    <th className="p-5 font-semibold text-gray-500">Email Address</th>
                    <th className="p-5 font-semibold text-gray-500">Phone</th>
                    <th className="p-5 font-semibold text-gray-500">Role</th>
                    <th className="p-5 font-semibold text-gray-500">Verified</th>
                    <th className="p-5 font-semibold text-gray-500">Active Status</th>
                    <th className="p-5 font-semibold text-gray-500 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400">
                        No users found matching filters.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/40 transition">
                        <td className="p-5 font-semibold text-gray-800">{u.full_name || `${u.first_name} ${u.last_name}`}</td>
                        <td className="p-5 text-gray-600">{u.email}</td>
                        <td className="p-5 text-gray-600">{u.phone || 'N/A'}</td>
                        <td className="p-5">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold ${
                            u.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                            u.role === 'PROVIDER' ? 'bg-teal-50 text-teal-700 border border-teal-100' :
                            'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-5">
                          {u.is_verified ? (
                            <Check className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <X className="w-5 h-5 text-red-400" />
                          )}
                        </td>
                        <td className="p-5">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                            u.is_active ? 'text-emerald-600' : 'text-red-500'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${
                              u.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                            }`} />
                            {u.is_active ? 'Active Account' : 'Deactivated'}
                          </span>
                        </td>
                        <td className="p-5 text-center">
                          {u.role !== 'ADMIN' ? (
                            <button
                              onClick={() => handleToggleUserStatus(u.id, u.is_active)}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm ${
                                u.is_active 
                                  ? 'border-red-200 text-red-500 hover:bg-red-50' 
                                  : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                              }`}
                            >
                              {u.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                              {u.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Protected System User</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-900/60 p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl rounded-3xl bg-white p-6 md:p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start border-b border-gray-100 pb-5">
              <div>
                <span className="text-xs font-bold text-primary-500 uppercase tracking-widest">Booking Audit Details</span>
                <h3 className="text-2xl font-bold font-poppins text-secondary-500 mt-1">ID: {selectedBooking.booking_id}</h3>
              </div>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="p-2 rounded-full border border-gray-100 hover:bg-gray-50 text-gray-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {/* Customer and Provider names */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-gray-400">Customer Details</span>
                  <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3">
                    <div className="bg-primary-50 h-10 w-10 flex items-center justify-center rounded-xl text-primary-600">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-secondary-500">{selectedBooking.customer_name}</p>
                      <p className="text-xs text-gray-400">Customer Account</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-gray-400">Provider Assigned</span>
                  <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3">
                    <div className="bg-teal-50 h-10 w-10 flex items-center justify-center rounded-xl text-teal-600">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-secondary-500">
                        {selectedBooking.provider_name || 'Not Assigned Yet'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {selectedBooking.provider_business || 'Awaiting acceptance'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service details */}
              <div className="bg-gray-50 p-5 rounded-2xl space-y-4">
                <div className="flex justify-between items-start border-b border-gray-200/50 pb-3">
                  <div>
                    <h4 className="font-bold text-secondary-500 text-lg flex items-center gap-2">
                      <Tag className="w-5 h-5 text-primary-500" />
                      {selectedBooking.service_details?.name || 'Home Service'}
                    </h4>
                    <span className="text-xs text-gray-500 font-medium">Category: {selectedBooking.category_name}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    selectedBooking.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                    selectedBooking.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                    selectedBooking.status === 'ACCEPTED' || selectedBooking.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedBooking.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4.5 h-4.5 text-gray-400" />
                    <span><strong>Date:</strong> {selectedBooking.service_date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4.5 h-4.5 text-gray-400" />
                    <span><strong>Time:</strong> {selectedBooking.service_time}</span>
                  </div>
                </div>

                {selectedBooking.address_details && (
                  <div className="flex gap-2 text-sm text-gray-600 border-t border-gray-200/50 pt-3">
                    <MapPin className="w-4.5 h-4.5 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>Service Location:</strong>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {selectedBooking.address_details.address_line}, {selectedBooking.address_details.city}, {selectedBooking.address_details.state} - {selectedBooking.address_details.pincode}
                        {selectedBooking.address_details.landmark && ` (Landmark: ${selectedBooking.address_details.landmark})`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Pricing summary */}
              <div className="border border-gray-100 rounded-2xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Billing Breakdown</h4>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Base Price:</span>
                  <span className="font-semibold font-poppins">₹{parseFloat(selectedBooking.service_details?.base_price || '0.00').toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Platform Commission:</span>
                  <span className="font-semibold font-poppins">₹{parseFloat(selectedBooking.platform_fee).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Taxes (5%):</span>
                  <span className="font-semibold font-poppins">₹{parseFloat(selectedBooking.tax_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-secondary-500 border-t border-gray-100 pt-2 mt-2">
                  <span>Total Amount Paid:</span>
                  <span className="font-poppins">₹{parseFloat(selectedBooking.total_amount).toFixed(2)}</span>
                </div>
              </div>

              {/* Special instructions */}
              <div className="bg-amber-50/60 border border-amber-100/50 rounded-2xl p-4 space-y-1">
                <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> Special Instructions:
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed italic">
                  &quot;{selectedBooking.special_instructions || 'No special requirements listed'}&quot;
                </p>
              </div>

              {/* Modal buttons */}
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm font-semibold text-gray-600 transition"
                >
                  Close View
                </button>
                {['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(selectedBooking.status) && (
                  <button
                    onClick={() => handleCancelBooking(selectedBooking.id)}
                    className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-semibold text-white flex items-center gap-1.5 shadow-sm transition"
                  >
                    <XCircle className="w-4 h-4" /> Cancel Booking
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  )
}
