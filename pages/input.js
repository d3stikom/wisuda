import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import BackButton from '../components/BackButton'
import * as XLSX from 'xlsx'
import QRCode from 'qrcode'

export default function InputPage() {
  const [tab, setTab] = useState('mahasiswa')
  const [formData, setFormData] = useState({
    nama: '',
    nim: '',
    prodi: '',
    tipe: '',
    instansi: ''
  })

  const [editingId, setEditingId] = useState(null)
  const [dataMahasiswa, setDataMahasiswa] = useState([])
  const [dataTamu, setDataTamu] = useState([])
  const [qrCodes, setQrCodes] = useState({})
  
  // Pagination states
  const [currentPageMahasiswa, setCurrentPageMahasiswa] = useState(1)
  const [currentPageTamu, setCurrentPageTamu] = useState(1)
  const itemsPerPage = 5
  
  // Search states
  const [searchMahasiswa, setSearchMahasiswa] = useState('')
  const [searchTamu, setSearchTamu] = useState('')

  const fetchData = async () => {
    const { data: mahasiswa } = await supabase
      .from('mahasiswa')
      .select('*')
      .order('created_at', { ascending: false })
    setDataMahasiswa(mahasiswa || [])

    const { data: tamu } = await supabase
      .from('tamu')
      .select('*')
      .order('created_at', { ascending: false })
    setDataTamu(tamu || [])
  }

  const generateQRCode = async (data, id) => {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(data)
      setQrCodes(prev => ({ ...prev, [id]: qrCodeDataURL }))
      return qrCodeDataURL
    } catch (error) {
      console.error('Error generating QR code:', error)
      return null
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    // Generate QR codes automatically for mahasiswa
    dataMahasiswa.forEach(async (mhs) => {
      if (!qrCodes[`mhs-${mhs.id}`]) {
        await generateQRCode(mhs.nim, `mhs-${mhs.id}`)
      }
    })

    // Generate QR codes automatically for tamu
    dataTamu.forEach(async (tamu) => {
      if (!qrCodes[`tamu-${tamu.id}`]) {
        await generateQRCode(tamu.nama, `tamu-${tamu.id}`)
      }
    })
  }, [dataMahasiswa, dataTamu, qrCodes])

  // Search and filter functions
  const getFilteredData = (data, searchTerm, type) => {
    if (!searchTerm) return data
    
    return data.filter(item => {
      if (type === 'mahasiswa') {
        return (
          item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.prodi.toLowerCase().includes(searchTerm.toLowerCase())
        )
      } else {
        return (
          item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.tipe.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.instansi.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
    })
  }

  // Pagination functions
  const getPaginatedData = (data, currentPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return data.slice(startIndex, endIndex)
  }

  const getTotalPages = (data) => {
    return Math.ceil(data.length / itemsPerPage)
  }

  const handlePageChange = (page, type) => {
    if (type === 'mahasiswa') {
      setCurrentPageMahasiswa(page)
    } else {
      setCurrentPageTamu(page)
    }
  }

  const renderPagination = (totalPages, currentPage, type) => {
    const pages = []
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i, type)}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      )
    }
    return (
      <div className="pagination">
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1), type)}
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          ← Prev
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1), type)}
          disabled={currentPage === totalPages}
          className="pagination-btn"
        >
          Next →
        </button>
      </div>
    )
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (tab === 'mahasiswa') {
      const { nama, nim, prodi } = formData
      if (editingId) {
        await supabase
          .from('mahasiswa')
          .update({ nama, nim, prodi })
          .eq('id', editingId)
        alert('Mahasiswa diperbarui!')
      } else {
        await supabase
          .from('mahasiswa')
          .insert([{ nama, nim, prodi }])
        alert('Mahasiswa ditambahkan!')
      }
    } else {
      const { nama, tipe, instansi } = formData
      if (editingId) {
        await supabase
          .from('tamu')
          .update({ nama, tipe, instansi })
          .eq('id', editingId)
        alert('Tamu diperbarui!')
      } else {
        await supabase
          .from('tamu')
          .insert([{ nama, tipe, instansi }])
        alert('Tamu ditambahkan!')
      }
    }

    setFormData({
      nama: '',
      nim: '',
      prodi: '',
      tipe: '',
      instansi: ''
    })
    setEditingId(null)
    await fetchData()
  }

  const handleEdit = (item) => {
    setEditingId(item.id)
    setTab(item.prodi !== undefined ? 'mahasiswa' : 'tamu')
    setFormData({
      nama: item.nama || '',
      nim: item.nim || '',
      prodi: item.prodi || '',
      tipe: item.tipe || '',
      instansi: item.instansi || ''
    })
  }

  const handleDelete = async (id, type) => {
    const table = type === 'mahasiswa' ? 'mahasiswa' : 'tamu'
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) {
      alert('Gagal menghapus')
    } else {
      alert('Data dihapus')
      await fetchData()
    }
  }

  const handleXLSXImport = async (e, type) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (evt) => {
      const data = evt.target.result
      const workbook = XLSX.read(data, { type: 'binary' })

      if (type === 'mahasiswa') {
        const sheet = workbook.Sheets['mahasiswa']
        if (!sheet) return alert('Sheet "mahasiswa" tidak ditemukan!')
        const parsed = XLSX.utils.sheet_to_json(sheet)
        const valid = parsed.filter(m => m.nama && m.nim && m.prodi)
        if (valid.length > 0) {
          const { error } = await supabase.from('mahasiswa').insert(valid)
          if (error) {
            alert('❌ Gagal mengimpor data mahasiswa.')
            console.error(error)
          } else {
            alert('✅ Data mahasiswa berhasil diimpor!')
          }
        }
      }

      if (type === 'tamu') {
        const sheet = workbook.Sheets['tamu']
        if (!sheet) return alert('Sheet "tamu" tidak ditemukan!')
        const parsed = XLSX.utils.sheet_to_json(sheet)
        const valid = parsed.filter(t => t.nama && t.tipe && t.instansi)
        if (valid.length > 0) {
          const { error } = await supabase.from('tamu').insert(valid)
          if (error) {
            alert('❌ Gagal mengimpor data tamu.')
            console.error(error)
          } else {
            alert('✅ Data tamu berhasil diimpor!')
          }
        }
      }

      await fetchData()
      e.target.value = null
    }

    reader.readAsBinaryString(file)
  }

  return (
    <div className="input-container">
      <img src="/images/logo.png" alt="Logo" className="logo" width={100} height={100} />
      <h2>📋 Form Input Kehadiran</h2>

      <div className="tabs">
        <button className={tab === 'mahasiswa' ? 'active' : ''} onClick={() => { setTab('mahasiswa'); setEditingId(null) }}>Mahasiswa</button>
        <button className={tab === 'tamu' ? 'active' : ''} onClick={() => { setTab('tamu'); setEditingId(null) }}>Tamu</button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <label className="import-label">
          📂 Import Data Mahasiswa
          <input type="file" accept=".xlsx" onChange={(e) => handleXLSXImport(e, 'mahasiswa')} hidden />
        </label>
        <label className="import-label" style={{ backgroundColor: '#17a2b8' }}>
          📂 Import Data Tamu
          <input type="file" accept=".xlsx" onChange={(e) => handleXLSXImport(e, 'tamu')} hidden />
        </label>
      </div>

      <form onSubmit={handleSubmit} className="form-box">
        <label>Nama:</label>
        <input name="nama" value={formData.nama} onChange={handleChange} required />

        {tab === 'mahasiswa' && (
          <>
            <label>NIM:</label>
            <input name="nim" value={formData.nim} onChange={handleChange} required />
            <label>Program Studi:</label>
            <select name="prodi" value={formData.prodi} onChange={handleChange} required>
              <option value="">-- Pilih Program Studi --</option>
              <option value="S1 Teknik Informatika">S1 Teknik Informatika</option>
              <option value="D3 Manajemen Informatika">D3 Manajemen Informatika</option>
            </select>
          </>
        )}

        {tab === 'tamu' && (
          <>
            <label>Tipe:</label>
            <select name="tipe" value={formData.tipe} onChange={handleChange} required>
              <option value="">-- Pilih Tipe Tamu --</option>
              <option value="VIP">VIP</option>
              <option value="VVIP">VVIP</option>
              <option value="Orang Tua">Orang Tua</option>
            </select>

            <label>Instansi:</label>
            <input name="instansi" value={formData.instansi} onChange={handleChange} required />
          </>
        )}

        <button type="submit">{editingId ? '✏️ Update' : '💾 Simpan'}</button><br />
        <BackButton />
      </form>

      <h3 style={{ marginTop: '40px' }}>📄 Daftar Mahasiswa</h3>
      
      {/* Search input for mahasiswa */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="🔍 Cari mahasiswa (nama, NIM, atau prodi)..."
          value={searchMahasiswa}
          onChange={(e) => {
            setSearchMahasiswa(e.target.value)
            setCurrentPageMahasiswa(1) // Reset to first page when searching
          }}
          style={{
            width: '100%',
            padding: '10px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            fontSize: '16px'
          }}
        />
      </div>
      
      <p>Total: {getFilteredData(dataMahasiswa, searchMahasiswa, 'mahasiswa').length} mahasiswa</p>
      <table className="data-table">
        <thead>
          <tr>
            <th>Nama</th>
            <th>NIM</th>
            <th>Prodi</th>
            <th>QR Code</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {getPaginatedData(getFilteredData(dataMahasiswa, searchMahasiswa, 'mahasiswa'), currentPageMahasiswa).map((mhs) => (
            <tr key={mhs.id}>
              <td>{mhs.nama}</td>
              <td>{mhs.nim}</td>
              <td>{mhs.prodi}</td>
              <td>
                {qrCodes[`mhs-${mhs.id}`] ? (
                  <img src={qrCodes[`mhs-${mhs.id}`]} alt="QR Code" style={{ width: '80px', height: '80px' }} />
                ) : (
                  'Loading...'
                )}
              </td>
              <td>
                <button onClick={() => handleEdit(mhs)}>Edit</button>
                <button onClick={() => handleDelete(mhs.id, 'mahasiswa')}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {getTotalPages(getFilteredData(dataMahasiswa, searchMahasiswa, 'mahasiswa')) > 1 && renderPagination(getTotalPages(getFilteredData(dataMahasiswa, searchMahasiswa, 'mahasiswa')), currentPageMahasiswa, 'mahasiswa')}

      <h3 style={{ marginTop: '40px' }}>📄 Daftar Tamu</h3>
      
      {/* Search input for tamu */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="🔍 Cari tamu (nama, tipe, atau instansi)..."
          value={searchTamu}
          onChange={(e) => {
            setSearchTamu(e.target.value)
            setCurrentPageTamu(1) // Reset to first page when searching
          }}
          style={{
            width: '100%',
            padding: '10px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            fontSize: '16px'
          }}
        />
      </div>
      
      <p>Total: {getFilteredData(dataTamu, searchTamu, 'tamu').length} tamu</p>
      <table className="data-table">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Tipe</th>
            <th>Instansi</th>
            <th>QR Code</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {getPaginatedData(getFilteredData(dataTamu, searchTamu, 'tamu'), currentPageTamu).map((tamu) => (
            <tr key={tamu.id}>
              <td>{tamu.nama}</td>
              <td>{tamu.tipe}</td>
              <td>{tamu.instansi}</td>
              <td>
                {qrCodes[`tamu-${tamu.id}`] ? (
                  <img src={qrCodes[`tamu-${tamu.id}`]} alt="QR Code" style={{ width: '80px', height: '80px' }} />
                ) : (
                  'Loading...'
                )}
              </td>
              <td>
                <button onClick={() => handleEdit(tamu)}>Edit</button>
                <button onClick={() => handleDelete(tamu.id, 'tamu')}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {getTotalPages(getFilteredData(dataTamu, searchTamu, 'tamu')) > 1 && renderPagination(getTotalPages(getFilteredData(dataTamu, searchTamu, 'tamu')), currentPageTamu, 'tamu')}


      <style jsx>{`
        .input-container {
          max-width: 700px;
          margin: 40px auto;
          padding: 24px;
          border: 1px solid #ccc;
          border-radius: 12px;
          background: #fff;
          font-family: Arial;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        h2, h3 {
          text-align: center;
        }

        .logo {
          display: block;
          margin: 0 auto 20px;
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

        .form-box input,
        .form-box select {
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

        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 16px;
        }

        .data-table th,
        .data-table td {
          border: 1px solid #ccc;
          padding: 8px;
          text-align: left;
        }

        .data-table th {
          background-color: #f5f5f5;
        }

        .data-table tr:nth-child(even) {
          background-color: #fafafa;
        }

        .data-table button {
          margin-right: 6px;
          padding: 6px 10px;
          font-size: 14px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .data-table button:hover {
          background-color: #ddd;
        }

        .import-label {
          display: inline-block;
          padding: 10px 20px;
          margin: 5px;
          background-color: #28a745;
          color: white;
          border-radius: 6px;
          cursor: pointer;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 20px 0;
          gap: 5px;
        }

        .pagination-btn {
          padding: 8px 12px;
          border: 1px solid #ddd;
          background-color: #f8f9fa;
          color: #333;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .pagination-btn:hover:not(:disabled) {
          background-color: #007bff;
          color: white;
          border-color: #007bff;
        }

        .pagination-btn.active {
          background-color: #007bff;
          color: white;
          border-color: #007bff;
        }

        .pagination-btn:disabled {
          background-color: #e9ecef;
          color: #6c757d;
          cursor: not-allowed;
          border-color: #dee2e6;
        }
      `}</style>
    </div>
  )
}
