import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import BackButton from '../components/BackButton'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export default function DaftarHadir() {
  const [mahasiswa, setMahasiswa] = useState([])
  const [tamu, setTamu] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: mhs } = await supabase
      .from('mahasiswa')
      .select('*')
      .eq('hadir', true)
      .order('nama', { ascending: true })

    const { data: tms } = await supabase
      .from('tamu')
      .select('*')
      .eq('hadir', true)
      .order('nama', { ascending: true })

    setMahasiswa(mhs || [])
    setTamu(tms || [])
  }

  const handleDelete = async (id, type) => {
    const table = type === 'mahasiswa' ? 'mahasiswa' : 'tamu'
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) {
      alert('❌ Gagal menghapus data')
      console.error(error)
    } else {
      alert('✅ Data berhasil dihapus')
      fetchData()
    }
  }

  const exportToExcel = (data, fileName) => {
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Daftar')
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(blob, `${fileName}.xlsx`)
  }

  return (
    <div className="container">
      <h1>📋 Daftar Kehadiran</h1>

      <section>
        <h2>🎓 Mahasiswa</h2>
        <button className="export-btn" onClick={() => exportToExcel(mahasiswa, 'Daftar_Hadir_Mahasiswa')}>
          📥 Export Mahasiswa
        </button>
        {mahasiswa.length === 0 ? (
          <p>Belum ada mahasiswa yang hadir.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th>NIM</th>
                <th>Prodi</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {mahasiswa.map((mhs, index) => (
                <tr key={mhs.id}>
                  <td>{index + 1}</td>
                  <td>{mhs.nama}</td>
                  <td>{mhs.nim}</td>
                  <td>{mhs.prodi}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(mhs.id, 'mahasiswa')}
                    >
                      🗑️ Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2>👤 Tamu</h2>
        <button className="export-btn" onClick={() => exportToExcel(tamu, 'Daftar_Hadir_Tamu')}>
          📥 Export Tamu
        </button>
        {tamu.length === 0 ? (
          <p>Belum ada tamu yang hadir.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th>Tipe</th>
                <th>Instansi</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {tamu.map((tm, index) => (
                <tr key={tm.id}>
                  <td>{index + 1}</td>
                  <td>{tm.nama}</td>
                  <td>{tm.tipe}</td>
                  <td>{tm.instansi}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(tm.id, 'tamu')}
                    >
                      🗑️ Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <BackButton />

      <style jsx>{`
        .container {
          max-width: 900px;
          margin: 40px auto;
          padding: 24px;
          font-family: Arial, sans-serif;
          background: #f9f9f9;
          border-radius: 10px;
          box-shadow: 0 0 12px rgba(0,0,0,0.1);
        }

        h1 {
          text-align: center;
          margin-bottom: 32px;
        }

        section {
          margin-bottom: 40px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 16px;
        }

        th, td {
          padding: 12px;
          border: 1px solid #ddd;
          text-align: left;
        }

        th {
          background-color: #f0f0f0;
        }

        tr:nth-child(even) {
          background-color: #fdfdfd;
        }

        tr:hover {
          background-color: #f1f1f1;
        }

        .export-btn {
          background: #0070f3;
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          margin-bottom: 10px;
        }

        .export-btn:hover {
          background: #005bb5;
        }

        .delete-btn {
          background: #dc3545;
          color: white;
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .delete-btn:hover {
          background: #c82333;
        }
      `}</style>
    </div>
  )
}
