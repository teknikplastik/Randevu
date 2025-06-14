# ⚡ Hızlı GitHub Actions Kurulumu

## 🚀 5 Dakikada APK Oluşturma

### 1. Repository'nizde Dosya Oluşturun
```
GitHub'da repository'nize gidin
→ "Create new file" tıklayın
→ Dosya adı: .github/workflows/build-android.yml
→ İçeriği yapıştırın (build-android.yml dosyasından)
→ "Commit new file" tıklayın
```

### 2. Workflow'u Çalıştırın
```
Actions sekmesine gidin
→ "Android APK Build" workflow'unu seçin
→ "Run workflow" butonuna tıklayın
→ "Run workflow" onaylayın
```

### 3. APK'yı İndirin (5-10 dakika sonra)
```
Actions sekmesinde tamamlanan workflow'u açın
→ Artifacts bölümüne gidin
→ "app-debug" veya "app-release" indirin
→ ZIP dosyasını açın
→ APK dosyası hazır! 🎉
```

## 📱 APK Test Etme

### Android Cihazda:
1. **Bilinmeyen Kaynaklardan Yükleme**'yi açın
2. APK dosyasını cihaza kopyalayın
3. Dosya yöneticisinden APK'yı açın
4. Yükle'ye tıklayın

### Emülatörde:
1. Android Studio emülatörü açın
2. APK'yı emülatör penceresine sürükleyin
3. Otomatik yüklenir

## 🔄 Otomatik Güncelleme

Her kod değişikliğinde:
1. GitHub'a push yapın
2. Otomatik olarak yeni APK oluşur
3. Releases bölümünden indirin

**Artık Android Studio'ya hiç ihtiyacınız yok!** 🚀