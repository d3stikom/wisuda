import { useState } from 'react'
import BackButton from '../components/BackButton'


export default function InputPage() {
  const [tab, setTab] = useState('mahasiswa')
  const [formData, setFormData] = useState({
    nama: '',
    nim: '',
    prodi: '',
    tipe: '',
    instansi: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (tab === 'mahasiswa') {
      const { nama, nim, prodi } = formData
      const res = await fetch('/api/input-mahasiswa', {
        method: 'POST',
        body: JSON.stringify({ nama, nim, prodi }),
        headers: { 'Content-Type': 'application/json' }
      })
      alert(res.ok ? 'Mahasiswa ditambahkan' : 'Gagal menambahkan')
    } else {
      const { nama, tipe, instansi } = formData
      const res = await fetch('/api/input-tamu', {
        method: 'POST',
        body: JSON.stringify({ nama, tipe, instansi }),
        headers: { 'Content-Type': 'application/json' }
      })
      alert(res.ok ? 'Tamu ditambahkan' : 'Gagal menambahkan')
    }

    setFormData({
      nama: '',
      nim: '',
      prodi: '',
      tipe: '',
      instansi: ''
    })
  }

  return (
      <div className="input-container">
        <img src="/images/logo.png" alt="Logo" className="logo" width={100} height={100}/>
      <h2>📋 Form Input Kehadiran</h2>

      <div className="tabs">
        <button
          className={tab === 'mahasiswa' ? 'active' : ''}
          onClick={() => setTab('mahasiswa')}
        >
          Mahasiswa
        </button>
        <button
          className={tab === 'tamu' ? 'active' : ''}
          onClick={() => setTab('tamu')}
        >
          Tamu
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form-box">
        <label>Nama:</label>
        <input
          name="nama"
          value={formData.nama}
          onChange={handleChange}
          required
        />

        {tab === 'mahasiswa' && (
          <>
            <label>NIM:</label>
            <input
              name="nim"
              value={formData.nim}
              onChange={handleChange}
              required
            />
            <label>Program Studi:</label>
<select
  name="prodi"
  value={formData.prodi}
  onChange={handleChange}
  required
  style={{ padding: '8px', marginBottom: '12px', width: '100%' }}
>
  <option value="">-- Pilih Program Studi --</option>
  <option value="S1 Teknik Informatika">S1 Teknik Informatika</option>
  <option value="D3 Manajemen Informatika">D3 Manajemen Informatika</option>
</select>

          </>
        )}

        {tab === 'tamu' && (
          <>
            <label>Tipe:</label>
<select
  name="tipe"
  value={formData.tipe}
  onChange={handleChange}
  required
  style={{ padding: '8px', marginBottom: '12px', width: '100%' }}
>
  <option value="">-- Pilih Tipe Tamu --</option>
  <option value="VIP">VIP</option>
  <option value="VVIP">VVIP</option>
  <option value="Orang Tua">Orang Tua</option>
</select>

            <label>Instansi:</label>
            <input
              name="instansi"
              value={formData.instansi}
              onChange={handleChange}
              required
            />
          </>
        )}

              <button type="submit">💾 Simpan</button><br></br>
              <BackButton/>
      </form>

      <style jsx>{`
        .input-container {
  max-width: 500px;
  margin: 40px auto;
  padding: 24px;
  border: 1px solid #ccc;
  border-radius: 12px;
  background: #fff;
  font-family: Arial;

  /* Tambahkan bayangan */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}


        h2 {
          text-align: center;
        }

        .logo {
            display: block;
            margin: 0 auto 20px;
            align-items: center;
        }
        .tabs {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }

        .tabs button {
          padding: 10px 20px;
          margin: 0 5px;
          border: none;
          border-bottom: 2px solid transparent;
          background: none;
          cursor: pointer;
          font-size: 16px;
        }

        .tabs .active {
          border-bottom: 2px solid #0070f3;
          font-weight: bold;
        }

        .form-box {
          display: flex;
          flex-direction: column;
        }

        .form-box label {
          margin-top: 10px;
          font-weight: bold;
        }

        .form-box input {
          padding: 8px;
          border-radius: 6px;
          border: 1px solid #ccc;
          margin-top: 4px;
        }

        .form-box button {
          margin-top: 20px;
          padding: 12px;
          background-color: #0070f3;
          color: white;
          font-size: 16px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }

        .form-box button:hover {
          background-color: #005bb5;
        }
      `}</style>
    </div>
  )
}
