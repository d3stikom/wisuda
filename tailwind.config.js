/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",   // folder page router
    "./components/**/*.{js,ts,jsx,tsx}", // komponen tambahan
    "./app/**/*.{js,ts,jsx,tsx}", // (optional, jika pakai App dir di masa depan)
  ],
  theme: {
    extend: {}, // kamu bisa menambahkan font, warna, spacing di sini
  },
  plugins: [],
}
