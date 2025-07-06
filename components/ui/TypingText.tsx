'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface TypingTextProps {
  texts: string[]
  speed?: number
  className?: string
}

export default function TypingText({ texts, speed = 80, className }: TypingTextProps) {
  const [index, setIndex] = useState(0)
  const [subIndex, setSubIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!deleting && subIndex === texts[index].length) {
      const t = setTimeout(() => setDeleting(true), 1000)
      return () => clearTimeout(t)
    }
    if (deleting && subIndex === 0) {
      setDeleting(false)
      setIndex((i) => (i + 1) % texts.length)
      return
    }
    const timeout = setTimeout(() => {
      setSubIndex((i) => i + (deleting ? -1 : 1))
    }, deleting ? speed / 2 : speed)
    return () => clearTimeout(timeout)
  }, [subIndex, deleting, index, texts, speed])

  useEffect(() => {
    setSubIndex(0)
  }, [index])

  return (
    <span className={className}>
      {texts[index].substring(0, subIndex)}
      <motion.span
        className="inline-block w-1 h-5 bg-white ml-1"
        animate={{ opacity: [0, 1] }}
        transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }}
        aria-hidden="true"
      />
    </span>
  )
}
