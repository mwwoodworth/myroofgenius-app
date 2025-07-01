'use client';
import Card from './ui/Card';

interface TestimonialProps {
  quote: string
  author: string
  title?: string
}

export default function Testimonial({ quote, author, title }: TestimonialProps) {
  return (
    <Card className="text-center space-y-4">
      <p className="text-text-secondary text-sm">&quot;{quote}&quot;</p>
      <div>
        <p className="font-semibold text-text-primary">{author}</p>
        {title && <p className="text-xs text-text-secondary">{title}</p>}
      </div>
    </Card>
  );
}
