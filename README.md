# MathMatch — Matchmatch Battle (Vite + React + TypeScript)

Game matematika 2-pemain yang seru dan cepat. Pemain berlomba menjawab soal aritmatika untuk melakukan aksi: menyerang, menyembuhkan, atau memasang perisai. Menangkan duel dengan menjatuhkan HP lawan ke 0 terlebih dahulu!

Demo Game: https://mathmatch-game.vercel.app/

## Fitur Utama
- **2 Pemain, 1 Layar**: Dua kartu pemain dengan avatar, HP bar, dan combo indikator.
- **Tiga Jenis Aksi**: `Attack (⚔️)`, `Heal (💚)`, `Shield (🛡️)` ditentukan secara acak per soal.
- **Timer Cepat**: Setiap soal memiliki waktu 6 detik. Lambat berarti kesempatan hilang.
- **Combo & Speed Bonus**: Jawaban beruntun benar memberi combo bonus; jawaban sangat cepat memberi speed bonus.
- **Animasi Halus**: Efek shake saat diserang, glow saat heal, transisi pertanyaan dengan Framer Motion dan Anime.js.
- **Mode Gelap/Terang**: Toggle di pojok kanan atas.

## Demo Singkat Cara Bermain
- **HP awal**: 100 untuk masing-masing pemain.
- **Attack**: Mengurangi HP lawan sesuai nilai soal + bonus (combo/speed). Jika lawan sedang `Shield`, damage berkurang 10 dan `Shield` habis.
- **Heal**: Memulihkan HP sendiri (maksimal kembali ke 100). Dapat bonus dari combo.
- **Shield**: Mengaktifkan perisai untuk 1 kali serangan berikutnya dan sedikit memulihkan HP.
- **Combo**: Setiap jawaban benar berturut-turut menambah combo. Mulai dari combo ≥ 3, efek bonus meningkat dan ditandai "🔥 Combo xN".
- **Speed Bonus**: Menjawab sangat cepat (nyaris segera) memberi tambahan poin aksi.
- **Kemenangan**: Ketika HP salah satu pemain mencapai 0, overlay hasil akan muncul dan bisa mulai lagi.

## Teknologi
- Build tool: **Vite**
- Framework: **React 18** dengan **TypeScript**
- Styling: **Tailwind CSS** (+ shadcn/ui komponen)
- Animasi: **Framer Motion**, **Anime.js**
- Routing: **react-router-dom**
- State & data: **@tanstack/react-query** (QueryClient disiapkan secara global)
- Testing: **Vitest**, **@testing-library/react**, dan opsional **Playwright** untuk E2E

## Persyaratan
- Node.js 18+ (disarankan LTS terbaru)
- Paket manajer: npm (atau bisa Bun, terlihat dari [bun.lock](cci:7://file:///Users/macbook/Desktop/workspace/research-products/mathmatch/bun.lock:0:0-0:0), namun instruksi di bawah menggunakan npm)

## Instalasi
```bash
npm install