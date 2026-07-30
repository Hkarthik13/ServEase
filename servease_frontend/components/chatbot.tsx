'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Sparkles, User, ChevronRight } from 'lucide-react'
import Link from 'next/link'

type Message = {
  id: string
  sender: 'user' | 'bot'
  text: string
  suggestions?: { text: string; href?: string }[]
}

const FAQ_RESPONSES: { [key: string]: { text: string; suggestions?: { text: string; href?: string }[] } } = {
  'pricing': {
    text: 'For all service categories, pricing is transparently listed. Most electrician and plumbing works start at a base price of Rs 149 to Rs 299. You can view all category prices on our services page!',
    suggestions: [
      { text: 'View Services', href: '/services' }
    ]
  },
  'booking': {
    text: 'To book a service, simply click the "Book Now" button on any service listing. You can choose your date, select a convenient time slot, verify a coupon, and checkout in less than 2 minutes!',
    suggestions: [
      { text: 'Go to Services', href: '/services' }
    ]
  },
  'refund': {
    text: 'ServEase operates an instant refund wallet. If you cancel a pending booking, the entire booking amount is refunded instantly to your ServEase Wallet, which you can use for your next checkout.',
    suggestions: [
      { text: 'Check Wallet', href: '/dashboard' }
    ]
  },
  'verify': {
    text: 'Safety is our absolute priority! All providers on ServEase go through a 3-step KYC verification process where we check their Aadhaar, PAN card, and past project certifications before listing them.',
    suggestions: [
      { text: 'Book Verified Experts', href: '/services' }
    ]
  }
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Vanakkam! I am your ServEase Assistant. How can I help you simplify your home tasks today?',
      suggestions: [
        { text: 'How do I place a booking?' },
        { text: 'Is pricing transparent?' },
        { text: 'Are providers safe?' },
        { text: 'How does the wallet work?' }
      ]
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text
    }

    setMessages((prev) => [...prev, userMsg])
    setInputValue('')

    // Generate Bot Response
    setTimeout(() => {
      let replyText = "I'm sorry, I didn't quite get that. You can ask me about pricing, booking procedures, refund policies, or partner verification."
      let suggs = [
        { text: 'How do I place a booking?' },
        { text: 'Is pricing transparent?' }
      ]

      const normalized = text.toLowerCase()
      if (normalized.includes('book') || normalized.includes('how to place')) {
        replyText = FAQ_RESPONSES.booking.text
        suggs = FAQ_RESPONSES.booking.suggestions || []
      } else if (normalized.includes('price') || normalized.includes('charge') || normalized.includes('pricing')) {
        replyText = FAQ_RESPONSES.pricing.text
        suggs = FAQ_RESPONSES.pricing.suggestions || []
      } else if (normalized.includes('safe') || normalized.includes('verify') || normalized.includes('trust')) {
        replyText = FAQ_RESPONSES.verify.text
        suggs = FAQ_RESPONSES.verify.suggestions || []
      } else if (normalized.includes('wallet') || normalized.includes('refund') || normalized.includes('cancel')) {
        replyText = FAQ_RESPONSES.refund.text
        suggs = FAQ_RESPONSES.refund.suggestions || []
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'bot',
          text: replyText,
          suggestions: suggs
        }
      ])
    }, 800)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/30 border border-white/20"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90 }} animate={{ rotate: 0 }} exit={{ rotate: -90 }}>
              <MessageSquare className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="absolute bottom-16 right-0 w-80 sm:w-96 h-[480px] rounded-3xl border border-white/20 bg-white/90 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden text-secondary-500"
          >
            {/* Window Header */}
            <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-4 text-white flex items-center gap-2 shadow">
              <Sparkles className="w-5 h-5 text-accent-300" />
              <div>
                <p className="font-bold text-sm font-poppins">ServEase AI Support</p>
                <span className="text-[10px] text-white/80">Online - Live Answers</span>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-2">
                  <div className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    {/* Icon prefix */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                      msg.sender === 'bot' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {msg.sender === 'bot' ? <Sparkles className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                    </div>

                    <div className={`p-3 rounded-2xl max-w-[75%] text-xs leading-relaxed ${
                      msg.sender === 'bot' 
                        ? 'bg-gray-50 text-gray-700' 
                        : 'bg-primary-500 text-white shadow-soft'
                    }`}>
                      {msg.text}
                    </div>
                  </div>

                  {/* Suggestion Badges */}
                  {msg.sender === 'bot' && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pl-9">
                      {msg.suggestions.map((sug, sIdx) => (
                        sug.href ? (
                          <Link 
                            key={sIdx}
                            href={sug.href}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-[10px] font-bold text-primary-600 border border-primary-100 hover:bg-primary-100 transition"
                          >
                            {sug.text} <ChevronRight className="w-3 h-3" />
                          </Link>
                        ) : (
                          <button
                            key={sIdx}
                            onClick={() => handleSendMessage(sug.text)}
                            className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-semibold text-gray-600 border border-gray-100 hover:bg-gray-100 transition"
                          >
                            {sug.text}
                          </button>
                        )
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage(inputValue)
              }}
              className="p-3 border-t border-gray-100 bg-white/70 flex gap-2"
            >
              <input
                type="text"
                placeholder="Ask about booking, wallet, safety..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 outline-none text-xs font-semibold px-3 py-2 rounded-2xl bg-gray-50 border border-gray-100 focus:border-primary-200 transition"
              />
              <button
                type="submit"
                className="p-2.5 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white shrink-0 shadow-soft"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
