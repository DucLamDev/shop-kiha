import path from 'node:path';
import fs from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import multer from 'multer';
import { fileTypeFromFile } from 'file-type';
import { root } from './config.mjs';
import { Product, Video } from './models.mjs';
import { requireAdmin } from './auth.mjs';
import { listInput, escapeRegex, objectId } from './validation.mjs';

export const VIDEO_MAX_BYTES = 100 * 1024 * 1024;
const fail = (status, message) => Object.assign(new Error(message), { status });
const supported = { mp4: 'video/mp4', webm: 'video/webm' };

export function videoRoutes(app, publicFilter, options = {}) {
  const directory = path.resolve(
    options.videoDir || process.env.VIDEO_UPLOAD_DIR || path.join(root, '.local/uploads/videos'),
  );
  const maxBytes = options.videoMaxBytes || VIDEO_MAX_BYTES;
  const temporary = path.join(directory, '.tmp');
  const upload = multer({
    defParamCharset: 'utf8',
    storage: multer.diskStorage({
      destination(_req, _file, cb) {
        fs.mkdir(temporary, { recursive: true }).then(() => cb(null, temporary), cb);
      },
      filename(_req, _file, cb) {
        cb(null, `${randomUUID()}.upload`);
      },
    }),
    limits: { fileSize: maxBytes, files: 1, fields: 0, parts: 1 },
    fileFilter(_req, file, cb) {
      const ext = path.extname(file.originalname).slice(1).toLowerCase();
      cb(
        supported[ext] === file.mimetype ? null : fail(422, 'Chỉ hỗ trợ video MP4 hoặc WebM.'),
        supported[ext] === file.mimetype,
      );
    },
  }).single('video');

  // Kept outside public/; a draft or unassigned video requires the admin session.
  app.get('/api/videos/:filename', async (req, res, next) => {
    if (!/^[a-f0-9-]{36}\.(mp4|webm)$/.test(req.params.filename))
      throw fail(404, 'Không tìm thấy video.');
    const video = await Video.findOne({ filename: req.params.filename }).lean();
    if (!video) throw fail(404, 'Không tìm thấy video.');
    const send = () => {
      res.type(video.mime);
      res.sendFile(
        video.filename,
        { root: directory, dotfiles: 'deny', cacheControl: false },
        (error) => {
          if (error) next(error);
        },
      );
    };
    if (await Product.exists({ ...(await publicFilter()), video: video.src })) return send();
    await requireAdmin(req, res, send);
  });
  // Explicit guards here because public playback is registered before the admin router.
  app.get('/api/admin/videos', requireAdmin, async (req, res) => {
    const { page, limit, q } = listInput.parse(req.query);
    const filter = q ? { name: { $regex: escapeRegex(q), $options: 'i' } } : {};
    const [items, total] = await Promise.all([
      Video.find(filter)
        .select('-filename')
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Video.countDocuments(filter),
    ]);
    res.json({ data: { items, total, page, pages: Math.ceil(total / limit), maxBytes } });
  });
  app.post('/api/admin/videos', requireAdmin, (req, res, next) => {
    upload(req, res, (error) => {
      if (error instanceof multer.MulterError) {
        const tooLarge = error.code === 'LIMIT_FILE_SIZE';
        return next(
          fail(
            tooLarge ? 413 : 422,
            tooLarge
              ? `Video vượt quá ${Math.round(maxBytes / 1024 / 1024)} MB.`
              : 'Chọn đúng một file trong trường video, không kèm trường khác.',
          ),
        );
      }
      if (error) return next(error);
      void save().catch(next);
      async function save() {
        if (!req.file) throw fail(422, 'Hãy chọn một video.');
        let destination;
        try {
          const type = await fileTypeFromFile(req.file.path).catch(() => null);
          const ext = path.extname(req.file.originalname).slice(1).toLowerCase();
          if (!type || type.ext !== ext || supported[type.ext] !== type.mime || req.file.size === 0)
            throw fail(422, 'Nội dung file không phải video MP4/WebM hợp lệ.');
          const filename = `${randomUUID()}.${type.ext}`;
          destination = path.join(directory, filename);
          await fs.rename(req.file.path, destination);
          const video = await Video.create({
            filename,
            src: `/api/videos/${filename}`,
            mime: type.mime,
            bytes: req.file.size,
            name: [...path.basename(req.file.originalname)]
              .filter((c) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) !== 127)
              .join('')
              .slice(0, 200),
          });
          res.status(201).json({ data: video });
        } catch (error) {
          await fs.rm(destination || req.file.path, { force: true });
          throw error;
        } finally {
          await fs.rm(req.file.path, { force: true });
        }
      }
    });
  });
  app.delete('/api/admin/videos/:id', requireAdmin, async (req, res) => {
    const video = await Video.findById(objectId.parse(req.params.id));
    if (!video) throw fail(404, 'Video không tồn tại.');
    if (await Product.exists({ video: video.src }))
      throw fail(409, 'Video đang được dùng. Hãy gỡ khỏi các sản phẩm và lưu lại trước khi xóa.');
    await fs.rm(path.join(directory, video.filename), { force: true });
    await video.deleteOne();
    res.json({ data: { success: true } });
  });
}
