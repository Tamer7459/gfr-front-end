// gfr-frontend/craco.config.js
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // إيقاف تحذيرات source map من node_modules
      webpackConfig.ignoreWarnings = [
        /Failed to parse source map/,
      ];
      return webpackConfig;
    },
  },
};