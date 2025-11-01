/**
 * Model Configuration
 * Contains AI model capabilities, tiers, and processing thresholds
 */

export default {
  "version": "2025.01",
  "lastUpdated": "2025-01-30",
  "models": {
    "gpt-4o": {
      "provider": "openai",
      "contextWindow": 128000,
      "maxOutputTokens": 16384,
      "supportsJsonMode": true,
      "supportsStreaming": true,
      "supportsFunctionCalling": true,
      "supportsFilesAPI": true,
      "costPer1kInput": 0.0025,
      "costPer1kOutput": 0.01,
      "quality": 9,
      "speed": "medium",
      "knowledgeCutoff": "2023-10",
      "recommended": true
    },
    "gpt-4o-mini": {
      "provider": "openai",
      "contextWindow": 128000,
      "maxOutputTokens": 16384,
      "supportsJsonMode": true,
      "supportsStreaming": true,
      "supportsFunctionCalling": true,
      "supportsFilesAPI": true,
      "costPer1kInput": 0.00015,
      "costPer1kOutput": 0.0006,
      "quality": 8,
      "speed": "fast",
      "knowledgeCutoff": "2023-10",
      "recommended": false
    },
    "gpt-4-turbo": {
      "provider": "openai",
      "contextWindow": 128000,
      "maxOutputTokens": 4096,
      "supportsJsonMode": true,
      "supportsStreaming": true,
      "supportsFunctionCalling": true,
      "supportsFilesAPI": true,
      "costPer1kInput": 0.01,
      "costPer1kOutput": 0.03,
      "quality": 9,
      "speed": "medium",
      "knowledgeCutoff": "2023-12",
      "recommended": false
    },
    "gpt-3.5-turbo": {
      "provider": "openai",
      "contextWindow": 16385,
      "maxOutputTokens": 4096,
      "supportsJsonMode": true,
      "supportsStreaming": true,
      "supportsFunctionCalling": true,
      "supportsFilesAPI": true,
      "costPer1kInput": 0.0005,
      "costPer1kOutput": 0.0015,
      "quality": 7,
      "speed": "fast",
      "knowledgeCutoff": "2021-09",
      "recommended": false
    }
  },
  "tiers": {
    "T1": {
      "maxBookmarks": 2000,
      "maxTokens": 110000,
      "maxGzipBytes": 61440,
      "recommendedModel": "gpt-4o",
      "flow": "single-shot"
    },
    "T2": {
      "maxBookmarks": 4500,
      "maxTokens": 220000,
      "maxGzipBytes": 184320,
      "recommendedModel": "gpt-4o",
      "flow": "single-shot-with-fallback"
    },
    "T3": {
      "maxBookmarks": 10000,
      "maxTokens": 500000,
      "maxGzipBytes": 368640,
      "recommendedModel": "gpt-4o",
      "flow": "improved-chunking"
    },
    "T4": {
      "maxBookmarks": 999999,
      "maxTokens": 999999999,
      "maxGzipBytes": 999999999,
      "recommendedModel": null,
      "flow": "backend-assisted"
    }
  },
  "thresholds": {
    "singleShotMaxGzipBytes": 327680,
    "singleShotMaxTokens": 220000,
    "chunkSize": 250,
    "safetyMargin": 0.7
  }
};
