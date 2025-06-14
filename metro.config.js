const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Expo Router requires
config.resolver.assetExts.push('cjs');

module.exports = config;