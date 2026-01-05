# Avtomatik Ishga Tushirish Sozlamalari

Operatora Audio Server endi tizim yuklanganda avtomatik ishga tushadi.

## Sozlamalar

Systemd user service yordamida sozlandi. Xizmat quyidagi holatda:

- ✅ **Xizmat faol**: `operatora-audio.service`
- ✅ **Avtomatik ishga tushirish yoqilgan**: tizim yuklanganda avtomatik ishga tushadi
- ✅ **Avtomatik qayta ishga tushirish**: agar xizmat to'xtasa, 10 soniyadan keyin avtomatik qayta ishga tushadi

## Foydali Buyruqlar

### Xizmatni boshqarish

```bash
# Xizmat holatini ko'rish
systemctl --user status operatora-audio

# Xizmatni to'xtatish
systemctl --user stop operatora-audio

# Xizmatni ishga tushirish
systemctl --user start operatora-audio

# Xizmatni qayta ishga tushirish
systemctl --user restart operatora-audio

# Xizmatni ko'rish (avtomatik ishga tushirishni o'chirish)
systemctl --user disable operatora-audio

# Xizmatni yoqish (avtomatik ishga tushirishni yoqish)
systemctl --user enable operatora-audio
```

### Loglarni ko'rish

```bash
# Xizmat loglarini ko'rish
journalctl --user -u operatora-audio -f

# Oxirgi 100 qator log
journalctl --user -u operatora-audio -n 100

# Bugungi loglar
journalctl --user -u operatora-audio --since today
```

## Xizmat Fayli

Xizmat fayli quyidagi joyda:
`~/.config/systemd/user/operatora-audio.service`

## Server Ma'lumotlari

- **Port**: 3000
- **URL**: http://localhost:3000
- **Ishchi katalog**: `/home/operatora_audio/operatora_audio`
- **Node.js**: `/usr/bin/node`

## Tekshirish

Server ishlayotganini tekshirish:

```bash
# Xizmat holati
systemctl --user status operatora-audio

# API orqali tekshirish
curl http://localhost:3000/api/audio

# Brauzerda ochish
# http://localhost:3000
```

## Muammo Hal Qilish

Agar xizmat ishlamasa:

1. Xizmat holatini tekshiring:
   ```bash
   systemctl --user status operatora-audio
   ```

2. Loglarni ko'ring:
   ```bash
   journalctl --user -u operatora-audio -n 50
   ```

3. Xizmatni qayta ishga tushiring:
   ```bash
   systemctl --user restart operatora-audio
   ```

4. Avtomatik ishga tushirishni tekshiring:
   ```bash
   loginctl show-user $USER | grep Linger
   ```
   Agar `Linger=no` bo'lsa, quyidagi buyruqni bajaring:
   ```bash
   loginctl enable-linger $USER
   ```

## Qo'shimcha Ma'lumot

Bu xizmat systemd user service sifatida ishlaydi va foydalanuvchi tizimga kirishdan oldin ham ishga tushadi (agar `enable-linger` yoqilgan bo'lsa).
