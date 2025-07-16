import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon({ searchParams }: { searchParams: { size?: string; maskable?: string } }) {
  const iconSize = searchParams.size ? parseInt(searchParams.size) : 32
  const isMaskable = searchParams.maskable === 'true'
  
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: Math.floor(iconSize * 0.6),
          background: isMaskable ? '#0a192f' : 'linear-gradient(135deg, #0a192f 0%, #172a45 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64ffda',
          fontWeight: 'bold',
          borderRadius: isMaskable ? '20%' : '15%',
          padding: isMaskable ? '20%' : '10%',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(90deg, #64ffda 0%, #00d4ff 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 'bold',
          }}
        >
          R
        </div>
      </div>
    ),
    {
      width: iconSize,
      height: iconSize,
    }
  )
}