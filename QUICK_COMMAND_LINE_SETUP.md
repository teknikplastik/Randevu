# 🚀 Hızlı Komut Satırı Kurulumu

## 1. Java JDK Kurulumu
```bash
# Homebrew ile Java 11 yükleyin
brew install openjdk@11

# Java path'ini ayarlayın
echo 'export JAVA_HOME=/opt/homebrew/opt/openjdk@11' >> ~/.zshrc
source ~/.zshrc
```

## 2. Android SDK Command Line Tools
```bash
# SDK klasörü oluşturun
mkdir -p ~/android-sdk/cmdline-tools

# Command line tools indirin
cd ~/Downloads
curl -o commandlinetools.zip https://dl.google.com/android/repository/commandlinetools-mac-8512546_latest.zip

# Çıkarın
unzip commandlinetools.zip -d ~/android-sdk/cmdline-tools
mv ~/android-sdk/cmdline-tools/cmdline-tools ~/android-sdk/cmdline-tools/latest

# Environment variables ekleyin
echo 'export ANDROID_HOME=~/android-sdk' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.zshrc
source ~/.zshrc
```

## 3. SDK Bileşenlerini Yükleyin
```bash
# Platform tools ve build tools yükleyin
sdkmanager "platform-tools" "platforms;android-32" "build-tools;32.0.0"

# Lisansları kabul edin
sdkmanager --licenses
```

## 4. APK Oluşturun
```bash
# Proje klasörüne gidin
cd /Users/okan/Downloads/project

# Web build
npm run build

# Capacitor sync
npx cap sync android

# Android klasörüne gidin
cd android

# APK oluşturun
./gradlew assembleDebug
```

## 5. APK Dosyasını Bulun
```bash
# APK dosyası burada olacak:
ls -la app/build/outputs/apk/debug/app-debug.apk
```

Bu yöntem Android Studio olmadan tamamen çalışır! 🎉