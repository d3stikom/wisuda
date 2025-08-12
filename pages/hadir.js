import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import BackButton from '../components/BackButton'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import dayjs from 'dayjs'


export default function DaftarHadir() {
  const [scanLog, setScanLog] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data, error } = await supabase
      .from('scan_log')
      .select('*')
      .order('waktu_scan', { ascending: false })

    if (error) {
      console.error('Gagal memuat data:', error)
    } else {
      setScanLog(data || [])
    }
  }

  const handleDelete = async (id) => {
    const { error } = await supabase.from('scan_log').delete().eq('id', id)
    if (error) {
      alert('❌ Gagal menghapus data')
      console.error(error)
    } else {
      alert('✅ Data berhasil dihapus')
      fetchData()
    }
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(scanLog)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Daftar Scan')
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(blob, `Daftar_Scan_Log.xlsx`)
  }

  return (
    <div className="container">
      <h1>📋 Daftar Scan Kehadiran</h1>

      <button className="export-btn" onClick={exportToExcel}>
        📥 Export Scan Log
      </button>

      {scanLog.length === 0 ? (
        <p>Tidak ada data kehadiran yang tercatat.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>Tipe</th>
              <th>Keterangan</th>
              <th>Waktu</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {scanLog.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.nama}</td>
                <td>{item.jenis}</td>
                 <td>{item.status? 'Hadir':'Tidak Hadir'}</td>
               <td>{item.waktu_scan ? dayjs(item.waktu).format('YYYY-MM-DD HH:mm:ss'):'?'}</td>
                <td>
                  <button className="delete-btn" onClick={() => handleDelete(item.id)}>
                    🗑️ Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

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
