export * from './types/index.js';
export { analyzeProject } from './analyzers/index.js';
export { generateClaudeMd } from './generators/claude-md.js';
export * from './coordination/index.js';
export * from './tasks/index.js';

// Memory system exports
export { getEmbeddingService, generateEmbedding, generateEmbeddings } from './memory/embeddings.js';
export { classifyTask, extractTaskEntities, getSuggestedMemoryQueries } from './memory/task-classifier.js';
export { retrieveDynamicMemoryContext } from './memory/dynamic-retrieval.js';
export type { TaskClassification } from './memory/task-classifier.js';
export type { DynamicMemoryContext, RetrievedMemory } from './memory/dynamic-retrieval.js';

// New optimization modules
export {
  compressMemoryEntry,
  compressMemoryBatch,
  summarizeMemories,
  estimateTokens,
  ContextBudget,
} from './memory/context-compressor.js';
export type { CompressionResult, CompressorConfig } from './memory/context-compressor.js';

export {
  HierarchicalMemoryManager,
  getHierarchicalMemoryManager,
  calculateEffectiveImportance,
} from './memory/hierarchical-memory.js';
export type { MemoryEntry, TieredMemory, HierarchicalConfig } from './memory/hierarchical-memory.js';

export {
  SpeculativeCache,
  getSpeculativeCache,
} from './memory/speculative-cache.js';
export type { CacheEntry, CacheConfig } from './memory/speculative-cache.js';

export {
  MemoryConsolidator,
  getMemoryConsolidator,
} from './memory/memory-consolidator.js';
export type { ConsolidationConfig, ConsolidationResult } from './memory/memory-consolidator.js';

// Serverless Qdrant
export {
  ServerlessQdrantManager,
  getServerlessQdrantManager,
  initServerlessQdrant,
} from './memory/serverless-qdrant.js';
