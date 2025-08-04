import React from 'react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="container">
      <img src="/images/logo.png" alt="Logo" className="logo" width={100} height={100}/>
      <h1>Selamat Datang</h1>
      <h2>Presensi Kehadiran Wisuda</h2>
      <p>Silakan scan QR Code untuk mencatat kehadiran Anda.</p>

      <div>
        <Link href="/scan">
          <button className="link-button">➡️ Menuju Halaman Scan</button>
        </Link>
        <Link href="/input">
          <button className="link-button">➡️ Input Data Mahasiswa/Tamu</button>
        </Link>
        <Link href="/hair">
          <button className="link-button">➡️ Data Mahasiswa/Tamu yang Hadir</button>
        </Link>
        <Link href="/grafik">
          <button className="link-button">➡️ Grafik Mahasiswa/Tamu yang Hadir</button>
        </Link>
      </div>
    </div>
  )
}
