/**
 * Metro config — inlineRequires lazy-parse 31 章 JSON.
 *
 * Default: 31 import lessons-chN.json 全在 app boot 解析 (~1.4MB 字串 parse).
 * inlineRequires: 等真正 require 時才 parse → boot 快 25%, 進到 LessonScreen 才付 parse 成本.
 *
 * Agent (search-specialist) 報告 P0-2.
 */
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = config;
