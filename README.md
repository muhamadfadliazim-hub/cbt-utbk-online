# AZ Academy CBT 2026

Prototype Next.js 16 untuk manajemen tryout SNBT/TKA, bank soal, materi belajar, dan pemilihan jurusan berbasis data.

## Fitur utama

- Passing Grade Jurusan: 5.223 prodi dari integrasi workbook SNBP dan prediksi SNBT, pencarian, filter rumpun, simulasi skor, dan perbandingan tiga pilihan.
- Rasionalisasi SNBP 2026: rapor semester 1–5, mapel pendukung spesifik prodi, status eligible, maksimal tiga prestasi, portofolio, urutan pilihan, keketatan prodi, serta TKA 2026 sebagai validator rapor. Hasil adalah estimasi internal, bukan peluang resmi PTN.
- Katalog eksklusif: SNBT/UTBK dan simulasi TKA 2026 untuk SD/MI, SMP/MTs, serta SMA/MA/SMK. Paket TKA adalah latihan AZ Academy, bukan ujian resmi.
- CBT: pilihan ganda, PG kompleks, isian singkat, dan matriks Benar/Salah yang dapat diklik per pernyataan.
- Admin Content Hub: publikasi pengumuman, kontrol paket, dan sinkronisasi tampilan siswa lintas-tab.
- Builder paket tryout: template subtes otomatis, durasi, target soal, jadwal, draf, dan publikasi.
- Studio bank soal: editor visual serta impor massal dari teks berformat sederhana.
- Materi belajar: publikasi video, PDF, atau artikel menurut kategori ujian dan mapel.

## Menjalankan lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`. Gunakan `/admin` untuk area admin dan `/student` untuk area siswa.

## Verifikasi

```bash
npm run lint
npm run build
```

Dataset SNBT di aplikasi adalah prediksi model selektivitas v3.0, bukan passing grade resmi SNPMB atau jaminan kelulusan. Label transparansi ini ditampilkan langsung pada antarmuka siswa dan admin.
