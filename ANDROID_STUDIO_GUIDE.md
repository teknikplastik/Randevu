# 📱 Android Studio ile APK Oluşturma Rehberi

## 🚀 Android Studio Kurulumu

### 1. Android Studio İndirme
- [Android Studio](https://developer.android.com/studio) resmi sitesinden indirin
- Mac için `.dmg` dosyasını indirin
- Kurulumu tamamlayın

### 2. İlk Kurulum
1. **Android Studio'yu açın**
2. **SDK Manager**'ı açın (Tools > SDK Manager)
3. **Android 13 (API Level 33)** veya üzerini yükleyin
4. **Android SDK Build-Tools** yükleyin

## 📂 Projeyi Android Studio'da Açma

### Yöntem 1: Capacitor ile Otomatik Açma
```bash
# Terminal'de proje klasörüne gidin
cd /Users/okan/Downloads/[proje-klasörü-adı]

# Gerekli paketleri yükleyin
npm install

# Android platformunu ekleyin
npx cap add android

# Web uygulamasını build edin
npm run build

# Native projeye kopyalayın
npx cap sync

# Android Studio'da açın
npx cap open android
```

### Yöntem 2: Manuel Açma
1. **Android Studio'yu açın**
2. **Open an Existing Project** seçin
3. **android** klasörünü seçin (proje içindeki)
4. **OK** butonuna tıklayın

## 🔨 APK Oluşturma Adımları

### 1. Debug APK (Test için)
1. **Build** menüsünden **Build Bundle(s) / APK(s)** seçin
2. **Build APK(s)** tıklayın
3. **Locate** butonuna tıklayarak APK'yı bulun

### 2. Release APK (Yayın için)
1. **Build** menüsünden **Generate Signed Bundle / APK** seçin
2. **APK** seçeneğini işaretleyin
3. **Next** butonuna tıklayın

#### Keystore Oluşturma:
4. **Create new...** butonuna tıklayın
5. Keystore bilgilerini doldurun:
   - **Key store path**: APK'nızı kaydedeceğiniz yer
   - **Password**: Güçlü bir şifre
   - **Alias**: Anahtar adı (örn: myapp)
   - **Validity**: 25 yıl
   - **Certificate**: Kişisel bilgileriniz

6. **OK** ve **Next** butonlarına tıklayın
7. **release** seçeneğini işaretleyin
8. **Finish** butonuna tıklayın

## 📍 APK Dosyasını Bulma

APK dosyası şu konumda oluşur:
```
android/app/build/outputs/apk/debug/app-debug.apk
```
veya
```
android/app/build/outputs/apk/release/app-release.apk
```

## 📱 APK'yı Test Etme

### Android Cihazda Test:
1. **Geliştirici Seçenekleri**ni açın
2. **USB Debugging**'i etkinleştirin
3. **Bilinmeyen Kaynaklardan Yükleme**'yi açın
4. APK dosyasını cihaza kopyalayın
5. Dosya yöneticisinden APK'yı açın

### Emülatörde Test:
1. **AVD Manager**'ı açın (Tools > AVD Manager)
2. **Create Virtual Device** tıklayın
3. Bir cihaz modeli seçin
4. **API Level 33+** seçin
5. Emülatörü başlatın
6. APK'yı emülatöre sürükleyin

## 🎯 Önemli Notlar

### ✅ Başarı İpuçları:
- **Gradle Sync** tamamlanmasını bekleyin
- **Build** işlemi sırasında hata varsa **Build > Clean Project** deneyin
- **Internet bağlantısı** olduğundan emin olun (dependencies için)

### ⚠️ Yaygın Hatalar:
- **SDK not found**: SDK Manager'dan gerekli SDK'ları yükleyin
- **Gradle error**: `./gradlew clean` komutunu çalıştırın
- **Memory error**: Android Studio'ya daha fazla RAM verin

### 🔧 Sorun Giderme:
```bash
# Gradle temizleme
cd android
./gradlew clean
./gradlew build

# Capacitor yeniden sync
npx cap sync --force
```

## 📦 APK Boyutunu Küçültme

### 1. ProGuard Etkinleştirme:
`android/app/build.gradle` dosyasında:
```gradle
buildTypes {
    release {
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

### 2. Gereksiz Kaynakları Kaldırma:
```gradle
android {
    buildTypes {
        release {
            shrinkResources true
            minifyEnabled true
        }
    }
}
```

## 🚀 Google Play Store'a Yükleme

1. **Google Play Console**'a giriş yapın
2. **Create app** butonuna tıklayın
3. Uygulama bilgilerini doldurun
4. **App bundle** veya **APK** yükleyin
5. **Store listing** sayfasını doldurun
6. **Review** ve **Publish** yapın

## 📞 Yardım

Sorun yaşarsanız:
1. **Build > Clean Project** deneyin
2. **File > Invalidate Caches and Restart** yapın
3. Android Studio'yu yeniden başlatın
4. Terminal'de `npx cap doctor` çalıştırın

## 🎉 Sonuç

Bu adımları takip ederek Android Studio ile profesyonel bir APK oluşturabilirsiniz!

**APK Hazır!** 🎊