# 📦 Cara Input Akun dari WhatsApp

## Perintah Cepat

### Tambah 1 Akun

```
/addstock <product-id> <email:password>
```

**Contoh:**

```
/addstock netflix premium@netflix.com:Pass123!
/addstock spotify music@domain.com:Spotify456!
```

---

### Tambah Banyak Akun Sekaligus

```
/addstock-bulk <product-id>
```

**Contoh:**

```
/addstock-bulk netflix
```

Lalu kirim akun (satu per baris):

```
premium1@netflix.com:Pass123!
premium2@netflix.com:Secret456!
premium3@netflix.com:Secure789!
```

Kirim `done` kalau sudah selesai.

---

### Cek Stok

```
/stockreport
```

Akan muncul:

```
📊 LAPORAN STOK

🟢 netflix: 20
🟡 spotify: 4
🔴 youtube-premium: 0

📦 Total stok: 24
```

---

### Laporan Penjualan

```
/salesreport          # 7 hari terakhir
/salesreport 30       # 30 hari terakhir
```

Akan muncul:

```
📊 SALES REPORT
Last 7 days

💰 Total penjualan: 23

Breakdown per produk:
📦 netflix: 12
📦 spotify: 6
📦 chatgpt-plus: 5
```

---

## Format yang Diterima

### ✅ Format Benar

```
email@domain.com:Password123!
email@domain.com|Password123!
email@domain.com,Password123!
```

### ❌ Format Salah

```
email password              # Tidak ada pemisah
email:                      # Tidak ada password
:password                   # Tidak ada email
```

---

## Cara Kerja Sistem

1. **Anda input akun** → Tersimpan di server
2. **Customer checkout** → Sistem ambil akun pertama (FIFO)
3. **Akun terkirim ke customer** → Akun otomatis terhapus dari stok
4. **Akun dipindah ke pembukuan** → Tercatat di sales ledger

**FIFO = First In First Out**  
Artinya: Akun yang pertama diinput, akan dijual pertama kali.

---

## Keuntungan

### Sebelum (Manual)

- ❌ Harus SSH ke server
- ❌ Edit file dengan nano/vim
- ❌ Ribet kalau dari HP
- ❌ Tidak ada audit trail
- ❌ Rawan typo

### Sesudah (WhatsApp)

- ✅ Input langsung dari WhatsApp
- ✅ Bisa dari HP/komputer
- ✅ Cepat dan mudah
- ✅ Semua tercatat otomatis
- ✅ Ada laporan penjualan

---

## Tips

### 1. Gunakan Email yang Jelas

```
✅ premium-01@netflix.com:Pass123!
✅ account-netflix-001@gmail.com:Secret456!
❌ a@b.com:x
```

### 2. Password yang Kuat

- Minimal 8 karakter
- Kombinasi huruf besar, kecil, angka, simbol
- Contoh: `MyP@ssw0rd2024!`

### 3. Bulk Add untuk Banyak Akun

Kalau mau input 5+ akun, lebih cepat pakai `/addstock-bulk`:

- Siapkan daftar di notepad dulu
- Copy-paste ke WhatsApp
- Done!

### 4. Cek Stok Rutin

```
/stockreport
```

Biar tahu produk mana yang hampir habis.

### 5. Review Penjualan

```
/salesreport
```

Buat tahu produk mana yang laris.

---

## Troubleshooting

### "Invalid format"

**Masalah:** Format credentials salah

**Solusi:**

- Pastikan ada pemisah (`:` atau `|` atau `,`)
- Cek tidak ada spasi di awal/akhir
- Minimal 10 karakter

---

### Akun tidak terkirim ke customer

**Kemungkinan:**

1. Stok kosong → Cek `/stockreport`
2. Product ID salah → Pastikan ID match (netflix, spotify, dll)
3. File tidak ada → Input akun dulu dengan `/addstock`

**Solusi:**

```
/stockreport
/addstock netflix test@test.com:Pass123!
```

---

### Command tidak berfungsi

**Masalah:** Nomor Anda belum jadi admin

**Solusi:**
Tambahkan nomor Anda di file `.env`:

```
ADMIN_NUMBER_1=6281234567890
ADMIN_NUMBER_2=6289876543210
```

Restart bot setelah ubah `.env`.

---

## Keamanan

### ✅ Aman

- Hanya admin yang bisa input akun
- Product ID di-sanitize (anti path traversal)
- Semua operasi tercatat (audit trail)
- Password tidak pernah muncul di log

### 🔒 Best Practices

- Jangan share akun admin ke orang lain
- Gunakan password unik untuk setiap akun
- Review `/salesreport` secara berkala
- Backup file `products_data/` rutin

---

## Bantuan

Untuk lihat semua command admin:

```
/help
```

Untuk pertanyaan atau masalah, hubungi developer.

---

**Update terakhir:** 2 November 2024  
**Status:** ✅ Siap digunakan (semua test passed)
