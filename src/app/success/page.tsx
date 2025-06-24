import Link from 'next/link'
import content from '../../../data/success.json'

export default function Success() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>{content.title}</h1>
      <p>{content.text}</p>
      <Link href="/account">{content.linkText}</Link>
    </div>
  )
}
