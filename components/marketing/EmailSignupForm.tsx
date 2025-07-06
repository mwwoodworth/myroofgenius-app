'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '../ui/Button'
import Lottie from 'lottie-react'
import successAnim from '../../public/empty-box.json'

export default function EmailSignupForm({className=""}:{className?:string}) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle'|'success'|'error'|'loading'>('idle')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({email})})
      if (res.ok) setStatus('success')
      else throw new Error('fail')
    } catch {
      setStatus('error')
    }
  }
  return (
    <form onSubmit={submit} className={`space-y-4 ${className}`}>\
      {status==='success' ? (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex flex-col items-center text-center">
          <Lottie animationData={successAnim} className="w-24 h-24" loop={false}/>
          <p className="text-green-600 font-semibold">Check your inbox!</p>
        </motion.div>
      ) : (
        <>
          <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" className="w-full px-4 py-3 rounded-lg text-gray-900"/>
          <Button type="submit" className="w-full" disabled={status==='loading'}>
            {status==='loading' ? 'Submitting...' : 'Get Free Sample'}
          </Button>
          <p className="text-xs text-gray-500 text-center">We respect your privacy. Unsubscribe anytime.</p>
          {status==='error' && <p className="text-red-600 text-sm text-center">Something went wrong.</p>}
        </>
      )}
    </form>
  )
}
