import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const options = { timestamps: true, versionKey: false };
const categorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    image: String,
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  options,
);
const productSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    previousSlugs: { type: [String], default: [] },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    sourceImageHash: { type: String, unique: true, sparse: true },
    shortDescription: String,
    description: String,
    images: [String],
    thumbnail: String,
    video: { type: String, default: '' },
    videoDescription: { type: String, default: '' },
    price: { type: Number, min: 0, default: null },
    priceLabel: String,
    specifications: [{ _id: false, label: String, value: String }],
    isFeatured: { type: Boolean, default: false },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    sortOrder: { type: Number, default: 0 },
    seoTitle: String,
    seoDescription: String,
    seoImage: String,
    isDemo: { type: Boolean, default: false },
  },
  options,
);
productSchema.index({ status: 1, category: 1, sortOrder: 1, _id: 1 });
productSchema.index({ previousSlugs: 1 });
productSchema.index({ status: 1, categories: 1 });
productSchema.index({ video: 1 });
export const Category = model('Category', categorySchema);
export const Product = model('Product', productSchema);
export const Admin = model(
  'Admin',
  new Schema(
    {
      email: { type: String, required: true, unique: true },
      passwordHash: { type: String, required: true, select: false },
      role: { type: String, enum: ['admin'], default: 'admin' },
      isActive: { type: Boolean, default: true },
    },
    options,
  ),
);
export const Session = model(
  'Session',
  new Schema(
    {
      tokenHash: { type: String, unique: true },
      admin: { type: Schema.Types.ObjectId, ref: 'Admin' },
      expiresAt: { type: Date, index: { expires: 0 } },
    },
    options,
  ),
);
export const Media = model(
  'Media',
  new Schema(
    {
      assetId: { type: String, unique: true },
      name: String,
      src: { type: String, unique: true },
      format: String,
      width: Number,
      height: Number,
      bytes: Number,
      sha256: String,
    },
    options,
  ),
);
export const Video = model(
  'Video',
  new Schema(
    {
      filename: { type: String, required: true, unique: true },
      src: { type: String, required: true, unique: true },
      name: String,
      mime: String,
      bytes: Number,
    },
    options,
  ),
);
export const Settings = model(
  'Settings',
  new Schema(
    {
      key: { type: String, unique: true, default: 'site' },
      shopName: String,
      phone: String,
      zaloUrl: String,
      facebookUrl: String,
      tiktokUrl: String,
      mapsUrl: String,
      mapLocation: {
        type: new Schema(
          {
            latitude: { type: Number, min: -90, max: 90, required: true },
            longitude: { type: Number, min: -180, max: 180, required: true },
          },
          { _id: false },
        ),
        default: null,
      },
      statistics: {
        salesCount: { type: Number, min: 0, default: null },
        interestedCount: { type: Number, min: 0, default: null },
        positiveReviewCount: { type: Number, min: 0, default: null },
        customerCount: { type: Number, min: 0, default: null },
        ratingAverage: { type: Number, min: 0, max: 5, default: null },
        reviewCount: { type: Number, min: 0, default: null },
        source: { type: String, default: '' },
      },
      address: String,
      logo: String,
      heroImage: String,
      aboutImage: String,
      heroTitle: String,
      heroDescription: String,
      aboutTitle: String,
      aboutDescription: String,
      commitments: [{ _id: false, title: String, description: String }],
      seoTitle: String,
      seoDescription: String,
    },
    options,
  ),
);
export async function connectDb(uri) {
  if (!uri) throw new Error('MONGODB_URI is required. Copy .env.example to .env first.');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  await Promise.all(
    [Category, Product, Admin, Session, Media, Video, Settings].map((m) => m.init()),
  );
}
