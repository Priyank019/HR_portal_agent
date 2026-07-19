export type ChunkedDocumentText = {
  chunkIndex: number;
  text: string;
};

const DEFAULT_CHUNK_SIZE_WORDS = 500;
const DEFAULT_CHUNK_OVERLAP_WORDS = 50;

const normalizeWords = (text: string) => text.trim().split(/\s+/).filter(Boolean);

export const chunkDocumentText = (
  text: string,
  chunkSizeWords = DEFAULT_CHUNK_SIZE_WORDS,
  chunkOverlapWords = DEFAULT_CHUNK_OVERLAP_WORDS,
): ChunkedDocumentText[] => {
  if (!text.trim()) {
    return [];
  }

  if (chunkSizeWords <= 0) {
    throw new Error('chunkSizeWords must be greater than 0');
  }

  if (chunkOverlapWords < 0 || chunkOverlapWords >= chunkSizeWords) {
    throw new Error('chunkOverlapWords must be greater than or equal to 0 and less than chunkSizeWords');
  }

  const words = normalizeWords(text);

  if (words.length === 0) {
    return [];
  }

  const chunks: ChunkedDocumentText[] = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < words.length) {
    const endIndex = Math.min(startIndex + chunkSizeWords, words.length);
    const chunkWords = words.slice(startIndex, endIndex);

    chunks.push({
      chunkIndex,
      text: chunkWords.join(' '),
    });

    if (endIndex === words.length) {
      break;
    }

    startIndex = endIndex - chunkOverlapWords;
    chunkIndex += 1;
  }

  return chunks;
};
