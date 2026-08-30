const { withGradleProperties } = require('expo/config-plugins');

const BUILD_PROPERTIES = {
  'android.r8.optimizedResourceShrinking': 'true',
  'expo.gif.enabled': 'false',
  'expo.webp.enabled': 'false',
};

module.exports = function withAndroidSizeOptimizations(config) {
  return withGradleProperties(config, (gradleConfig) => {
    for (const [key, value] of Object.entries(BUILD_PROPERTIES)) {
      const existing = gradleConfig.modResults.find(
        (property) => property.type === 'property' && property.key === key,
      );

      if (existing) {
        existing.value = value;
      } else {
        gradleConfig.modResults.push({ type: 'property', key, value });
      }
    }

    return gradleConfig;
  });
};
