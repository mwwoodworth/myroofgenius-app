import content from '../data/home.json'

export default function Home() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>{content.headline}</h1>
      <p>{content.subline}</p>
    </div>
  )
}
