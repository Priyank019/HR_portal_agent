import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import multer from 'multer';
import { badRequest } from '../errors/http-error.js';

const currentDir = dirname(fileURLToPath(import.meta.url));
const uploadDir = resolve(currentDir, '../../uploads');

mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDir);
  },
  filename: (_req, file, callback) => {
    const uniqueName = `${Date.now()}-${randomUUID()}.pdf`;
    callback(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype !== 'application/pdf') {
      callback(badRequest('Only PDF files are allowed'));
      return;
    }

    callback(null, true);
  },
});

export const uploadSinglePdf = upload.single('file');
