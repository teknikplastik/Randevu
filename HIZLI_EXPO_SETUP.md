# ⚡ Hızlı Expo Kurulumu - 5 Dakikada APK

## 🚀 Tek Komutla APK

### 1. Expo CLI Kurun
```bash
npm install -g @expo/cli eas-cli
```

### 2. Expo'ya Giriş Yapın
```bash
npx expo register  # Yeni hesap
# veya
npx expo login     # Mevcut hesap
```

### 3. GitHub'dan Projeyi Çekin
```bash
git clone [GITHUB_REPOSITORY_URL]
cd [PROJE_KLASORU]
npm install
```

### 4. APK Oluşturun
```bash
# EAS Build yapılandırması
eas build:configure

# Android APK oluştur (ücretsiz)
eas build --platform android --profile preview
```

### 5. APK'yı İndirin
- Terminal'de verilen **link**'e tıklayın
- **Download** butonuna tıklayın
- **APK dosyası hazır!** 🎉

## 📱 Test Etme

### Android Cihazda:
1. **Bilinmeyen Kaynaklardan Yükleme** açın
2. APK'yı yükleyin

### Expo Go ile (Development):
```bash
npx expo start
# QR kodu tarayın
```

## 🎯 Avantajlar

- ✅ **5 dakikada APK**
- ✅ **Android Studio'ya ihtiyaç yok**
- ✅ **Ücretsiz** (aylık 30 build)
- ✅ **Otomatik imzalama**
- ✅ **Google Play Store'a hazır**

## 🔄 Güncelleme

```bash
# Kod değişikliği sonrası
git push
eas build --platform android --profile preview
```

**En kolay yöntem bu!** 🚀