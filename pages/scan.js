import React, { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { supabase } from '../lib/supabaseClient'
import BackButton from '../components/BackButton'

export default function ScanPage() {
  const [input, setInput] = useState('')
  const [status, setStatus] = useState(null)
  const [resultData, setResultData] = useState(null)
  const [isClient, setIsClient] = useState(false)
  const scannerRef = useRef(null)

  const handleCheck = async (value) => {
    setInput(value)
    setStatus('🔄 Mengecek...')
    setResultData(null)

    const { data: mhsCek } = await supabase
      .from('mahasiswa')
      .select('*')
      .eq('nim', value)

    if (mhsCek && mhsCek.length > 0) {
      const mhs = mhsCek[0]
      const { data: cekLog } = await supabase
        .from('scan_log')
        .select('*')
        .eq('jenis', 'mahasiswa')
        .eq('id_referensi', mhs.id)

      if (cekLog.length > 0) {
        setStatus('⚠️ Mahasiswa ini sudah melakukan scan sebelumnya.')
        setTimeout(() => {
          // Me-reload halaman untuk mereset state dan memulai ulang scanner
          window.location.reload()
        }, 1000) // Jeda 1 detik
        return
      }
      

      await supabase.from('mahasiswa').update({ hadir: true }).eq('id', mhs.id)
      await supabase.from('scan_log').insert({
        jenis: 'mahasiswa',
        id_referensi: mhs.id,
        nama: mhs.nama,
      })

      setResultData({
        jenis: 'mahasiswa',
        nama: mhs.nama,
        nim: mhs.nim,
        prodi: mhs.prodi,
        hadir: true,
      })
      setStatus(`✅ Mahasiswa "${mhs.nama}" dicatat hadir. Halaman akan dimuat ulang...`)
      setTimeout(() => {
        // Me-reload halaman untuk mereset state dan memulai ulang scanner
        window.location.reload()
      }, 1000) // Jeda 1 detik
      return
    }

    const { data: tamuCek } = await supabase
      .from('tamu')
      .select('*')
      .eq('nama', value)

    if (tamuCek && tamuCek.length > 0) {
      const tamu = tamuCek[0]
      const { data: cekLog } = await supabase
        .from('scan_log')
        .select('*')
        .eq('jenis', 'tamu')
        .eq('id_referensi', tamu.id)

      if (cekLog.length > 0) {
        setStatus('⚠️ Tamu ini sudah melakukan scan sebelumnya.')
        return
      }

      await supabase.from('tamu').update({ hadir: true }).eq('id', tamu.id)
      await supabase.from('scan_log').insert({
        jenis: 'tamu',
        id_referensi: tamu.id,
        nama: tamu.nama,
      })

      setResultData({
        jenis: 'tamu',
        nama: tamu.nama,
        tipe: tamu.tipe,
        instansi: tamu.instansi,
        hadir: true,
      })
      setStatus(`✅ Tamu "${tamu.nama}" dicatat hadir. Halaman akan dimuat ulang...`)
      setTimeout(() => {
        // Me-reload halaman untuk mereset state dan memulai ulang scanner
        window.location.reload()
      }, 1000) // Jeda 1 detik
      return
    }

    setStatus('❌ Data tidak ditemukan.')
    setTimeout(() => {
        // Me-reload halaman untuk mereset state dan memulai ulang scanner
        window.location.reload()
      }, 1000) // Jeda 1 detik
      return
  }

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const scanner = new Html5Qrcode('reader')
    scannerRef.current = scanner

    Html5Qrcode.getCameras().then((devices) => {
      if (devices && devices.length) {
        const cameraId = devices[0].id
        scanner.start(
          cameraId,
          { fps: 10, qrbox: 250 },
          (decodedText) => {
            if (decodedText !== input) {
              scanner.stop().then(() => {
                handleCheck(decodedText)
              })
            }
          },
          () => {}
        )
      }
    })

    return () => {
      scannerRef.current?.stop().then(() => {
        scannerRef.current.clear()
      })
    }
  }, [isClient, input])

  return (
    <div className="scan-wrapper">
      <div className="left-box">
        <img src="/images/logo.png" alt="Logo" className="logo" />
              <h1>Selamat Datang di Wisuda</h1>
              <h4>D3 Manajemen Informatika Ke-29 dan S1 Teknik Informatika Ke-15</h4>
              <h4>STIKOM PGRI Banyuwangi</h4>   
              <h4>Tahun 2025</h4>
              <p>Silakan lakukan scan QR Code untuk mencatat kehadiran Anda.Pastikan kamera Anda mengarah ke QR Code yang sesuai.Jika tidak ada kamera, silakan masukkan NIM/Nama secara manual</p>
        <BackButton />
      </div>

      <div className="right-box">
        <h2>📷 Scan Kehadiran</h2>

        {isClient && (
          <div id="reader" className="scanner-box" />
              ) }
              <h3>🔍 Input Manual</h3>
<div style={{ marginBottom: '10px' }}>
  <label htmlFor="manualMahasiswa"><strong>Masukkan NIM Mahasiswa:</strong></label><br />
  <input
    type="text"
    id="manualMahasiswa"
    placeholder="Contoh: 1234567890"
    value={input}
    onChange={(e) => setInput(e.target.value)}
    style={{ padding: '8px', width: '100%', marginTop: '5px', marginBottom: '10px' }}
  />
  <button
    onClick={() => handleCheck(input)}
    style={{
      padding: '10px 16px',
      fontSize: '16px',
      background: '#0070f3',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      width: '100%',
    }}
  >
    🔄 Cek Manual (Mahasiswa/Nama Tamu)
  </button>
</div>


        {input && <p><strong>📄 Data Terbaca:</strong> {input}</p>}
        {status && <p><strong>🟢 Status:</strong> {status}</p>}

        {resultData && (
          <div className="result-box">
            <h3>📋 Detail Kehadiran</h3>
            {resultData.jenis === 'mahasiswa' ? (
              <>
                <p><strong>Nama:</strong> {resultData.nama}</p>
                <p><strong>NIM:</strong> {resultData.nim}</p>
                <p><strong>Prodi:</strong> {resultData.prodi}</p>
                <p><strong>Status:</strong> ✅ Hadir</p>
              </>
            ) : (
              <>
                <p><strong>Nama:</strong> {resultData.nama}</p>
                <p><strong>Tipe:</strong> {resultData.tipe}</p>
                <p><strong>Instansi:</strong> {resultData.instansi}</p>
                <p><strong>Status:</strong> ✅ Hadir</p>
              </>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .scan-wrapper {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: flex-start;
          padding: 20px;
          gap: 30px;
          font-family: Arial, sans-serif;
        }

        .left-box, .right-box {
          flex: 1;
          padding: 20px;
          box-sizing: border-box;
        }

        .left-box {
          border-right: 1px solid #ddd;
          text-align: center;
        }

        .logo {
          width: 100px;
          margin-bottom: 20px;
        }

        .scanner-box {
          width: 100%;
          max-width: 400px;
          margin-bottom: 20px;
          border: 1px solid #ccc;
          border-radius: 8px;
          overflow: hidden;
        }

        .result-box {
          margin-top: 20px;
          padding: 16px;
          background: #f4f6f8;
          border-radius: 8px;
        }

        @media (max-width: 768px) {
          .scan-wrapper {
            flex-direction: column;
            align-items: stretch;
          }

          .left-box {
            border-right: none;
            border-bottom: 1px solid #ddd;
            margin-bottom: 20px;
          }

          .scanner-box {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
