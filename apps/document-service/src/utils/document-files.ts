import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));

export const uploadsDir = resolve(currentDir, '../../uploads');

export const ensureUploadsDir = () => {
  mkdirSync(uploadsDir, { recursive: true });
};

export const getDocumentFilePath = (storagePath: string) => resolve(currentDir, '../../', storagePath);