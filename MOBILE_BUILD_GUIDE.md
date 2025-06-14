# 📱 Mobil Uygulama APK Oluşturma Rehberi

## 🚀 Hızlı Başlangıç

### 1. Gereksinimler
- **Node.js** (v16 veya üzeri)
- **Android Studio** (APK için)
- **Xcode** (iOS için - sadece Mac)

### 2. Kurulum Adımları

```bash
# 1. Capacitor kurulumu
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/contacts @capacitor/splash-screen

# 2. Capacitor başlatma
npx cap init

# 3. Android platformu ekleme
npx cap add android

# 4. Web uygulamasını build etme
npm run build

# 5. Native projeye kopyalama
npx cap sync

# 6. Android Studio'da açma
npx cap open android
```

### 3. APK Oluşturma

#### Android Studio ile:
1. **Android Studio'yu açın**
2. **Build > Generate Signed Bundle / APK** seçin
3. **APK** seçeneğini işaretleyin
4. **Keystore** oluşturun veya mevcut olanı seçin
5. **Build** butonuna tıklayın
6. APK dosyası `android/app/build/outputs/apk/` klasöründe oluşur

#### Komut satırı ile:
```bash
# Debug APK (test için)
cd android
./gradlew assembleDebug

# Release APK (yayın için)
./gradlew assembleRelease
```

### 4. Özellikler

✅ **Rehber Erişimi** - Gerçek cihaz rehberine erişim
✅ **Offline Çalışma** - İnternet bağlantısı olmadan temel özellikler
✅ **Push Notifications** - Randevu hatırlatmaları
✅ **Native Performance** - Hızlı ve akıcı kullanım
✅ **Auto Updates** - Otomatik güncelleme desteği

### 5. Test Etme

```bash
# Cihazda test etme
npx cap run android

# Emülatörde test etme
npx cap run android --target=emulator
```

### 6. Yayınlama

1. **Google Play Console**'a giriş yapın
2. **Yeni uygulama oluştur**
3. **APK'yı yükle**
4. **Store listing** bilgilerini doldurun
5. **Yayınla**

## 🔧 Sorun Giderme

### Yaygın Hatalar:

**1. Gradle Build Hatası:**
```bash
cd android
./gradlew clean
./gradlew build
```

**2. Capacitor Sync Hatası:**
```bash
npx cap sync --force
```

**3. Android SDK Hatası:**
- Android Studio'da SDK Manager'ı açın
- API Level 33+ yükleyin

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. `npx cap doctor` komutunu çalıştırın
2. Hata mesajlarını kontrol edin
3. Capacitor dokümantasyonunu inceleyin

## 🎯 Sonuç

Bu adımları takip ederek profesyonel bir mobil uygulama APK'sı oluşturabilirsiniz!