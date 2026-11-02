import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
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
          borderRadius: 40,
        }}
      >
        <div
          style={{
            width: 126,
            height: 112,
            background: 'white',
            borderRadius: 8,
            display: 'flex',
            flexDirection: 'column',
            padding: '16px 12px',
            gap: 10,
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', width: '70%', height: 4, background: '#3196EF', borderRadius: 2, opacity: 0.6 }} />
          <div style={{ display: 'flex', width: '90%', height: 4, background: '#3196EF', borderRadius: 2, opacity: 0.5 }} />
          <div style={{ display: 'flex', width: '65%', height: 4, background: '#3196EF', borderRadius: 2, opacity: 0.4 }} />
          <div style={{ display: 'flex', width: '85%', height: 4, background: '#3196EF', borderRadius: 2, opacity: 0.4 }} />
          <div style={{ display: 'flex', width: '60%', height: 4, background: '#3196EF', borderRadius: 2, opacity: 0.3 }} />
          
          <div
            style={{
              position: 'absolute',
              bottom: 20,
              right: 12,
              width: 32,
              height: 32,
              background: '#2683E0',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 4,
                height: 20,
                background: 'white',
                borderRadius: 2,
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
