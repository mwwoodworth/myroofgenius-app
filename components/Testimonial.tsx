'use client'
import Card from './ui/Card'

interface TestimonialProps {
  quote: string
  author: string
  title?: string
}

export default function Testimonial({ quote, author, title }: TestimonialProps) {
  return (
    <Card className="text-center space-y-4">
      <p className="text-foreground-secondary text-sm">"{quote}"</p>
      <div>
        <p className="font-semibold text-foreground">{author}</p>
        {title && <p className="text-xs text-foreground-secondary">{title}</p>}
      </div>
    </Card>
  )
}
