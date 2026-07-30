'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building, Settings, FileText, Plus, CheckCircle, ShieldCheck, 
  Trash2, X, Send, Layers, Clock, IndianRupee, Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getApiUrl } from '@/lib/api'
import { getStoredAuth } from '@/lib/auth'

type Category = {
  id: number
  name: string
}

type MyService = {
  id: number
  name: string
  category_name: string
  base_price: string
  duration_minutes: number
  description: string
}

export default function ProviderProfilePage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'services'>('profile')
  const [loading, setLoading] = useState(true)
  
  // Profile state
  const [profile, setProfile] = useState({
    business_name: '',
    business_description: '',
    years_of_experience: 0,
    hourly_rate: '0.00',
    minimum_charge: '0.00',
    gst_number: '',
    pan_number: '',
    verification_status: 'PENDING'
  })

  // Services list & Categories state
  const [myServices, setMyServices] = useState<MyService[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  
  // New Service Form State
  const [showAddServiceModal, setShowAddServiceModal] = useState(false)
  const [serviceForm, setServiceForm] = useState({
    name: '',
    category: '',
    description: '',
    short_description: '',
    base_price: '',
    duration_minutes: 60
  })

  const [savingProfile, setSavingProfile] = useState(false)
  const [addingService, setAddingService] = useState(false)

  const loadData = async () => {
    const auth = getStoredAuth()
    if (!auth.accessToken || !auth.user?.id) {
      setLoading(false)
      return
    }

    const headers = { 'Authorization': `Bearer ${auth.accessToken}` }
    try {
      setLoading(true)
      // 1. Fetch Profile
      const profRes = await fetch(getApiUrl('/api/providers/profile/'), { headers })
      if (profRes.ok) {
        const profData = await profRes.json()
        setProfile({
          business_name: profData.business_name || '',
          business_description: profData.business_description || '',
          years_of_experience: profData.years_of_experience || 0,
          hourly_rate: profData.hourly_rate || '0.00',
          minimum_charge: profData.minimum_charge || '0.00',
          gst_number: profData.gst_number || '',
          pan_number: profData.pan_number || '',
          verification_status: profData.verification_status || 'PENDING'
        })

        // 2. Fetch My Services (filter by provider user id)
        const servRes = await fetch(getApiUrl(`/api/services/?provider=${auth.user.id}`))
        if (servRes.ok) {
          const servData = await servRes.json()
          setMyServices(servData.results || servData)
        }
      }

      // 3. Fetch Categories for dropdown
      const catRes = await fetch(getApiUrl('/api/categories/'))
      if (catRes.ok) {
        const catData = await catRes.json()
        setCategories(catData.results || catData)
      }
    } catch (err) {
      toast.error('Error loading provider profile details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    const auth = getStoredAuth()
    
    try {
      const res = await fetch(getApiUrl('/api/providers/profile/'), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.accessToken}`
        },
        body: JSON.stringify(profile)
      })

      if (res.ok) {
        toast.success('Business profile updated successfully!')
        loadData()
      } else {
        toast.error('Failed to update business profile')
      }
    } catch (err) {
      toast.error('Error saving profile changes')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!serviceForm.category || !serviceForm.name || !serviceForm.base_price) {
      toast.error('Please fill required service information')
      return
    }

    setAddingService(true)
    const auth = getStoredAuth()

    try {
      const res = await fetch(getApiUrl('/api/services/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.accessToken}`
        },
        body: JSON.stringify({
          ...serviceForm,
          category: parseInt(serviceForm.category),
          base_price: parseFloat(serviceForm.base_price),
          duration_minutes: parseInt(serviceForm.duration_minutes.toString())
        })
      })

      if (res.ok) {
        toast.success('New service listing published successfully!')
        setShowAddServiceModal(false)
        setServiceForm({
          name: '',
          category: '',
          description: '',
          short_description: '',
          base_price: '',
          duration_minutes: 60
        })
        loadData()
      } else {
        const data = await res.json()
        toast.error(data.detail || data.error || 'Failed to publish service listing')
      }
    } catch (err) {
      toast.error('Error creating service entry')
    } finally {
      setAddingService(false)
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
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      
      {/* Page Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-poppins text-secondary-500">Business Setup</h1>
          <p className="text-sm text-gray-500 mt-1">Setup your business profile, upload KYC parameters, and manage services.</p>
        </div>
        
        {/* Verification status label */}
        <div className="self-start md:self-auto flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-gray-100 shadow-soft">
          <ShieldCheck className={`w-4 h-4 ${profile.verification_status === 'APPROVED' ? 'text-emerald-500' : 'text-amber-500'}`} />
          <span className="text-xs font-bold text-gray-600">
            KYC Status: <span className={profile.verification_status === 'APPROVED' ? 'text-emerald-600' : 'text-amber-600'}>{profile.verification_status}</span>
          </span>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-gray-200 mb-8 gap-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-4 text-sm font-bold transition-all relative ${
            activeTab === 'profile' ? 'text-primary-500' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {activeTab === 'profile' && <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />}
          Business Information
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`pb-4 text-sm font-bold transition-all relative ${
            activeTab === 'services' ? 'text-primary-500' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {activeTab === 'services' && <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />}
          Offerings & Services
        </button>
      </div>

      {/* Main Container */}
      <div>
        <AnimatePresence mode="wait">
          
          {/* Tab 1: Profile Editing */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="card p-8 border border-gray-100 shadow-soft bg-white"
            >
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Business / Trade Name</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        required
                        value={profile.business_name}
                        onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
                        className="input-field pl-10"
                        placeholder="Ramesh Electricals..."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Years of Experience</label>
                    <input 
                      type="number" 
                      required
                      value={profile.years_of_experience}
                      onChange={(e) => setProfile({ ...profile, years_of_experience: parseInt(e.target.value) || 0 })}
                      className="input-field"
                      min={0}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Business Profile & Description</label>
                  <textarea 
                    rows={4}
                    value={profile.business_description}
                    onChange={(e) => setProfile({ ...profile, business_description: e.target.value })}
                    className="input-field resize-none py-3"
                    placeholder="Describe your specialization, warranty periods, target areas..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6 border-t border-gray-50 pt-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">GST Registration No. (Optional)</label>
                    <input 
                      type="text" 
                      value={profile.gst_number}
                      onChange={(e) => setProfile({ ...profile, gst_number: e.target.value.toUpperCase() })}
                      className="input-field"
                      placeholder="33AAAAA1111A1Z1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">PAN Card Number</label>
                    <input 
                      type="text" 
                      required
                      value={profile.pan_number}
                      onChange={(e) => setProfile({ ...profile, pan_number: e.target.value.toUpperCase() })}
                      className="input-field"
                      placeholder="ABCDE1234F"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 border-t border-gray-50 pt-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Call-out Charge (₹)</label>
                    <input 
                      type="number" 
                      value={parseFloat(profile.minimum_charge) || ''}
                      onChange={(e) => setProfile({ ...profile, minimum_charge: e.target.value })}
                      className="input-field"
                      placeholder="149"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Standard Hourly Rate (₹)</label>
                    <input 
                      type="number" 
                      value={parseFloat(profile.hourly_rate) || ''}
                      onChange={(e) => setProfile({ ...profile, hourly_rate: e.target.value })}
                      className="input-field"
                      placeholder="299"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={savingProfile}
                    className="btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl text-sm"
                  >
                    {savingProfile ? 'Saving...' : 'Save Settings'} <CheckCircle className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Tab 2: Manage Services */}
          {activeTab === 'services' && (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold font-poppins text-secondary-500">My Service Catalog</h3>
                <button
                  onClick={() => setShowAddServiceModal(true)}
                  className="btn-primary flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm shadow-soft"
                >
                  <Plus className="w-4 h-4" /> Add Service Listing
                </button>
              </div>

              {myServices.length === 0 ? (
                <div className="card text-center py-16 border border-gray-100 shadow-soft bg-white">
                  <Layers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="font-semibold text-secondary-500">No active service listings</h4>
                  <p className="text-gray-400 text-xs mt-1">Register the tasks you can perform so customers can book you.</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {myServices.map((ser) => (
                    <div 
                      key={ser.id}
                      className="card p-5 border border-gray-100 bg-white hover:border-primary-100 shadow-soft flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full font-bold">
                            {ser.category_name}
                          </span>
                        </div>
                        <h4 className="text-lg font-bold font-poppins text-secondary-500">{ser.name}</h4>
                        <p className="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed">{ser.description}</p>
                      </div>

                      <div className="mt-5 border-t border-gray-50 pt-4 flex justify-between items-center">
                        <div className="flex gap-4 text-xs font-semibold text-gray-500">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-primary-400" /> {ser.duration_minutes} mins</span>
                          <span className="flex items-center gap-0.5"><IndianRupee className="w-3.5 h-3.5 text-primary-400" /> {ser.base_price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Add Service Slide-Over Modal */}
      <AnimatePresence>
        {showAddServiceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card w-full max-w-lg p-6 bg-white shadow-xl relative"
            >
              <button 
                onClick={() => setShowAddServiceModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold font-poppins text-secondary-500 mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-500" /> Publish Service Listing
              </h3>
              <p className="text-xs text-gray-400 mb-6">List a new home task package with custom pricing & details.</p>

              <form onSubmit={handleAddService} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Service Name / Title</label>
                  <input 
                    type="text" 
                    required
                    value={serviceForm.name}
                    onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                    className="input-field py-2"
                    placeholder="E.g., Inverter Installation, Split AC General Cleaning"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Service Category</label>
                  <select 
                    required
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                    className="input-field py-2"
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Service Description</label>
                  <textarea 
                    rows={3}
                    required
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    className="input-field resize-none py-2"
                    placeholder="Enter details on what is included, materials covered, terms..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Standard Price (₹)</label>
                    <input 
                      type="number" 
                      required
                      value={serviceForm.base_price}
                      onChange={(e) => setServiceForm({ ...serviceForm, base_price: e.target.value })}
                      className="input-field py-2"
                      placeholder="399"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Est. Duration (Minutes)</label>
                    <input 
                      type="number" 
                      required
                      value={serviceForm.duration_minutes}
                      onChange={(e) => setServiceForm({ ...serviceForm, duration_minutes: parseInt(e.target.value) || 60 })}
                      className="input-field py-2"
                      placeholder="60"
                      min={10}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowAddServiceModal(false)}
                    className="btn-secondary w-1/2 py-2.5 rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={addingService}
                    className="btn-primary w-1/2 py-2.5 rounded-xl text-xs flex justify-center items-center gap-1"
                  >
                    {addingService ? 'Publishing...' : 'Publish Listing'} <Send className="w-3.5 h-3.5" />
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
