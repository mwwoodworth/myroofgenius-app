import Link from 'next/link'
import content from '../../../data/cancel.json'

export default function Cancel() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>{content.title}</h1>
      <p>{content.text}</p>
      <Link href="/marketplace">{content.linkText}</Link>
    </div>
  )
}
