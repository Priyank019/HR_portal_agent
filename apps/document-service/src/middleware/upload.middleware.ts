import { randomUUID } from 'node:crypto';
import multer from 'multer';
import { badRequest } from '../errors/http-error.js';
import { ensureUploadsDir, uploadsDir } from '../utils/document-files.js';

ensureUploadsDir();

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadsDir);
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
