import { supabase } from '../../lib/supabaseClient'

export default async function handler(req, res) {
  const { nama, nim, prodi } = req.body
  const { error } = await supabase.from('mahasiswa').insert({ nama, nim, prodi })
  if (error) return res.status(500).json({ error })
  res.status(200).json({ message: 'Sukses' })
}
