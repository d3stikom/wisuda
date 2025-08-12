import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import BackButton from '../components/BackButton'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import dayjs from 'dayjs'


export default function DaftarHadir() {
  const [scanLog, setScanLog] = useState([])
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  // Search states
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all') // all, mahasiswa, tamu

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

  // Filter and search functions
  const getFilteredData = () => {
    let filtered = scanLog
    
    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.jenis === filterType)
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.nama.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return filtered
  }

  // Pagination functions
  const getPaginatedData = () => {
    const filteredData = getFilteredData()
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredData.slice(startIndex, endIndex)
  }

  const getTotalPages = () => {
    const filteredData = getFilteredData()
    return Math.ceil(filteredData.length / itemsPerPage)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const renderPagination = () => {
    const totalPages = getTotalPages()
    if (totalPages <= 1) return null
    
    const pages = []
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      )
    }
    
    return (
      <div className="pagination">
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          ← Prev
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="pagination-btn"
        >
          Next →
        </button>
      </div>
    )
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
    const dataToExport = getFilteredData() // Export filtered data
    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Daftar Scan')
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(blob, `Daftar_Scan_Log.xlsx`)
  }

  // Reset pagination when search or filter changes
  const handleSearchChange = (value) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleFilterChange = (value) => {
    setFilterType(value)
    setCurrentPage(1)
  }

  return (
      <div className="container">
        <h1>📋 Daftar Scan Kehadiran</h1>

        <div className="controls">
          <button className="export-btn" onClick={exportToExcel}>
            📥 Export Scan Log
          </button>
          
          {/* Search and Filter Controls */}
          <div className="search-filter-container">
            <input
              type="text"
              placeholder="🔍 Cari berdasarkan nama..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="search-input"
            />
            
            <select
              value={filterType}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="filter-select"
            >
              <option value="all">Semua Tipe</option>
              <option value="mahasiswa">Mahasiswa</option>
              <option value="tamu">Tamu</option>
            </select>
          </div>
        </div>

        <div className="data-info">
          <p>Menampilkan {getPaginatedData().length} dari {getFilteredData().length} data kehadiran</p>
        </div>

        {getFilteredData().length === 0 ? (
          <p>Tidak ada data kehadiran yang sesuai dengan pencarian.</p>
        ) : (
          <>
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
              {getPaginatedData().map((item, index) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + index + 1
                return (
                  <tr key={item.id}>
                    <td>{globalIndex}</td>
                    <td>{item.nama}</td>
                    <td>{item.jenis}</td>
                    <td>{item.status ? 'Hadir' : 'Tidak Hadir'}</td>
                    <td>{item.waktu_scan ? dayjs(item.waktu_scan).format('YYYY-MM-DD HH:mm:ss') : '?'}</td>
                    <td>
                      <button className="delete-btn" onClick={() => handleDelete(item.id)}>
                        🗑️ Hapus
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          
          {/* Pagination Controls */}
          {renderPagination()}
        </>
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

        .controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .search-filter-container {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .search-input {
          padding: 8px 12px;
          border: 2px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          width: 250px;
        }

        .search-input:focus {
          outline: none;
          border-color: #0070f3;
        }

        .filter-select {
          padding: 8px 12px;
          border: 2px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          background: white;
          cursor: pointer;
        }

        .filter-select:focus {
          outline: none;
          border-color: #0070f3;
        }

        .data-info {
          margin-bottom: 15px;
          color: #666;
          font-size: 14px;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-top: 20px;
        }

        .pagination-btn {
          padding: 8px 12px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .pagination-btn:hover:not(:disabled) {
          background: #f0f0f0;
          border-color: #0070f3;
        }

        .pagination-btn.active {
          background: #0070f3;
          color: white;
          border-color: #0070f3;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .controls {
            flex-direction: column;
            align-items: stretch;
          }

          .search-filter-container {
            flex-direction: column;
          }

          .search-input {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
