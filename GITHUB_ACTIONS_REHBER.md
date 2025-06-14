# 🚀 GitHub Actions ile APK Oluşturma - Türkçe Rehber

## 📋 Adım Adım Kurulum

### 1. GitHub Repository'nizde Workflow Dosyası Oluşturun

Repository'nizde şu klasör yapısını oluşturun:
```
.github/
  workflows/
    build-android.yml
```

### 2. Workflow Dosyasını Ekleyin

Yukarıdaki `build-android.yml` dosyasını repository'nizin `.github/workflows/` klasörüne ekleyin.

### 3. Supabase Bilgilerini Ekleyin (Opsiyonel)

Eğer Supabase kullanıyorsanız:

1. GitHub repository'nizde **Settings** > **Secrets and variables** > **Actions** gidin
2. **New repository secret** butonuna tıklayın
3. Şu secret'ları ekleyin:
   - `VITE_SUPABASE_URL`: Supabase URL'niz
   - `VITE_SUPABASE_ANON_KEY`: Supabase Anon Key'iniz

### 4. Workflow'u Çalıştırın

#### Otomatik Çalışma:
- `main` veya `master` branch'ine kod push ettiğinizde otomatik çalışır

#### Manuel Çalışma:
1. GitHub repository'nizde **Actions** sekmesine gidin
2. **Android APK Build** workflow'unu seçin
3. **Run workflow** butonuna tıklayın

## 📱 APK Dosyalarını İndirme

### Yöntem 1: Actions Artifacts
1. **Actions** sekmesine gidin
2. Tamamlanan workflow'u seçin
3. **Artifacts** bölümünden APK'ları indirin:
   - `app-debug.apk` - Test için
   - `app-release.apk` - Yayın için

### Yöntem 2: Releases
1. Repository ana sayfasında **Releases** bölümüne gidin
2. En son release'i seçin
3. **Assets** bölümünden APK'ları indirin

## 🔧 Workflow Özellikleri

### ✅ Neler Yapılıyor:
- **Node.js 18** kurulumu
- **Java 17** kurulumu
- **Android SDK** kurulumu
- **npm dependencies** yükleme
- **Web app build** (npm run build)
- **Capacitor sync** (npx cap sync android)
- **Debug APK** oluşturma
- **Release APK** oluşturma
- **APK dosyalarını upload** etme
- **GitHub Release** oluşturma

### ⏱️ Süre:
- İlk çalışma: ~10-15 dakika
- Sonraki çalışmalar: ~5-8 dakika (cache sayesinde)

## 🎯 Avantajlar

### ✅ Android Studio'ya İhtiyaç Yok
- Tamamen cloud-based
- Kendi bilgisayarınızda kurulum gerektirmez

### ✅ Otomatik Build
- Kod değişikliklerinde otomatik APK oluşturur
- Her commit için yeni APK

### ✅ Ücretsiz
- GitHub Actions aylık 2000 dakika ücretsiz
- Public repository'ler için sınırsız

### ✅ Çoklu APK
- Debug APK (test için)
- Release APK (yayın için)

## 🚨 Sorun Giderme

### Build Hatası Alırsanız:
1. **Actions** sekmesinde hatalı workflow'u açın
2. **Logs** bölümünde hatayı kontrol edin
3. Yaygın hatalar:
   - **Node modules hatası**: `package.json` kontrol edin
   - **Capacitor hatası**: `capacitor.config.ts` kontrol edin
   - **Android build hatası**: `android/` klasörü kontrol edin

### Gradle Hatası:
```yaml
# build-android.yml dosyasına ekleyin
- name: Clean Gradle
  run: |
    cd android
    ./gradlew clean
```

### Memory Hatası:
```yaml
# build-android.yml dosyasına ekleyin
- name: Set Gradle Memory
  run: |
    echo "org.gradle.jvmargs=-Xmx4096m" >> android/gradle.properties
```

## 📞 Yardım

Herhangi bir sorun yaşarsanız:
1. **Actions** logs'unu kontrol edin
2. Hata mesajını paylaşın
3. `package.json` ve `capacitor.config.ts` dosyalarını kontrol edin

## 🎉 Sonuç

Artık her kod değişikliğinde otomatik olarak APK oluşacak! Android Studio'ya hiç ihtiyacınız yok! 🚀