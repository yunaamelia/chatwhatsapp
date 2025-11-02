# Admin Commands Reference

## 📋 Overview
Panduan lengkap perintah admin untuk mengelola chatbot WhatsApp Premium Shop.

## 🔐 Akses Admin
Hanya nomor WhatsApp yang terdaftar di file `.env` yang bisa menggunakan perintah admin:
```
ADMIN_NUMBER_1=6281234567890
ADMIN_NUMBER_2=6289876543210
```

---

## 📦 Manajemen Produk

### 1. Tambah Produk Baru
**Command:** `/addproduct`

**Format:**
```
/addproduct <id> | <name> | <price> | <description> | <stock> | <category>
```

**Contoh:**
```
/addproduct hbo | HBO Max Premium (1 Month) | 1.2 | Full HD streaming, all content | 10 | premium

/addproduct vcc-gold | Virtual Credit Card - Gold | 3 | Pre-loaded $100 balance | 5 | vcc
```

**Kategori yang valid:**
- `premium` - Akun premium (Netflix, Spotify, dll)
- `vcc` - Virtual credit card

**Catatan:**
- ID harus unik (tidak boleh sama dengan produk lain)
- Harga dalam USD
- Stok harus angka >= 0

---

### 2. Edit Produk
**Command:** `/editproduct`

**Format:**
```
/editproduct <id> | <field> | <newValue>
```

**Field yang bisa diedit:**
- `name` - Nama produk
- `price` - Harga (USD)
- `description` - Deskripsi

**Contoh:**
```
/editproduct netflix | name | Netflix Premium HD (1 Month)

/editproduct spotify | price | 1.5

/editproduct youtube | description | Ad-free, 4K quality, background play
```

---

### 3. Hapus Produk
**Command:** `/removeproduct`

**Format:**
```
/removeproduct <productId>
```

**Contoh:**
```
/removeproduct hbo

/removeproduct vcc-gold
```

**⚠️ PERHATIAN:** Produk yang dihapus tidak bisa dikembalikan!

---

### 4. Kelola Stok
**Command:** `/stock`

**Format untuk melihat semua stok:**
```
/stock
```

**Format untuk update stok:**
```
/stock <productId> <jumlah>
```

**Contoh:**
```
/stock netflix 50

/stock spotify 0
```

**Indikator stok:**
- ✅ Stok > 10 (Aman)
- ⚠️ Stok 1-10 (Menipis)
- ❌ Stok 0 (Habis)

---

## 📊 Monitoring & Statistik

### 5. Lihat Statistik
**Command:** `/stats`

Menampilkan:
- Total order hari ini
- Total revenue hari ini
- Jumlah customer aktif
- Status sistem (uptime, memory)

---

### 6. Cek Status Bot
**Command:** `/status`

Menampilkan:
- Status koneksi WhatsApp
- Uptime bot
- Jumlah session aktif
- Status Redis (jika digunakan)

---

## 💳 Manajemen Order

### 7. Approve Order
**Command:** `/approve`

**Format:**
```
/approve <order_id>
```

**Contoh:**
```
/approve ORD-1730000000000-1234
```

**Fungsi:**
- Approve pembayaran manual
- Trigger pengiriman produk otomatis ke customer
- Update status order ke "completed"

---

## 📢 Komunikasi

### 8. Broadcast Message
**Command:** `/broadcast`

**Format:**
```
/broadcast <pesan>
```

**Contoh:**
```
/broadcast Promo spesial! Diskon 20% semua produk hari ini! 🎉

/broadcast Server maintenance dalam 30 menit. Mohon selesaikan transaksi Anda.
```

**Fungsi:**
- Kirim pesan ke semua customer yang punya session aktif
- Berguna untuk promo, pengumuman, maintenance notice

---

## 📝 Best Practices

### Manajemen Produk
1. **Gunakan ID yang jelas dan konsisten**
   - ✅ `netflix-hd`, `spotify-premium`, `vcc-basic`
   - ❌ `prod1`, `test123`, `xyz`

2. **Set harga dalam USD (akan dikonversi ke IDR otomatis)**
   - 1 USD = Rp 15.800 (default)
   - Bisa diubah di `.env`: `USD_TO_IDR_RATE=16000`

3. **Deskripsi harus informatif**
   - ✅ "Full HD streaming, 4 screens, offline download"
   - ❌ "Netflix account"

4. **Monitor stok secara berkala**
   - Gunakan `/stock` setiap pagi
   - Set alert ketika stok < 5

### Manajemen Order
1. **Approve order dalam 5-15 menit**
   - Response time penting untuk customer satisfaction
   - Gunakan `/approve` setelah verifikasi pembayaran

2. **Gunakan transaction log untuk audit**
   - Semua action tercatat di `logs/transactions-YYYY-MM-DD.log`
   - Review log setiap minggu

### Security
1. **Jangan share credentials admin**
   - Admin number harus rahasia
   - Ganti nomor jika terexpose

2. **Backup data berkala**
   - Backup `.wwebjs_auth/` folder (session WhatsApp)
   - Backup `products_data/` folder (kredensial produk)
   - Backup `logs/` folder

---

## 🚨 Troubleshooting

### Error: "Tidak diizinkan"
- **Penyebab:** Nomor tidak terdaftar sebagai admin
- **Solusi:** Tambahkan nomor ke `.env` dan restart bot

### Produk tidak muncul setelah ditambah
- **Penyebab:** Customer masih di step lama
- **Solusi:** Suruh customer ketik `menu` untuk refresh

### Stock tidak update
- **Penyebab:** Redis connection issue (jika pakai Redis)
- **Solusi:** Check Redis service, atau restart bot

### Broadcast tidak terkirim
- **Penyebab:** Rate limit WhatsApp
- **Solusi:** Kurangi frekuensi broadcast, max 1x per jam

---

## 📞 Support
Jika ada masalah atau pertanyaan, check:
- `docs/` folder untuk dokumentasi lengkap
- `logs/` folder untuk error logs
- GitHub Issues untuk bug report

---

**Last Updated:** November 2, 2025
**Version:** 1.0.0 (Production Ready)
