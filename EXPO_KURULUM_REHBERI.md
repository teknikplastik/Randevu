# 🚀 Expo ile APK Oluşturma - Türkçe Rehber

## 📋 Adım Adım Kurulum

### 1. GitHub'dan Projeyi Çekin
```bash
# GitHub repository'nizi clone edin
git clone https://github.com/KULLANICI_ADINIZ/REPO_ADINIZ.git
cd REPO_ADINIZ
```

### 2. Expo CLI Kurulumu
```bash
# Expo CLI'yi global olarak yükleyin
npm install -g @expo/cli
npm install -g eas-cli

# Expo hesabı oluşturun (ücretsiz)
npx expo register
# veya giriş yapın
npx expo login
```

### 3. Projeyi Expo'ya Dönüştürün
```bash
# Mevcut dependencies'leri yükleyin
npm install

# Expo dependencies ekleyin
npx expo install expo-router expo-constants expo-linking expo-status-bar

# Expo projesini başlatın
npx expo start
```

### 4. EAS Build Kurulumu
```bash
# EAS Build'i yapılandırın
eas build:configure

# Android APK oluşturun (ücretsiz - aylık 30 build)
eas build --platform android --profile preview

# Production APK için
eas build --platform android --profile production
```

## 📱 APK İndirme

### Build Tamamlandıktan Sonra:
1. **Terminal'de verilen link**'e tıklayın
2. **Expo Dashboard**'da build'i görün
3. **Download** butonuna tıklayın
4. **APK dosyasını** indirin

### Expo Go ile Test:
```bash
# Development build için
npx expo start

# QR kodu tarayın (Expo Go app ile)
```

## 🎯 Avantajlar

### ✅ Çok Kolay
- Tek komutla APK oluşturma
- Android Studio'ya ihtiyaç yok
- Otomatik imzalama

### ✅ Ücretsiz
- Aylık 30 build ücretsiz
- Unlimited development builds

### ✅ Hızlı
- 5-10 dakikada APK hazır
- Cloud-based build

### ✅ Profesyonel
- Google Play Store'a hazır
- Otomatik optimizasyon

## 🔧 Özel Ayarlar

### Environment Variables:
```bash
# .env dosyasını Expo'ya ekleyin
npx expo install expo-constants

# app.json'da:
{
  "expo": {
    "extra": {
      "supabaseUrl": process.env.VITE_SUPABASE_URL,
      "supabaseAnonKey": process.env.VITE_SUPABASE_ANON_KEY
    }
  }
}
```

### Native Dependencies:
```bash
# Capacitor plugins'leri Expo equivalentleri ile değiştirin
npx expo install expo-contacts expo-haptics expo-status-bar
```

## 🚨 Sorun Giderme

### Metro Bundle Hatası:
```bash
# Cache temizleyin
npx expo start --clear

# Node modules yeniden yükleyin
rm -rf node_modules
npm install
```

### Build Hatası:
```bash
# EAS build logs kontrol edin
eas build:list

# Specific build logs
eas build:view [BUILD_ID]
```

## 📞 Hızlı Başlangıç

```bash
# 1. Projeyi çekin
git clone [GITHUB_URL]
cd [PROJE_ADI]

# 2. Expo kurulumu
npm install -g @expo/cli eas-cli
npx expo login

# 3. Dependencies
npm install
npx expo install expo-router expo-constants

# 4. APK oluşturun
eas build --platform android --profile preview

# 5. APK'yı indirin (link terminal'de görünecek)
```

## 🎉 Sonuç

**5 dakikada APK hazır!** Expo en kolay ve hızlı yöntemdir! 🚀

### Sonraki Adımlar:
1. GitHub'dan projeyi çekin
2. Expo CLI kurun
3. `eas build` komutunu çalıştırın
4. APK'yı indirin

**Hangi adımda yardıma ihtiyacınız var?**