# 📂 Terminal Klasör Navigasyonu Rehberi

## 🎯 Sorunun Çözümü

Şu anda **home dizini** (`~`) içindesiniz, ancak **proje klasörü** içinde olmanız gerekiyor.

## 📍 Doğru Klasöre Gitme

### 1. Proje Klasörünü Bulun
```bash
# Downloads klasörüne gidin
cd Downloads

# Proje klasörlerini listeleyin
ls -la
```

### 2. Proje Klasörüne Girin
```bash
# Proje klasörünüze girin (klasör adını değiştirin)
cd "project 5"
# veya
cd ddd
# veya hangi isimle indirdiyseniz
```

### 3. Doğru Klasörde Olduğunuzu Kontrol Edin
```bash
# Mevcut klasörü göster
pwd

# Dosyaları listele - package.json olmalı
ls -la

# package.json var mı kontrol et
cat package.json
```

## 🚀 Capacitor Komutlarını Çalıştırın

Doğru klasörde olduktan sonra:

```bash
# 1. Gerekli paketleri yükle
npm install

# 2. Web uygulamasını build et
npm run build

# 3. Capacitor sync
npx cap sync

# 4. Android Studio'da aç
npx cap open android
```

## 📂 Klasör Yapısı Kontrolü

Doğru klasörde olduğunuzda şunları görmelisiniz:
```
├── package.json          ✅ Olmalı
├── src/                   ✅ Olmalı  
├── android/               ✅ Capacitor ekledikten sonra
├── node_modules/          ✅ npm install sonrası
├── dist/                  ✅ npm run build sonrası
└── capacitor.config.ts    ✅ Olmalı
```

## 🔍 Alternatif Yöntemler

### Finder ile Klasör Bulma:
1. **Finder**'ı açın
2. **Downloads** klasörüne gidin
3. Proje klasörünü bulun
4. **Terminal**'de o klasöre gidin:
```bash
cd "/Users/okan/Downloads/[PROJE-KLASÖR-ADI]"
```

### Tam Yol ile Gitme:
```bash
# Örnek tam yollar:
cd "/Users/okan/Downloads/project 5"
cd "/Users/okan/Downloads/ddd"
cd "/Users/okan/Downloads/doktor-randevu-sistemi"
```

## ⚠️ Yaygın Hatalar

### 1. Boşluklu Klasör Adları:
```bash
# YANLIŞ:
cd /Users/okan/Downloads/project 5

# DOĞRU:
cd "/Users/okan/Downloads/project 5"
# veya
cd /Users/okan/Downloads/project\ 5
```

### 2. Büyük/Küçük Harf Duyarlılığı:
```bash
# macOS büyük/küçük harf duyarlıdır
cd Downloads  # doğru
cd downloads  # yanlış olabilir
```

## 🎯 Hızlı Çözüm

```bash
# 1. Downloads'a git
cd ~/Downloads

# 2. Proje klasörlerini listele
ls -la | grep -i project
ls -la | grep -i ddd
ls -la | grep -i randevu

# 3. Bulunan klasöre git
cd "[BULUNAN-KLASÖR-ADI]"

# 4. package.json kontrolü
ls package.json

# 5. Capacitor komutları
npm install && npm run build && npx cap sync && npx cap open android
```

## 📞 Hala Sorun Varsa

Eğer hala sorun yaşıyorsanız, şu komutu çalıştırın:
```bash
find ~/Downloads -name "package.json" -type f
```

Bu komut Downloads klasöründeki tüm package.json dosyalarını bulur ve proje klasörünüzün tam yolunu gösterir.