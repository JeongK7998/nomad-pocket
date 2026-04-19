import { ImageResponse } from 'next/og'

export const size = {
  width: 180,
  height: 180,
}

export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: '#004ea7',
          borderRadius: 42,
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'sans-serif',
          fontSize: 74,
          fontWeight: 800,
          letterSpacing: '-0.08em',
        }}
      >
        NP
      </div>
    ),
    size
  )
}
