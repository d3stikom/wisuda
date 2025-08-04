import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'
import { supabase } from '../lib/supabaseClient'
import BackButton from '../components/BackButton'

export default function GrafikPage() {
  const [dataChart, setDataChart] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { count: totalMhs } = await supabase
      .from('mahasiswa')
      .select('*', { count: 'exact', head: true })

    const { count: hadirMhs } = await supabase
      .from('mahasiswa')
      .select('*', { count: 'exact', head: true })
      .eq('hadir', true)

    const { count: totalTamu } = await supabase
      .from('tamu')
      .select('*', { count: 'exact', head: true })

    const { count: hadirTamu } = await supabase
      .from('tamu')
      .select('*', { count: 'exact', head: true })
      .eq('hadir', true)

    const chartData = [
      {
        kategori: 'Mahasiswa',
        Total: totalMhs || 0,
        Hadir: hadirMhs || 0,
      },
      {
        kategori: 'Tamu',
        Total: totalTamu || 0,
        Hadir: hadirTamu || 0,
      },
    ]

    setDataChart(chartData)
  }

  return (
    <div className="grafik-container">
      <h1>📊 Statistik Kehadiran</h1>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={dataChart} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="kategori" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="Total" fill="#8884d8" name="Total Terdaftar" />
          <Bar dataKey="Hadir" fill="#82ca9d" name="Sudah Hadir" />
        </BarChart>
      </ResponsiveContainer>

      <BackButton />

      <style jsx>{`
        .grafik-container {
          max-width: 900px;
          margin: 40px auto;
          padding: 20px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
          font-family: Arial, sans-serif;
        }

        h1 {
          text-align: center;
          margin-bottom: 24px;
        }
      `}</style>
    </div>
  )
}
