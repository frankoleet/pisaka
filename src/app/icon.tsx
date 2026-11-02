import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #4CAEFB 0%, #2683E0 100%)',
          borderRadius: 6,
        }}
      >
        <div
          style={{
            width: 22,
            height: 20,
            background: 'white',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            padding: '3px 2px',
            gap: 2,
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', width: '70%', height: 1.5, background: '#3196EF', borderRadius: 1, opacity: 0.7 }} />
          <div style={{ display: 'flex', width: '90%', height: 1.5, background: '#3196EF', borderRadius: 1, opacity: 0.6 }} />
          <div style={{ display: 'flex', width: '65%', height: 1.5, background: '#3196EF', borderRadius: 1, opacity: 0.5 }} />
          <div style={{ display: 'flex', width: '85%', height: 1.5, background: '#3196EF', borderRadius: 1, opacity: 0.4 }} />
          
          <div
            style={{
              position: 'absolute',
              bottom: 1,
              right: 1,
              width: 7,
              height: 7,
              background: '#2683E0',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 1,
                height: 5,
                background: 'white',
                borderRadius: 1,
                transform: 'rotate(45deg)',
              }}
            />
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
