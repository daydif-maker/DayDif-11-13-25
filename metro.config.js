const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  '@': './src',
  '@designSystem': './src/designSystem',
  '@ui': './src/ui',
  '@features': './src/features',
  '@store': './src/store',
  '@services': './src/services',
  '@types': './src/types',
  '@utils': './src/utils',
  '@constants': './src/constants',
};

module.exports = config;

