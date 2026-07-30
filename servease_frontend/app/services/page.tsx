'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, ArrowRight, BrainCircuit, IndianRupee, MapPin, Search, Star, Clock, ShieldCheck, Sparkles, SlidersHorizontal } from 'lucide-react'
import { getApiUrl } from '@/lib/api'

const ServiceDiscoveryMap = dynamic(() => import('@/components/service-discovery-map'), {
  ssr: false,
  loading: () => <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />,
})

type Category = {
  id: number
  name: string
  slug: string
  description: string
  icon: string
}

type Service = {
  id: number
  category: number
  category_name: string
  provider: number
  provider_name: string
  provider_business: string
  provider_rating: string
  name: string
  slug: string
  description: string
  short_description: string
  pricing_type: string
  base_price: string
  duration_minutes: number
  thumbnail: string | null
  provider_latitude?: string | null
  provider_longitude?: string | null
}

type AssistantService = {
  id: number
  name: string
  category_name: string
  provider_business: string
  provider_name: string
  provider_rating: string
  match_score: number
  estimate: {
    min_cost: number
    max_cost: number
    duration_minutes: number
    urgency_fee: number
  }
}

type ImageDiagnosis = {
  detected: string
  possible_causes: string[]
  repair: string
  severity: string
  confidence: number
  estimate?: {
    min_cost: number
    max_cost: number
    duration_minutes: number
    urgency_fee: number
  }
}

type AssistantResult = {
  suggested_category: string
  confidence: number
  emergency: boolean
  priority: string
  possible_causes: string[]
  repair_type: string
  estimate: {
    min_cost: number
    max_cost: number
    duration_minutes: number
    urgency_fee: number
  }
  image_diagnosis?: ImageDiagnosis
  recommended_services: AssistantService[]
  next_actions: string[]
}

export default function ServicesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [detectedLocation, setDetectedLocation] = useState('Chennai, TN')
  const [mapCenter, setMapCenter] = useState({ latitude: 13.0827, longitude: 80.2707, label: 'Chennai, TN' })
  const [isDetecting, setIsDetecting] = useState(false)
  const [assistantIssue, setAssistantIssue] = useState('')
  const [assistantPhoto, setAssistantPhoto] = useState<File | null>(null)
  const [assistantResult, setAssistantResult] = useState<AssistantResult | null>(null)
  const [assistantLoading, setAssistantLoading] = useState(false)

  // Fetch categories and services
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [catRes, serRes] = await Promise.all([
          fetch(getApiUrl('/api/categories/')),
          fetch(getApiUrl('/api/services/'))
        ])
        
        if (catRes.ok && serRes.ok) {
          const catData = await catRes.json()
          const serData = await serRes.json()
          setCategories(catData.results || catData)
          setServices(serData.results || serData)
        }
      } catch (err) {
        console.error('Error loading service data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const detectLocation = () => {
    setIsDetecting(true)
    if (!navigator.geolocation) {
      setDetectedLocation('T. Nagar, Chennai')
      setMapCenter({ latitude: 13.0418, longitude: 80.2341, label: 'T. Nagar, Chennai' })
      setIsDetecting(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = 'Current location'
        setDetectedLocation(nextLocation)
        setMapCenter({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          label: nextLocation,
        })
        setIsDetecting(false)
      },
      () => {
        setDetectedLocation('T. Nagar, Chennai')
        setMapCenter({ latitude: 13.0418, longitude: 80.2341, label: 'T. Nagar, Chennai' })
        setIsDetecting(false)
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  const analyzeIssue = async () => {
    if (assistantIssue.trim().length < 3) return

    try {
      setAssistantLoading(true)
      const formData = new FormData()
      formData.append('issue', assistantIssue)
      formData.append('area', detectedLocation)
      formData.append('customer_latitude', mapCenter.latitude.toString())
      formData.append('customer_longitude', mapCenter.longitude.toString())
      if (assistantPhoto) {
        formData.append('photo', assistantPhoto)
      }

      const res = await fetch(getApiUrl('/api/services/ai-assistant/'), {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Unable to analyze issue')

      setAssistantResult(data)
      setSearchQuery(data.suggested_category)
      setSelectedCategory(data.suggested_category)
    } catch (err) {
      console.error('Assistant error:', err)
    } finally {
      setAssistantLoading(false)
    }
  }

  // Filtering logic
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          service.category_name?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || 
                            service.category_name?.toLowerCase() === selectedCategory.toLowerCase()
                            
    return matchesSearch && matchesCategory
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      
      {/* Search Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="relative mb-10 overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,#0b1714_0%,#1b2430_58%,#563b11_100%)] p-8 text-white shadow-gold"
      >
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-accent-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur">
            <Sparkles className="w-3.5 h-3.5 text-accent-200" /> Premium Local Marketplace
          </p>
          <h1 className="text-4xl font-bold font-poppins sm:text-5xl">Find the best home services</h1>
          <p className="mt-3 text-white/80 text-base sm:text-lg">Book certified and background-verified local professionals in Chennai.</p>
          
          {/* Smart Search Bar */}
          <div className="mt-8 flex flex-col md:flex-row gap-3 bg-white p-2 rounded-2xl md:rounded-full shadow-lg text-secondary-500 max-w-2xl">
            <div className="flex items-center flex-1 gap-2 px-3 border-b md:border-b-0 md:border-r border-gray-100 py-2">
              <Search className="w-5 h-5 text-primary-500 shrink-0" />
              <input 
                type="text" 
                placeholder="What service do you need?" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full outline-none text-sm font-medium bg-transparent"
              />
            </div>
            
            <div className="flex items-center gap-2 px-3 py-2">
              <MapPin className="w-4 h-4 text-accent-500 shrink-0" />
              <button 
                onClick={detectLocation}
                className="text-xs font-semibold text-gray-500 hover:text-primary-600 transition"
              >
                {isDetecting ? 'Detecting...' : detectedLocation}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-10 grid gap-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-soft lg:grid-cols-[1.15fr_0.85fr]"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-poppins text-xl font-bold text-secondary-500">AI Service Assistant</h2>
              <p className="text-sm text-gray-500">Describe the problem and get the best service, estimate, and priority.</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={assistantIssue}
              onChange={(e) => setAssistantIssue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') analyzeIssue()
              }}
              placeholder="Example: fan sound varudhu, water leak, AC cooling illa"
              className="input-field"
            />
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 transition hover:border-primary-300">
              <span>{assistantPhoto ? assistantPhoto.name : 'Attach photo'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAssistantPhoto(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={analyzeIssue}
              disabled={assistantLoading || assistantIssue.trim().length < 3}
              className="btn-primary flex shrink-0 items-center justify-center gap-2 px-5"
            >
              {assistantLoading ? 'Checking...' : 'Analyze'} <Sparkles className="h-4 w-4" />
            </button>
          </div>

          {assistantResult && (
            <div className={`rounded-2xl border p-4 ${assistantResult.emergency ? 'border-danger/30 bg-red-50' : 'border-primary-100 bg-primary-50/50'}`}>
              <div className="flex flex-wrap items-center gap-2">
                {assistantResult.emergency && <AlertTriangle className="h-5 w-5 text-danger" />}
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-secondary-500">
                  {assistantResult.suggested_category}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-secondary-500">
                  {assistantResult.confidence}% confidence
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${assistantResult.emergency ? 'bg-danger text-white' : 'bg-emerald-500 text-white'}`}>
                  {assistantResult.priority.replace('_', ' ')}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-secondary-500">{assistantResult.repair_type}</p>
              <p className="mt-1 text-sm text-gray-600">Possible: {assistantResult.possible_causes.join(', ')}</p>
              {assistantResult.image_diagnosis && (
                <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase text-gray-500">Image diagnosis</p>
                  <p className="mt-2 text-sm text-slate-800">{assistantResult.image_diagnosis.detected}</p>
                  <p className="text-xs text-gray-500">Severity: {assistantResult.image_diagnosis.severity}</p>
                  <p className="mt-1 text-sm text-gray-600">Causes: {assistantResult.image_diagnosis.possible_causes.join(', ')}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-gray-50 p-4">
          {assistantResult ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-secondary-500">Smart estimate</span>
                <IndianRupee className="h-4 w-4 text-primary-500" />
              </div>
              <div>
                <p className="font-poppins text-3xl font-bold text-secondary-500">
                  Rs {assistantResult.estimate.min_cost}-Rs {assistantResult.estimate.max_cost}
                </p>
                <p className="text-sm text-gray-500">{assistantResult.estimate.duration_minutes} mins expected</p>
              </div>
              <div className="space-y-2">
                {assistantResult.recommended_services.slice(0, 2).map((item) => (
                  <Link
                    key={item.id}
                    href={`/bookings/new?serviceId=${item.id}`}
                    className="flex items-center justify-between rounded-2xl bg-white p-3 text-sm transition hover:shadow-soft"
                  >
                    <div>
                      <p className="font-bold text-secondary-500">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.match_score}% provider match</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-primary-500" />
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-44 flex-col justify-center gap-3 text-sm text-gray-500">
              <p className="font-semibold text-secondary-500">Try these:</p>
              {['Gas leak in kitchen', 'Fan noise and slow speed', 'Bathroom pipe leaking'].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => setAssistantIssue(sample)}
                  className="rounded-2xl bg-white px-4 py-3 text-left font-medium transition hover:text-primary-600"
                >
                  {sample}
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Categories Filter Tabs */}
      <div className="mb-10">
        <h2 className="text-xl font-bold font-poppins text-secondary-500 mb-4 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary-500" /> Browse Categories
        </h2>
        
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
              selectedCategory === 'all'
                ? 'bg-primary-500 text-white shadow-soft'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            All Services
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                selectedCategory.toLowerCase() === cat.name.toLowerCase()
                  ? 'bg-primary-500 text-white shadow-soft'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {!loading && filteredServices.length > 0 && (
        <div className="card mb-10 border border-gray-100 p-4 shadow-soft">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-poppins text-xl font-bold text-secondary-500">Nearby provider map</h2>
              <p className="text-sm text-gray-500">{filteredServices.length} services around {detectedLocation}</p>
            </div>
            <button
              type="button"
              onClick={detectLocation}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary-100 px-4 py-2 text-sm font-bold text-primary-600 hover:bg-primary-50"
            >
              <MapPin className="h-4 w-4" /> {isDetecting ? 'Detecting...' : 'Use GPS'}
            </button>
          </div>
          <ServiceDiscoveryMap services={filteredServices} center={mapCenter} />
        </div>
      )}

      {/* Services Grid */}
      {loading ? (
        // Loading Shimmer Skeletons
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card h-64 bg-white animate-pulse flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-6 w-24 bg-gray-100 rounded-full" />
                <div className="h-8 w-2/3 bg-gray-100 rounded-2xl" />
                <div className="h-4 w-5/6 bg-gray-100 rounded-xl" />
              </div>
              <div className="flex justify-between items-center">
                <div className="h-6 w-16 bg-gray-100 rounded-xl" />
                <div className="h-10 w-24 bg-gray-100 rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="rounded-2xl border border-gray-100 bg-white p-8 py-16 text-center shadow-soft"
        >
          <SlidersHorizontal className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-secondary-500">No services found</h3>
          <p className="text-gray-500 mt-2">Try clearing your filters or using a different search query.</p>
        </motion.div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredServices.map((service, index) => (
              <motion.div
                layout
                key={service.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="card card-hover flex flex-col justify-between border border-gray-100 hover:border-primary-100"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-600">
                      {service.category_name}
                    </span>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 font-semibold bg-gray-50 px-2 py-1 rounded-xl">
                      <Star className="w-4 h-4 text-warning fill-warning" />
                      <span>{service.provider_rating}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold font-poppins text-secondary-500 leading-snug hover:text-primary-500 transition duration-300">
                    {service.name}
                  </h3>
                  
                  <p className="mt-2 text-sm leading-6 text-gray-500 line-clamp-2">
                    {service.description}
                  </p>
                  
                  <div className="mt-4 flex flex-col gap-2 border-t border-gray-50 pt-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                      <Clock className="w-3.5 h-3.5 text-primary-400" />
                      <span>Est. Duration: {service.duration_minutes} mins</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                      <ShieldCheck className="w-3.5 h-3.5 text-accent-500" />
                      <span>By: <span className="font-semibold text-secondary-500">{service.provider_business || service.provider_name}</span></span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-400">Fixed Rate</p>
                    <p className="text-2xl font-bold text-secondary-500 font-poppins">
                      Rs {service.base_price}
                    </p>
                  </div>
                  
                  <Link 
                    href={`/bookings/new?serviceId=${service.id}`}
                    className="btn-primary flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm"
                  >
                    Book Now <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
