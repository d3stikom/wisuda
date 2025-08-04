import { supabase } from '../../lib/supabaseClient'

export default async function handler(req, res) {
  const { nama, tipe, instansi } = req.body
  const { error } = await supabase.from('tamu').insert({ nama, tipe, instansi })
  if (error) return res.status(500).json({ error })
  res.status(200).json({ message: 'Sukses' })
}
