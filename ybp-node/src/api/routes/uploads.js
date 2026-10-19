import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Router } from 'express';
import multer from 'multer';
import { optionalAuth } from '../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_ROOT = path.join(__dirname, '../../../uploads');

fs.mkdirSync(UPLOAD_ROOT, { recursive: true });

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_ROOT),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '';
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 80 * 1024 * 1024 }, // 80 MB for audition videos
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) return cb(null, true);
    return cb(new Error(`Unsupported file type: ${file.mimetype}`));
  },
});

export function uploadsRouter() {
  const router = Router();

  router.post('/', optionalAuth, (req, res) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          title: 'Upload Error',
          detail: err.message || 'Upload failed',
          status: 400,
        });
      }
      if (!req.file) {
        return res.status(400).json({
          title: 'Bad Request',
          detail: 'file is required (multipart field name: file)',
          status: 400,
        });
      }

      const id = path.parse(req.file.filename).name;
      const url = `/uploads/${req.file.filename}`;
      return res.status(201).json({
        id,
        url,
        absoluteUrl: `${req.protocol}://${req.get('host')}${url}`,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        purpose: req.body?.purpose || 'attachment',
      });
    });
  });

  return router;
}
