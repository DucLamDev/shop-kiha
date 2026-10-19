import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { config } from './config.mjs';
import { Admin, Category, Media, Product, Session, Settings, Video } from './models.mjs';
import { videoRoutes } from './videos.mjs';
import {
  categoryInput,
  productInput,
  settingsInput,
  loginInput,
  listInput,
  objectId,
  escapeRegex,
} from './validation.mjs';
import { requireAdmin, createSession, hashToken, cookieName, cookieOptions } from './auth.mjs';
const fail = (status, message) => Object.assign(new Error(message), { status });
const ok = (res, data, status = 200) => res.status(status).json({ data });
const publicFields = '-previousSlugs -sourceImageHash';
const categoryPopulation = [
  { path: 'category', select: 'name slug isActive' },
  { path: 'categories', select: 'name slug isActive' },
];
function publicProduct(product) {
  if (!product) return product;
  product.categories = (
    product.categories?.length ? product.categories : [product.category]
  ).filter((c) => c?.isActive);
  if (!product.category?.isActive) product.category = product.categories[0];
  return product;
}
const sortMap = {
  featured: { isFeatured: -1, sortOrder: 1, _id: 1 },
  newest: { createdAt: -1, _id: -1 },
  name: { name: 1, _id: 1 },
  'price-asc': { price: 1, _id: 1 },
  'price-desc': { price: -1, _id: 1 },
};
async function validateImages(paths) {
  const unique = [...new Set(paths.filter(Boolean))];
  if ((await Media.countDocuments({ src: { $in: unique } })) !== unique.length)
    throw fail(422, 'Ảnh không tồn tại trong thư viện. Hãy chọn lại ảnh.');
}
async function publicFilter() {
  const categories = await Category.find({ isActive: true }).select('_id').lean();
  return {
    status: 'published',
    $and: [
      {
        $or: [
          { category: { $in: categories.map((c) => c._id) } },
          { categories: { $in: categories.map((c) => c._id) } },
        ],
      },
    ],
    ...(config.production ? { isDemo: false } : {}),
  };
}
async function listProducts(query, isAdmin) {
  const parsed = listInput.parse(query);
  const { page, limit, q, category, sort, featured, status } = parsed;
  const filter = isAdmin ? {} : await publicFilter();
  if (isAdmin && status) filter.status = status;
  if (q) filter.name = { $regex: escapeRegex(q), $options: 'i' };
  if (category) {
    const c = await Category.findOne({
      slug: category,
      ...(isAdmin ? {} : { isActive: true }),
    }).lean();
    if (!c) return { items: [], total: 0, page, pages: 0, limit };
    filter.$and = [...(filter.$and || []), { $or: [{ category: c._id }, { categories: c._id }] }];
  }
  if (featured) filter.isFeatured = featured === 'true';
  const [items, total] = await Promise.all([
    Product.find(filter)
      .select(isAdmin ? '' : publicFields)
      .populate(categoryPopulation)
      .sort(sortMap[sort])
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);
  return {
    items: isAdmin ? items : items.map(publicProduct),
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
}
export function createApp(options = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin(origin, cb) {
        cb(null, !origin || config.origins.includes(origin));
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  // Same-origin browser mutations only; protects login, logout and all writes from CSRF.
  app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    if (
      !['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
      (!req.headers.origin || !config.origins.includes(req.headers.origin))
    )
      return res.status(403).json({ error: { message: 'Nguồn yêu cầu không được phép.' } });
    next();
  });
  app.get('/api/health', (_req, res) =>
    res
      .status(mongoose.connection.readyState === 1 ? 200 : 503)
      .json({ data: { status: mongoose.connection.readyState === 1 ? 'ok' : 'unavailable' } }),
  );
  app.get('/api/categories', async (_req, res) =>
    ok(res, await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean()),
  );
  app.get('/api/products', async (req, res) => ok(res, await listProducts(req.query, false)));
  app.get('/api/products/:slug', async (req, res) => {
    if (req.params.slug.length > 160) throw fail(404, 'Không tìm thấy sản phẩm.');
    const filter = await publicFilter();
    const product = await Product.findOne({
      ...filter,
      $or: [{ slug: req.params.slug }, { previousSlugs: req.params.slug }],
    })
      .select(publicFields)
      .populate(categoryPopulation)
      .lean();
    if (!product) throw fail(404, 'Không tìm thấy sản phẩm.');
    ok(res, publicProduct(product));
  });
  app.get('/api/settings/public', async (_req, res) =>
    ok(
      res,
      await Settings.findOne({ key: 'site' }).select('-_id -key -createdAt -updatedAt').lean(),
    ),
  );
  videoRoutes(app, publicFilter, options);
  app.post(
    '/api/admin/auth/login',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 10,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      message: {
        error: { message: 'Bạn đã thử đăng nhập nhiều lần. Vui lòng thử lại sau 15 phút.' },
      },
    }),
    async (req, res) => {
      const { email, password } = loginInput.parse(req.body);
      const admin = await Admin.findOne({ email, isActive: true, role: 'admin' }).select(
        '+passwordHash',
      );
      // A fixed dummy bcrypt hash avoids a fast path that reveals account existence.
      const valid = await bcrypt.compare(
        password,
        admin?.passwordHash || '$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW',
      );
      if (!admin || !valid) throw fail(401, 'Email hoặc mật khẩu không đúng.');
      if (req.cookies[cookieName])
        await Session.deleteOne({ tokenHash: hashToken(req.cookies[cookieName]) });
      await createSession(admin, res);
      ok(res, { email: admin.email, role: admin.role });
    },
  );
  app.use('/api/admin', requireAdmin);
  app.get('/api/admin/auth/me', (req, res) =>
    ok(res, { email: req.admin.email, role: req.admin.role }),
  );
  app.post('/api/admin/auth/logout', async (req, res) => {
    await Session.deleteOne({ tokenHash: hashToken(req.cookies[cookieName]) });
    res.clearCookie(cookieName, cookieOptions);
    ok(res, { success: true });
  });
  app.get('/api/admin/stats', async (_req, res) => {
    const [products, published, categories, media] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ status: 'published' }),
      Category.countDocuments(),
      Media.countDocuments(),
    ]);
    ok(res, { products, published, categories, media });
  });
  app.get('/api/admin/products', async (req, res) => ok(res, await listProducts(req.query, true)));
  app.get('/api/admin/products/:id', async (req, res) => {
    const item = await Product.findById(objectId.parse(req.params.id)).lean();
    if (!item) throw fail(404, 'Sản phẩm không tồn tại.');
    ok(res, item);
  });
  async function saveProduct(req, res) {
    const data = productInput.parse(req.body);
    const id = req.params.id && objectId.parse(req.params.id);
    const current = id ? await Product.findById(id) : null;
    if (id && !current) throw fail(404, 'Sản phẩm không tồn tại.');
    data.categories = [...new Set([data.category, ...data.categories])];
    if (
      (await Category.countDocuments({ _id: { $in: data.categories } })) !== data.categories.length
    )
      throw fail(422, 'Danh mục không tồn tại.');
    if (data.video && !(await Video.exists({ src: data.video })))
      throw fail(422, 'Video không tồn tại trong thư viện. Hãy tải lên hoặc chọn lại.');
    await validateImages([...data.images, data.thumbnail, data.seoImage]);
    if (
      await Product.exists({
        ...(id ? { _id: { $ne: id } } : {}),
        $or: [{ slug: data.slug }, { previousSlugs: data.slug }],
      })
    )
      throw fail(409, 'Slug đã được sử dụng. Hãy chọn slug khác.');
    if (current) {
      const previousSlugs = [
        ...new Set([
          ...current.previousSlugs,
          ...(current.slug !== data.slug ? [current.slug] : []),
        ]),
      ].filter((s) => s !== data.slug);
      Object.assign(current, data, { previousSlugs });
      ok(res, await current.save());
    } else ok(res, await Product.create(data), 201);
  }
  app.post('/api/admin/products', saveProduct);
  app.put('/api/admin/products/:id', saveProduct);
  app.delete('/api/admin/products/:id', async (req, res) => {
    if (!(await Product.findByIdAndDelete(objectId.parse(req.params.id))))
      throw fail(404, 'Sản phẩm không tồn tại.');
    ok(res, { success: true });
  });
  app.get('/api/admin/categories', async (_req, res) =>
    ok(res, await Category.find().sort({ sortOrder: 1, name: 1 }).lean()),
  );
  async function saveCategory(req, res) {
    const data = categoryInput.parse(req.body);
    await validateImages([data.image]);
    if (!req.params.id) return ok(res, await Category.create(data), 201);
    const saved = await Category.findByIdAndUpdate(objectId.parse(req.params.id), data, {
      returnDocument: 'after',
      runValidators: true,
    });
    if (!saved) throw fail(404, 'Danh mục không tồn tại.');
    ok(res, saved);
  }
  app.post('/api/admin/categories', saveCategory);
  app.put('/api/admin/categories/:id', saveCategory);
  app.delete('/api/admin/categories/:id', async (req, res) => {
    const id = objectId.parse(req.params.id);
    if (await Product.exists({ $or: [{ category: id }, { categories: id }] }))
      throw fail(409, 'Danh mục đang có sản phẩm. Hãy chuyển hoặc xóa các sản phẩm trước.');
    if (!(await Category.findByIdAndDelete(id))) throw fail(404, 'Danh mục không tồn tại.');
    ok(res, { success: true });
  });
  app.get('/api/admin/media', async (req, res) => {
    const { page, limit, q } = listInput.parse(req.query);
    const filter = q ? { name: { $regex: escapeRegex(q), $options: 'i' } } : {};
    const [items, total] = await Promise.all([
      Media.find(filter)
        .select('-sha256')
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Media.countDocuments(filter),
    ]);
    ok(res, { items, total, page, pages: Math.ceil(total / limit) });
  });
  app.get('/api/admin/settings', async (_req, res) =>
    ok(
      res,
      await Settings.findOne({ key: 'site' }).select('-_id -key -createdAt -updatedAt').lean(),
    ),
  );
  app.put('/api/admin/settings', async (req, res) => {
    const data = settingsInput.parse(req.body);
    await validateImages([data.logo, data.heroImage, data.aboutImage]);
    const saved = await Settings.findOneAndUpdate({ key: 'site' }, data, {
      returnDocument: 'after',
      upsert: true,
      runValidators: true,
    }).select('-_id -key -createdAt -updatedAt');
    ok(res, saved);
  });
  app.use((_req, res) =>
    res.status(404).json({ error: { message: 'Đường dẫn API không tồn tại.' } }),
  );
  app.use((err, _req, res, _next) => {
    if (res.headersSent) return _next(err);
    if (err instanceof ZodError)
      return res.status(422).json({
        error: {
          message: 'Vui lòng kiểm tra thông tin đã nhập.',
          fields: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
        },
      });
    if (err.code === 11000)
      return res
        .status(409)
        .json({ error: { message: 'Slug hoặc thông tin duy nhất đã được sử dụng.' } });
    if (err.type === 'entity.too.large')
      return res.status(413).json({ error: { message: 'Dữ liệu vượt quá dung lượng cho phép.' } });
    if (err instanceof SyntaxError && 'body' in err)
      return res.status(400).json({ error: { message: 'Dữ liệu JSON không hợp lệ.' } });
    if (!err.status) console.error('[api]', err.name, err.message);
    res.status(err.status || 500).json({
      error: { message: err.status ? err.message : 'Hệ thống đang bận. Vui lòng thử lại sau.' },
    });
  });
  return app;
}
