# AI Feature Implementation Checklist

Dokumen ini digunakan untuk memvalidasi apakah seluruh instruksi refaktorisasi proyek e-voting OSIS & MPK telah dilakukan **secara lengkap** oleh AI. Semua poin harus diceklis sebelum dianggap selesai.

---

## 1. Struktur Proyek & Dependency

- [ ] Project dibuat ulang menggunakan **Next.js (App Router)**
- [ ] Package manager menggunakan **npm** (bukan pnpm atau yarn)
- [ ] Menggunakan **TailwindCSS**
- [ ] Menambahkan dependency modern untuk UI (misal shadcn/ui, framer-motion, lucide-react)
- [ ] Menambahkan dependency modern untuk chart/visualisasi (misal Recharts / Chart.js / Tremor)
- [ ] Menggunakan **NextAuth.js** untuk autentikasi
- [ ] Tidak ada lagi hardcode (semua data fetched dari API / prisma)
- [ ] Memastikan struktur folder rapih & konsisten

---

## 2. UI & Desain

- [ ] Seluruh UI menggunakan **color palette primary biru**
- [ ] Navigasi menggunakan **sidebar**, bukan navbar atas
- [ ] Sidebar mendukung **state collapsed/expanded**
- [ ] Layout bersifat **responsive dan dinamis** saat sidebar toggle
- [ ] UI sepenuhnya modern (komponen konsisten, radius lembut, clean spacing)
- [ ] Routing halaman admin, user, committee terpisah menggunakan App Router

---

## 3. Schema Prisma

### Harus sesuai dengan schema berikut:
```
<ISI SCHEMA.PRISMA YANG SUDAH DIPUBLISH>
```
- [ ] Schema prisma ditempatkan di `/prisma/schema.prisma`
- [ ] Relasi dicek ulang agar tidak ada bug logic atau referential error
- [ ] Migration berhasil dijalankan ke Neon Database
- [ ] Seluruh model CRUD menggunakan Prisma Client

---

## 4. Fitur Administrator

- [ ] CRUD Periode (set active / nonactive)
- [ ] CRUD Kandidat OSIS & MPK
- [ ] CRUD User via Excel Import
- [ ] CRUD Administrator baru
- [ ] Reset Password User menjadi default = username
- [ ] Validasi periode sebelum voting dimulai
- [ ] Penjadwalan pemungutan suara (tanggal mulai & selesai)
- [ ] Admin dapat mengakhiri vote secara sepihak
- [ ] Quick count dengan diagram batang & pie chart

---

## 5. Fitur User

- [ ] User hanya dapat mengakses halaman Voting
- [ ] User hanya dapat mengubah password
- [ ] Semua logika hak akses diverifikasi

---

## 6. Fitur Committee / Panitia

- [ ] Committee dapat melihat quick count real-time
- [ ] Committee dapat mendownload laporan PDF hasil pemilihan
- [ ] Committee dapat mendownload Excel untuk daftar pemilih (sudah & belum memilih)
- [ ] UI laporan rapi & tidak hardcode

---

## 7. API & Fetching

- [ ] Semua route API dibuat modular di `/app/api/...`
- [ ] Fetching menggunakan **server actions atau fetch API konsisten**
- [ ] Tidak ada fetch di client kecuali memang dibutuhkan
- [ ] Menggunakan caching yang aman & stabil

---

## 8. Keamanan

- [ ] NextAuth terpasang & aman
- [ ] Middleware proteksi role-based berhasil
- [ ] Password di-hash (bcrypt recommended)
- [ ] Query Prisma aman & tanpa raw query
- [ ] Proteksi terhadap akses data yang tidak berhak

---

## 9. Testing & Validasi

- [ ] Validasi input form menggunakan Zod atau validator modern
- [ ] Error handling API jelas & tidak silent error
- [ ] Semua halaman menghasilkan data yang benar sesuai dengan DB

---

## 10. Build & Deployment

- [ ] Build Next.js berjalan tanpa error
- [ ] Database Neon terkoneksi
- [ ] `.env` lengkap & aman
- [ ] Deployment guidelines ditulis dengan jelas

---

## 11. Status Final

- [ ] **Semua fitur dinyatakan selesai oleh AI**
- [ ] **Checklist ini akan menjadi acuan untuk maintenance berikutnya**

---

**Dokumen: ai_feature_checklist.md**
