const path = require('path');

if (process.env.CI) {
  process.env.CI = 'false';
}

module.exports = {
  reactScriptsVersion: 'react-scripts',

  typescript: {
    enableTypeChecking: true,
  },

  style: {
    sass: {
      loaderOptions: {
        sassOptions: {
          includePaths: ['node_modules', 'src/assets'],
        },
      },
    },
  },

  webpack: {
    alias: {
      '@src': path.resolve(__dirname, 'src'),
      '@core': path.resolve(__dirname, 'src/@core'),
      '@assets': path.resolve(__dirname, 'src/@core/assets'),
      '@components': path.resolve(__dirname, 'src/@core/components'),
      '@layouts': path.resolve(__dirname, 'src/@core/layouts'),
      '@store': path.resolve(__dirname, 'src/redux'),
      '@styles': path.resolve(__dirname, 'src/@core/scss'),
      '@configs': path.resolve(__dirname, 'src/configs'),

      '@utils': path.resolve(__dirname, 'src/utility/Utils'),
      '@hooks': path.resolve(__dirname, 'src/utility/hooks'),
      '@context': path.resolve(__dirname, 'src/utility/context'),
      '@views': path.resolve(__dirname, 'src/views'),

      '@services': path.resolve(__dirname, 'src/services'),
    },

    configure: (webpackConfig) => {
      webpackConfig.resolve.extensions.push('.ts', '.tsx');

      return webpackConfig;
    },
  },
};
