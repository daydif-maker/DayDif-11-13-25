module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
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
            '@context': './src/context',
            '@components': './src/components',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
