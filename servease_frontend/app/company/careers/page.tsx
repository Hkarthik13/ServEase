'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, Send, MapPin, Clock, Calendar, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

type Job = {
  id: string
  title: string
  department: string
  location: string
  type: string
}

const JOBS: Job[] = [
  { id: '1', title: 'Senior Full Stack Engineer', department: 'Engineering', location: 'Chennai, IN', type: 'Full-time' },
  { id: '2', title: 'UI/UX Product Designer', department: 'Design', location: 'Remote (India)', type: 'Full-time' },
  { id: '3', title: 'Operations Lead - Tamil Nadu', department: 'Operations', location: 'Chennai, IN', type: 'Full-time' },
]

export default function CareersPage() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isApplying, setIsApplying] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', portfolio: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsApplying(true)
    setTimeout(() => {
      toast.success('Application submitted! We will reach out within 3 business days.')
      setSelectedJob(null)
      setForm({ name: '', email: '', portfolio: '' })
      setIsApplying(false)
    }, 1200)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      {/* Intro */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl font-bold font-poppins text-secondary-500 sm:text-5xl">Build the future of Local Commerce</h1>
        <p className="mt-4 text-gray-500 text-sm sm:text-base leading-relaxed">
          Join our mission to digitize localized service markets and build robust booking infrastructures.
        </p>
      </div>

      {/* Jobs list */}
      <div className="space-y-6 mb-16">
        <h2 className="text-2xl font-bold text-secondary-500 font-poppins mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary-500" /> Current Openings
        </h2>

        <div className="grid gap-4">
          {JOBS.map((job) => (
            <div 
              key={job.id}
              className="card p-6 border border-gray-100 bg-white hover:border-primary-100 shadow-soft flex flex-col sm:flex-row justify-between sm:items-center gap-4"
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">{job.department}</span>
                <h3 className="text-lg font-bold text-secondary-500 mt-2 font-poppins">{job.title}</h3>
                
                <div className="flex gap-4 text-xs text-gray-400 mt-2 font-medium">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {job.type}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedJob(job)}
                className="btn-primary rounded-xl px-5 py-2.5 text-xs self-start sm:self-auto shrink-0"
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Application slide modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card w-full max-w-md p-6 bg-white shadow-xl relative"
            >
              <button 
                onClick={() => setSelectedJob(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold font-poppins text-secondary-500 mb-1">Apply for Position</h3>
              <p className="text-xs text-primary-500 font-bold mb-6">{selectedJob.title}</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1 font-poppins">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field py-2"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1 font-poppins">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input-field py-2"
                    placeholder="name@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1 font-poppins">Resume / LinkedIn Profile / Portfolio URL</label>
                  <input 
                    type="url" 
                    required
                    value={form.portfolio}
                    onChange={(e) => setForm({ ...form, portfolio: e.target.value })}
                    className="input-field py-2"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={isApplying}
                    className="btn-primary w-full flex justify-center items-center gap-1.5 py-3 rounded-2xl text-sm"
                  >
                    {isApplying ? 'Submitting...' : 'Submit Application'} <Send className="w-4 h-4" />
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

function X({ className, ...props }: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className} 
      {...props}
    >
      <path d="M18 6 6 18"/>
      <path d="m6 6 12 12"/>
    </svg>
  )
}
