'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, Clock, MapPin, Tag, CreditCard, Sparkles, CheckCircle2, 
  AlertTriangle, ArrowLeft, ArrowRight, BrainCircuit, ShieldCheck, Wallet as WalletIcon, ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getApiUrl } from '@/lib/api'
import { getStoredAuth, isAuthenticated } from '@/lib/auth'

const LocationPickerMap = dynamic(() => import('@/components/location-picker-map'), {
  ssr: false,
  loading: () => <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />,
})

type Service = {
  id: number
  name: string
  base_price: string
  duration_minutes: number
  category_name: string
  provider_name: string
  provider_business: string
}

type Address = {
  id: number
  label: string
  address_line: string
  city: string
  state: string
  pincode: string
  latitude?: string | null
  longitude?: string | null
}

function NewBookingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceId = searchParams.get('serviceId')

  const [step, setStep] = useState(1)
  const [service, setService] = useState<Service | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  
  // New address form
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    address_line: '',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '',
    latitude: 13.0827,
    longitude: 80.2707
  })

  // Date and Time selection
  const [bookingDate, setBookingDate] = useState('')
  const [bookingTime, setBookingTime] = useState('10:00')
  const [instructions, setInstructions] = useState('')
  
  // Coupon
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponId, setCouponId] = useState<number | null>(null)
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  const [isVerifyingCoupon, setIsVerifyingCoupon] = useState(false)

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'WALLET' | 'CASH'>('UPI')
  const [walletBalance, setWalletBalance] = useState(0)
  
  // Loading & States
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null)
  const emergencyTerms = ['gas leak', 'sparking', 'shock', 'burning smell', 'short circuit', 'flooding', 'pipe burst', 'no power', 'fire']
  const isEmergencyBooking = emergencyTerms.some((term) => instructions.toLowerCase().includes(term))

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('Please login to book services')
      router.push('/auth/login')
    }
  }, [router])

  // Load service details and user addresses / wallet
  useEffect(() => {
    if (!serviceId) return

    async function loadData() {
      const auth = getStoredAuth()
      const headers = { 'Authorization': `Bearer ${auth.accessToken}` }

      try {
        setLoading(true)
        // Fetch Service
        const serviceRes = await fetch(getApiUrl(`/api/services/${serviceId}/`))
        if (!serviceRes.ok) throw new Error('Service not found')
        const serviceData = await serviceRes.json()
        setService(serviceData)

        // Fetch Addresses
        const addrRes = await fetch(getApiUrl('/api/users/addresses/'), { headers })
        if (addrRes.ok) {
          const addrData = await addrRes.json()
          const list = addrData.results || addrData
          setAddresses(list)
          if (list.length > 0) {
            setSelectedAddressId(list[0].id)
          } else {
            setShowAddressForm(true)
          }
        }

        // Fetch Wallet
        const walletRes = await fetch(getApiUrl('/api/payments/wallet/'), { headers })
        if (walletRes.ok) {
          const walletData = await walletRes.json()
          setWalletBalance(parseFloat(walletData.balance))
        }
      } catch (err) {
        toast.error('Error loading checkout information')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [serviceId])

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    const auth = getStoredAuth()
    
    if (!addressForm.address_line || !addressForm.pincode) {
      toast.error('Please enter address details')
      return
    }

    try {
      const res = await fetch(getApiUrl('/api/users/addresses/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.accessToken}`
        },
        body: JSON.stringify(addressForm)
      })

      if (res.ok) {
        const newAddr = await res.json()
        setAddresses([...addresses, newAddr])
        setSelectedAddressId(newAddr.id)
        setShowAddressForm(false)
        toast.success('Address saved successfully!')
      } else {
        toast.error('Failed to save address')
      }
    } catch (err) {
      toast.error('Error creating address')
    }
  }

  const useCurrentLocationForAddress = () => {
    if (!navigator.geolocation) {
      toast.error('GPS is not available in this browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setAddressForm({
          ...addressForm,
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6))
        })
        toast.success('Location pinned from GPS')
      },
      () => toast.error('Unable to read GPS location'),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  const handleVerifyCoupon = async () => {
    if (!couponCode) return
    setIsVerifyingCoupon(true)
    const auth = getStoredAuth()
    const base = parseFloat(service?.base_price || '0')

    try {
      const res = await fetch(getApiUrl('/api/payments/coupons/validate/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.accessToken}`
        },
        body: JSON.stringify({
          code: couponCode,
          booking_amount: base
        })
      })

      const data = await res.json()
      if (res.ok && data.valid) {
        setCouponDiscount(data.discount_amount)
        setCouponId(data.id)
        setAppliedCoupon(data.code)
        toast.success(`Coupon Applied! Saved ₹${data.discount_amount}`)
      } else {
        toast.error(data.error || 'Invalid or expired coupon')
      }
    } catch (err) {
      toast.error('Error validating coupon')
    } finally {
      setIsVerifyingCoupon(false)
    }
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true)
        return
      }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePlaceBooking = async () => {
    if (!selectedAddressId) {
      toast.error('Please select an address')
      return
    }
    if (!bookingDate) {
      toast.error('Please choose a date')
      return
    }

    setSubmitting(true)
    const auth = getStoredAuth()
    
    // Construct time format: HH:MM:00
    const formattedTime = `${bookingTime}:00`

    const payload = {
      service: service?.id,
      service_address: selectedAddressId,
      service_date: bookingDate,
      service_time: formattedTime,
      special_instructions: instructions,
      is_urgent: isEmergencyBooking,
      payment_method: paymentMethod,
      payment_status: paymentMethod === 'CASH' ? 'PENDING' : 'PAID',
      coupon: couponId
    }

    // Razorpay Integration Flow
    if (paymentMethod === 'UPI' || paymentMethod === 'CARD') {
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        toast.error('Failed to load Razorpay Payment Gateway. Check your connection.')
        setSubmitting(false)
        return
      }

      try {
        const orderRes = await fetch(getApiUrl('/api/payments/razorpay/create-order/'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.accessToken}`
          },
          body: JSON.stringify({ amount: total })
        })
        if (!orderRes.ok) throw new Error('Order initialization failed')
        const orderData = await orderRes.json()

        const options = {
          key: orderData.key_id,
          amount: Math.round(total * 100),
          currency: orderData.currency,
          name: "ServEase Home Services",
          description: `Booking for ${service?.name}`,
          order_id: orderData.order_id,
          handler: async function (response: any) {
            try {
              const verifyRes = await fetch(getApiUrl('/api/payments/razorpay/verify-payment/'), {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${auth.accessToken}`
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  mock: orderData.mock || false
                })
              })

              if (verifyRes.ok) {
                // Post booking after payment verify
                const bookingRes = await fetch(getApiUrl('/api/bookings/'), {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.accessToken}`
                  },
                  body: JSON.stringify({
                    ...payload,
                    payment_status: 'PAID'
                  })
                })
                const bookingData = await bookingRes.json()
                if (bookingRes.ok) {
                  setCreatedBookingId(bookingData.booking_id)
                  setStep(5)
                  setShowConfetti(true)
                  toast.success('Payment & Booking completed successfully!')
                  setTimeout(() => router.push('/dashboard'), 5000)
                } else {
                  toast.error(bookingData.error || 'Failed to record booking after payment')
                }
              } else {
                toast.error('Payment verification failed')
              }
            } catch (err) {
              toast.error('Error verifying Razorpay signature')
            } finally {
              setSubmitting(false)
            }
          },
          prefill: {
            name: auth.user?.full_name || "Customer",
            email: auth.user?.email || "customer@servease.com",
            contact: auth.user?.phone || "9999999999"
          },
          theme: {
            color: "#2563EB"
          },
          modal: {
            ondismiss: function () {
              toast.error('Payment window closed')
              setSubmitting(false)
            }
          }
        }
        const rzp = new (window as any).Razorpay(options)
        rzp.open()
      } catch (err) {
        toast.error('Failed to initialize payment gateway order')
        setSubmitting(false)
      }
      return
    }

    try {
      const res = await fetch(getApiUrl('/api/bookings/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.accessToken}`
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (res.ok) {
        setCreatedBookingId(data.booking_id)
        setStep(5)
        setShowConfetti(true)
        toast.success('Service booked successfully!')
        
        // Trigger visual confetti redirect
        setTimeout(() => {
          router.push('/dashboard')
        }, 5000)
      } else {
        toast.error(data.detail || data.error || 'Failed to place booking')
      }
    } catch (err) {
      toast.error('Error placing booking. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const basePrice = parseFloat(service?.base_price || '0')
  const tax = basePrice * 0.05
  const platformFee = 15.00
  const urgencyFee = isEmergencyBooking ? 150 : 0
  const total = basePrice + tax + platformFee + urgencyFee - couponDiscount
  const estimatedMin = Math.max(99, Math.round(basePrice * 0.9 + urgencyFee))
  const estimatedMax = Math.round(basePrice * 1.25 + urgencyFee)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-semibold">Loading checkout details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      
      {/* Steps Progress Header */}
      {step < 5 && (
        <div className="mb-10">
          <div className="flex justify-between items-center max-w-xl mx-auto mb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div 
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    step >= i 
                      ? 'bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-soft scale-110'
                      : 'bg-white text-gray-400 border border-gray-200'
                  }`}
                >
                  {i}
                </div>
                {i < 4 && <ChevronRight className="w-4 h-4 text-gray-300" />}
              </div>
            ))}
          </div>
          <div className="text-center">
            <span className="text-xs uppercase tracking-wider text-gray-400 font-bold">
              Step {step} of 4
            </span>
            <h1 className="text-2xl font-bold text-secondary-500 font-poppins mt-1">
              {step === 1 && 'Select Date & Time'}
              {step === 2 && 'Service Address'}
              {step === 3 && 'Payment & Review'}
              {step === 4 && 'Confirm Booking'}
            </h1>
          </div>
        </div>
      )}

      {/* Main Form Body */}
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] items-start">
        
        {/* Left Side: Step View */}
        <div className="card p-8 border border-gray-100 shadow-soft">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Scheduling */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-bold text-secondary-500 font-poppins mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary-500" /> Choose Service Date
                  </h3>
                  <input 
                    type="date" 
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="input-field cursor-pointer"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-secondary-500 font-poppins mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary-500" /> Available Time Slot
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {['09:00', '11:00', '14:00', '16:00'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setBookingTime(t)}
                        className={`p-3 rounded-2xl border-2 text-sm font-semibold transition ${
                          bookingTime === t 
                            ? 'border-primary-500 bg-primary-50/50 text-primary-600'
                            : 'border-gray-200 hover:border-primary-200 text-gray-600'
                        }`}
                      >
                        {t} {parseInt(t.split(':')[0]) >= 12 ? 'PM' : 'AM'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Special Instructions (Optional)
                  </label>
                  <textarea 
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={3}
                    placeholder="E.g., park at gate 4, bring extension wire..."
                    className="input-field resize-none py-3"
                  />
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => {
                      if (!bookingDate) {
                        toast.error('Please choose a date')
                        return
                      }
                      setStep(2)
                    }}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    Select Address <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Address Selection */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                {!showAddressForm ? (
                  <>
                    <h3 className="text-lg font-bold text-secondary-500 font-poppins mb-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary-500" /> Select Saved Address
                    </h3>
                    
                    <div className="space-y-3">
                      {addresses.map((addr) => (
                        <div 
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition ${
                            selectedAddressId === addr.id
                              ? 'border-primary-500 bg-primary-50/50'
                              : 'border-gray-100 hover:border-primary-200 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-sm text-secondary-500">{addr.label}</span>
                            {selectedAddressId === addr.id && <span className="text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full font-bold">Selected</span>}
                          </div>
                          <p className="text-xs text-gray-500">{addr.address_line}, {addr.city}, {addr.pincode}</p>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => setShowAddressForm(true)}
                      className="text-sm font-semibold text-primary-500 hover:underline flex items-center gap-1.5"
                    >
                      + Add New Address
                    </button>
                  </>
                ) : (
                  <form onSubmit={handleCreateAddress} className="space-y-4">
                    <h3 className="text-lg font-bold text-secondary-500 font-poppins mb-2">New Address Details</h3>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Label</label>
                      <input 
                        type="text" 
                        value={addressForm.label}
                        onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                        className="input-field py-2"
                        placeholder="Home, Work, Parents..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Address Line</label>
                      <input 
                        type="text" 
                        value={addressForm.address_line}
                        onChange={(e) => setAddressForm({ ...addressForm, address_line: e.target.value })}
                        className="input-field py-2"
                        placeholder="Flat / House No, Street name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">City</label>
                        <input 
                          type="text" 
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          className="input-field py-2 bg-white"
                          placeholder="Chennai"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Pincode</label>
                        <input 
                          type="text" 
                          value={addressForm.pincode}
                          onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                          className="input-field py-2"
                          placeholder="600017"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-400">Map Pin</label>
                          <p className="text-[11px] text-gray-400">Click the map or use GPS for live tracking.</p>
                        </div>
                        <button
                          type="button"
                          onClick={useCurrentLocationForAddress}
                          className="rounded-xl border border-primary-100 px-3 py-2 text-xs font-bold text-primary-600 hover:bg-primary-50"
                        >
                          Use GPS
                        </button>
                      </div>
                      <LocationPickerMap
                        latitude={addressForm.latitude}
                        longitude={addressForm.longitude}
                        onChange={(latitude, longitude) => setAddressForm({
                          ...addressForm,
                          latitude: Number(latitude.toFixed(6)),
                          longitude: Number(longitude.toFixed(6))
                        })}
                      />
                      <div className="grid grid-cols-2 gap-3 text-[11px] text-gray-500">
                        <span className="rounded-xl bg-gray-50 px-3 py-2">Lat: {addressForm.latitude}</span>
                        <span className="rounded-xl bg-gray-50 px-3 py-2">Lng: {addressForm.longitude}</span>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button 
                        type="button" 
                        onClick={() => setShowAddressForm(false)} 
                        className="btn-secondary w-1/2 py-2.5 rounded-xl"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn-primary w-1/2 py-2.5 rounded-xl"
                      >
                        Save Address
                      </button>
                    </div>
                  </form>
                )}

                <div className="flex gap-4 pt-4 border-t border-gray-50">
                  <button onClick={() => setStep(1)} className="btn-secondary w-1/2 flex justify-center items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button 
                    onClick={() => {
                      if (!selectedAddressId) {
                        toast.error('Please choose/add an address')
                        return
                      }
                      setStep(3)
                    }} 
                    className="btn-primary w-1/2 flex justify-center items-center gap-2"
                  >
                    Review booking <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Payment Choice */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-bold text-secondary-500 font-poppins mb-3 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary-500" /> Choose Payment Option
                  </h3>
                  
                  <div className="space-y-3">
                    <label 
                      className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition ${
                        paymentMethod === 'UPI' ? 'border-primary-500 bg-primary-50/50' : 'border-gray-100 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-primary-500" />
                        <span className="font-semibold text-sm text-secondary-500">Instant UPI (Paytm/GPay)</span>
                      </div>
                      <input 
                        type="radio" 
                        name="pay" 
                        checked={paymentMethod === 'UPI'} 
                        onChange={() => setPaymentMethod('UPI')} 
                      />
                    </label>

                    <label 
                      className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition ${
                        paymentMethod === 'CARD' ? 'border-primary-500 bg-primary-50/50' : 'border-gray-100 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-primary-500" />
                        <span className="font-semibold text-sm text-secondary-500">Razorpay Card / Netbanking</span>
                      </div>
                      <input 
                        type="radio" 
                        name="pay" 
                        checked={paymentMethod === 'CARD'} 
                        onChange={() => setPaymentMethod('CARD')} 
                      />
                    </label>

                    <label 
                      className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition ${
                        paymentMethod === 'WALLET' ? 'border-primary-500 bg-primary-50/50' : 'border-gray-100 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <WalletIcon className="w-5 h-5 text-accent-500" />
                        <div className="text-left">
                          <span className="font-semibold text-sm text-secondary-500 block">ServEase Wallet</span>
                          <span className="text-xs text-gray-400">Available: ₹{walletBalance}</span>
                        </div>
                      </div>
                      <input 
                        type="radio" 
                        name="pay" 
                        checked={paymentMethod === 'WALLET'} 
                        onChange={() => {
                          if (walletBalance < total) {
                            toast.error('Insufficient wallet balance!')
                            return
                          }
                          setPaymentMethod('WALLET')
                        }} 
                        disabled={walletBalance < total}
                      />
                    </label>

                    <label 
                      className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition ${
                        paymentMethod === 'CASH' ? 'border-primary-500 bg-primary-50/50' : 'border-gray-100 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <WalletIcon className="w-5 h-5 text-amber-500" />
                        <span className="font-semibold text-sm text-secondary-500">Cash on Service Delivery</span>
                      </div>
                      <input 
                        type="radio" 
                        name="pay" 
                        checked={paymentMethod === 'CASH'} 
                        onChange={() => setPaymentMethod('CASH')} 
                      />
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-50">
                  <button onClick={() => setStep(2)} className="btn-secondary w-1/2 flex justify-center items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button 
                    onClick={() => setStep(4)} 
                    className="btn-primary w-1/2 flex justify-center items-center gap-2"
                  >
                    Next: Summary <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Summary & Validation */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-bold text-secondary-500 font-poppins mb-3">Verify Promo Code</h3>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="WELCOME10 / SUPER50"
                        className="input-field pl-10"
                        disabled={!!appliedCoupon}
                      />
                    </div>
                    <button 
                      onClick={handleVerifyCoupon}
                      disabled={isVerifyingCoupon || !!appliedCoupon}
                      className="btn-secondary rounded-2xl shrink-0 px-4 py-3"
                    >
                      {appliedCoupon ? 'Applied' : 'Apply'}
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-3xl p-5 space-y-3">
                  <h4 className="font-bold text-sm text-secondary-500 border-b border-gray-100 pb-2">Booking Summary</h4>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Base price:</span>
                    <span>₹{basePrice}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>GST (5%):</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Platform fee:</span>
                    <span>₹{platformFee.toFixed(2)}</span>
                  </div>
                  {urgencyFee > 0 && (
                    <div className="flex justify-between text-sm font-semibold text-red-600 bg-red-50 p-2 rounded-xl">
                      <span>Emergency dispatch:</span>
                      <span>₹{urgencyFee.toFixed(2)}</span>
                    </div>
                  )}
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600 font-semibold bg-emerald-50 p-2 rounded-xl">
                      <span>Promo Discount:</span>
                      <span>-₹{couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-secondary-500 border-t border-gray-100 pt-3">
                    <span>To Pay:</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button onClick={() => setStep(3)} className="btn-secondary w-1/2 flex justify-center items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button 
                    onClick={handlePlaceBooking} 
                    disabled={submitting}
                    className="btn-primary w-1/2 flex justify-center items-center gap-2"
                  >
                    {submitting ? 'Confirming...' : 'Place Booking'} <ShieldCheck className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 5: Success visual confirmation */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-6"
              >
                <div className="flex justify-center">
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: [0, 1.2, 1] }} 
                    transition={{ duration: 0.6 }}
                    className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"
                  >
                    <CheckCircle2 className="w-12 h-12" />
                  </motion.div>
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold font-poppins text-secondary-500">Booking Confirmed!</h2>
                  <p className="text-gray-500">Your Booking ID is: <span className="font-bold text-primary-500">{createdBookingId}</span></p>
                  <p className="text-sm text-gray-400">Redirecting you to your dashboard to track live status...</p>
                </div>
                
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: '100%' }} 
                    transition={{ duration: 4.8 }}
                    className="bg-emerald-500 h-full"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Service Item Detail */}
        {step < 5 && (
          <div className="card p-6 border border-gray-100 bg-gray-50/50 space-y-5">
            <h3 className="font-bold text-lg text-secondary-500 font-poppins">Booking Service</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase">Service Offered</p>
                <p className="font-bold text-secondary-500 mt-1">{service?.name}</p>
              </div>
              
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase">Provider / Agency</p>
                <p className="font-semibold text-gray-700 mt-1">{service?.provider_business || service?.provider_name}</p>
              </div>
              
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase">Duration</p>
                <p className="text-sm font-medium text-gray-600 mt-1">{service?.duration_minutes} mins estimated</p>
              </div>
            </div>

            <div className="border-t border-gray-200/60 pt-4 space-y-3 text-xs text-gray-500 leading-5">
              <div className={`rounded-2xl border p-4 ${isEmergencyBooking ? 'border-red-200 bg-red-50 text-red-700' : 'border-primary-100 bg-white text-gray-600'}`}>
                <div className="mb-2 flex items-center gap-2 font-bold text-secondary-500">
                  {isEmergencyBooking ? <AlertTriangle className="h-4 w-4 text-danger" /> : <BrainCircuit className="h-4 w-4 text-primary-500" />}
                  Smart booking check
                </div>
                <div className="space-y-1">
                  <p>Expected cost: Rs {estimatedMin}-Rs {estimatedMax}</p>
                  <p>Duration: {service?.duration_minutes || 60} mins</p>
                  <p>Priority: {isEmergencyBooking ? 'Emergency dispatch' : 'Normal slot'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Background-verified professional assigned</span>
              </div>
              <div className="flex gap-2">
                <Sparkles className="w-4 h-4 text-accent-500 shrink-0" />
                <span>Premium warranty included for 30 days</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-semibold">Loading checkout details...</p>
        </div>
      </div>
    }>
      <NewBookingContent />
    </Suspense>
  )
}
