# Database Migration va Yangi Saqlash Strukturasi

## Nima O'zgardi?

### 1. SQLite Database
- Endi barcha audio ma'lumotlari **SQLite database**da saqlanadi
- Database fayli: `data/audio.db`
- Tizim qayta ishga tushganda ham barcha audiolar saqlanib qoladi

### 2. Folder Strukturasi
- Audio fayllar endi **ism&familya bo'yicha folderlarga** saqlanadi
- Har bir foydalanuvchi uchun alohida folder yaratiladi
- Format: `uploads/Ism_Familya/`
- Masalan: `uploads/John_Doe/`, `uploads/Али_Алиев/`

### 3. Avtomatik Migration
- Mavjud JSON ma'lumotlari avtomatik ravishda database ga ko'chiriladi
- Migration script: `migrate_to_db.js`

## Qanday Ishlaydi?

### Audio Yuklash
1. Audio fayl yuklanganda, ism va familya olinadi
2. Agar ism yoki familya bo'sh bo'lsa, `Unknown` folderi ishlatiladi
3. Folder nomi maxsus belgilardan tozalanadi va `_` bilan almashtiriladi
4. Fayl shu folder ichiga saqlanadi
5. Ma'lumotlar database ga yoziladi

### Audio Ko'rish
- Barcha audiolar database dan olinadi
- Tizim qayta ishga tushganda ham barcha audiolar ko'rinadi
- Frontend avtomatik yangilanadi

### Audio O'chirish
- Fayl filesystemdan o'chiriladi
- Ma'lumot database dan o'chiriladi
- Agar folder bo'sh bo'lib qolsa, u ham o'chiriladi

## Migration Script

Agar eski JSON ma'lumotlaringiz bo'lsa:

```bash
node migrate_to_db.js
```

Bu script:
- JSON faylni o'qiydi
- Barcha ma'lumotlarni database ga ko'chiradi
- JSON faylni backup qiladi
- Xatolarni ko'rsatadi

## Folder Strukturasi

```
operatora_audio/
├── uploads/
│   ├── John_Doe/
│   │   ├── uuid1-timestamp.mp3
│   │   └── uuid2-timestamp.wav
│   ├── Али_Алиев/
│   │   └── uuid3-timestamp.mp3
│   └── Unknown/
│       └── uuid4-timestamp.mp3
├── data/
│   └── audio.db          # SQLite database
└── server.js
```

## Database Strukturasi

```sql
CREATE TABLE audio_files (
  id TEXT PRIMARY KEY,
  original_name TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  size INTEGER NOT NULL,
  mimetype TEXT,
  uploaded_at TEXT NOT NULL,
  duration INTEGER,
  format TEXT,
  owner_name TEXT,
  owner_surname TEXT
);
```

## Foydali Buyruqlar

### Database ni ko'rish (SQLite CLI)
```bash
cd /home/operatora_audio/operatora_audio
sqlite3 data/audio.db
```

SQLite ichida:
```sql
-- Barcha audiolarni ko'rish
SELECT * FROM audio_files;

-- Ism bo'yicha qidirish
SELECT * FROM audio_files WHERE owner_name LIKE '%Ali%';

-- Statistikalar
SELECT COUNT(*) as total FROM audio_files;
SELECT SUM(size) as total_size FROM audio_files;
```

### Database Backup
```bash
cp data/audio.db data/audio.db.backup.$(date +%Y%m%d_%H%M%S)
```

### Database Restore
```bash
cp data/audio.db.backup.YYYYMMDD_HHMMSS data/audio.db
```

## Xatolarni Hal Qilish

### Agar audiolar ko'rinmasa:
1. Database faylini tekshiring:
   ```bash
   ls -lh data/audio.db
   ```

2. Database ichidagi ma'lumotlarni ko'ring:
   ```bash
   sqlite3 data/audio.db "SELECT COUNT(*) FROM audio_files;"
   ```

3. Server loglarini ko'ring:
   ```bash
   journalctl --user -u operatora-audio -f
   ```

### Agar folderlar yaratilmasa:
1. `uploads/` papkasiga yozish huquqini tekshiring:
   ```bash
   ls -ld uploads/
   ```

2. Server loglarini ko'ring - xatolarni toping

## Eslatmalar

- Database fayli (`audio.db`) muhim - uni o'chirmang!
- Migration scriptni faqat bir marta ishga tushiring
- Backup qilishni unutmang
- Folder nomlari maxsus belgilardan tozalanadi (faqat harflar, raqamlar va `_`)
