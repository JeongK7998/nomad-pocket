import { ImageResponse } from 'next/og'

export const size = {
  width: 512,
  height: 512,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(180deg, #0a62c7 0%, #004ea7 100%)',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 28,
            borderRadius: 120,
            border: '10px solid rgba(255,255,255,0.16)',
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
            color: 'white',
          }}
        >
          <div
            style={{
              fontSize: 168,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: '-0.08em',
            }}
          >
            NP
          </div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: '0.24em',
              opacity: 0.92,
              marginLeft: '0.24em',
            }}
          >
            FINANCIAL PRECISION
          </div>
        </div>
      </div>
    ),
    size
  )
}
