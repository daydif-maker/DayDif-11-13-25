const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  '@': './src',
  '@designSystem': './src/designSystem',
  '@navigation': './src/navigation',
  '@ui': './src/ui',
  '@features': './src/features',
  '@store': './src/store',
  '@services': './src/services',
  '@types': './src/types',
  '@utils': './src/utils',
  '@constants': './src/constants',
  '@lib': './src/lib',
  '@hooks': './src/hooks',
  '@screens': './src/screens',
};

module.exports = config;
