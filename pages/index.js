import React from 'react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="container">
      <img src="/images/logo.png" alt="Logo" className="logo" width={100} height={100} />
      <h1>Selamat Datang</h1>
      <h2>Presensi Kehadiran Wisuda</h2>
      <p>Silakan scan QR Code untuk mencatat kehadiran Anda.</p>

      <div className="button-container">
        <Link href="/scan">
          <button className="link-button">➡️ Menuju Halaman Scan</button>
        </Link>
        <Link href="/input">
          <button className="link-button">➡️ Input Data Mahasiswa/Tamu</button>
        </Link>
        <Link href="/hadir">
          <button className="link-button">➡️ Data Mahasiswa/Tamu yang Hadir</button>
        </Link>
        <Link href="/grafik">
          <button className="link-button">➡️ Grafik Mahasiswa/Tamu yang Hadir</button>
        </Link>
      </div>

      <style jsx>{`
        .container {
          max-width: 600px;
          margin: 40px auto;
          padding: 20px;
          text-align: center;
          font-family: Arial, sans-serif;
        }

        .logo {
          margin-bottom: 20px;
        }

        .button-container {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-top: 30px;
        }

        .link-button {
          width: 80%;
          padding: 15px;
          font-size: 16px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .link-button:hover {
          background-color: #005bb5;
        }
      `}</style>
    </div>
  )
}
