import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'MyRoofGenius OG Image'

export async function GET() {
  const svg = (
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" />
          <stop offset="100%" stopColor="color-mix(in srgb,var(--color-primary) 80%, white)" />{/* replaced hex with primary token */}
        </linearGradient>
      </defs>
      <rect width="1200" height="630" rx="40" fill="url(#g)" />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="72"
        fontFamily="sans-serif"
        fontWeight="bold"
        fill="white"
      >
        MyRoofGenius
      </text>
    </svg>
  )

  return new ImageResponse(svg, {
    width: 1200,
    height: 630
  })
}
