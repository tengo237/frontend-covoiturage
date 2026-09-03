module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // Ordre important : le plugin reanimated doit toujours être le dernier
    // de la liste. worklets-core est nécessaire pour la détection faciale
    // en temps réel (react-native-vision-camera-face-detector).
    plugins: ["react-native-reanimated/plugin"],
  };
};
