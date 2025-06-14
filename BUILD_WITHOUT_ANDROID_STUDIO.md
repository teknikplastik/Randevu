# 📱 Android Studio Olmadan APK Oluşturma Rehberi

## 🚀 Yöntem 1: Komut Satırı ile APK Oluşturma

### Gereksinimler:
- **Android SDK** (Android Studio olmadan)
- **Java JDK 11** veya **JDK 17**

### 1. Android SDK Kurulumu (Sadece Command Line Tools)
```bash
# Android SDK Command Line Tools indirin
# https://developer.android.com/studio#command-tools

# İndirilen dosyayı açın
mkdir -p ~/android-sdk/cmdline-tools
cd ~/android-sdk/cmdline-tools
# commandlinetools-mac-*.zip dosyasını buraya çıkarın

# Environment variables ekleyin
export ANDROID_HOME=~/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### 2. Gerekli SDK Bileşenlerini Yükleyin
```bash
# SDK Manager ile gerekli bileşenleri yükleyin
sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0"
sdkmanager "platforms;android-32" "build-tools;32.0.0"

# Lisansları kabul edin
sdkmanager --licenses
```

### 3. APK Oluşturma
```bash
# Proje klasörüne gidin
cd /Users/okan/Downloads/project

# Android klasörüne gidin
cd android

# Gradle ile APK oluşturun
./gradlew assembleDebug

# Release APK için (imzasız)
./gradlew assembleRelease
```

## 🌐 Yöntem 2: Online APK Builder Servisleri

### A) Capacitor Cloud Build (Önerilen)
```bash
# Ionic CLI yükleyin
npm install -g @ionic/cli

# Ionic hesabı oluşturun
ionic signup

# Projeyi cloud'a yükleyin
ionic capacitor build android --prod
```

### B) GitHub Actions ile Otomatik Build
```yaml
# .github/workflows/build-android.yml
name: Build Android APK

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Setup Java
      uses: actions/setup-java@v3
      with:
        distribution: 'temurin'
        java-version: '11'
        
    - name: Setup Android SDK
      uses: android-actions/setup-android@v2
      
    - name: Install dependencies
      run: npm install
      
    - name: Build web app
      run: npm run build
      
    - name: Sync Capacitor
      run: npx cap sync android
      
    - name: Build APK
      run: |
        cd android
        ./gradlew assembleDebug
        
    - name: Upload APK
      uses: actions/upload-artifact@v3
      with:
        name: app-debug.apk
        path: android/app/build/outputs/apk/debug/app-debug.apk
```

## 🔧 Yöntem 3: Docker ile APK Build

### Dockerfile Oluşturun
```dockerfile
FROM openjdk:11-jdk

# Android SDK kurulumu
ENV ANDROID_HOME /opt/android-sdk
ENV PATH ${PATH}:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools

RUN mkdir -p ${ANDROID_HOME}/cmdline-tools && \
    wget https://dl.google.com/android/repository/commandlinetools-linux-8512546_latest.zip && \
    unzip commandlinetools-linux-8512546_latest.zip -d ${ANDROID_HOME}/cmdline-tools && \
    mv ${ANDROID_HOME}/cmdline-tools/cmdline-tools ${ANDROID_HOME}/cmdline-tools/latest

# SDK bileşenlerini yükle
RUN yes | sdkmanager --licenses && \
    sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0"

WORKDIR /app
COPY . .

RUN npm install && \
    npm run build && \
    npx cap sync android

WORKDIR /app/android
RUN ./gradlew assembleDebug
```

### Docker ile Build
```bash
# Docker image oluştur
docker build -t my-app-builder .

# APK'yı çıkar
docker run --rm -v $(pwd)/output:/output my-app-builder cp /app/android/app/build/outputs/apk/debug/app-debug.apk /output/
```

## 📱 Yöntem 4: Expo EAS Build (Eğer Expo kullanıyorsanız)

```bash
# EAS CLI yükleyin
npm install -g eas-cli

# EAS hesabı oluşturun
eas login

# Build yapılandırması
eas build:configure

# Android APK build
eas build --platform android --profile preview
```

## 🛠️ Yöntem 5: Cordova CLI (Alternatif)

```bash
# Cordova CLI yükleyin
npm install -g cordova

# Cordova projesi oluşturun
cordova create myapp com.example.myapp MyApp

# Android platform ekleyin
cordova platform add android

# Web dosyalarını kopyalayın
cp -r dist/* myapp/www/

# APK oluşturun
cordova build android
```

## 🎯 En Kolay Çözüm: Komut Satırı

### Hızlı Kurulum (macOS)
```bash
# Homebrew ile Java yükleyin
brew install openjdk@11

# Android SDK Command Line Tools indirin
curl -o commandlinetools.zip https://dl.google.com/android/repository/commandlinetools-mac-8512546_latest.zip

# Çıkarın ve kurun
mkdir -p ~/android-sdk/cmdline-tools
unzip commandlinetools.zip -d ~/android-sdk/cmdline-tools
mv ~/android-sdk/cmdline-tools/cmdline-tools ~/android-sdk/cmdline-tools/latest

# Environment variables
echo 'export ANDROID_HOME=~/android-sdk' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.zshrc
source ~/.zshrc

# SDK bileşenlerini yükleyin
sdkmanager "platform-tools" "platforms;android-32" "build-tools;32.0.0"
sdkmanager --licenses

# Projenizde APK oluşturun
cd /Users/okan/Downloads/project/android
./gradlew assembleDebug
```

## 📋 APK Dosyası Konumu

Build başarılı olduktan sonra APK dosyası şurada olacak:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## 🔐 İmzalı APK için

```bash
# Keystore oluşturun
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# Gradle ile imzalı APK
./gradlew assembleRelease
```

## 💡 Önerilen Yöntem

**En kolay ve hızlı**: Komut satırı ile Android SDK kurulumu ve Gradle build
**En pratik**: GitHub Actions ile otomatik build
**En profesyonel**: Capacitor Cloud Build

Hangi yöntemi denemek istiyorsunuz?