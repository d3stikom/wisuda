// components/BackButton.js
import { useRouter } from 'next/router'

export default function BackButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      style={{
        marginBottom: 20,
        backgroundColor: '#0070f3',
        color: '#fff',
        padding: '10px 16px',
        border: 'none',
        borderRadius: 6,
        cursor: 'pointer',
        fontSize: 16
      }}
    >
      ⬅️ Kembali
    </button>
  )
}
