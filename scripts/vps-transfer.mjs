import fs from 'node:fs/promises';
import path from 'node:path';
import { constants } from 'node:fs';
import mongoose from 'mongoose';
import { config, root } from '../apps/api/src/config.mjs';

// Only shop content is transferred. Admin accounts and sessions stay on the source.
const collections = ['categories', 'products', 'media', 'settings', 'videos'];
const { EJSON } = mongoose.mongo.BSON;
const [mode, folderArgument] = process.argv.slice(2);
if (!['export', 'import'].includes(mode) || !folderArgument)
  throw new Error('Usage: node scripts/vps-transfer.mjs export|import <transfer-directory>');
const folder = path.resolve(folderArgument);
const videoDirectory = path.resolve(
  process.env.VIDEO_UPLOAD_DIR || path.join(root, '.local/uploads/videos'),
);
const videoNames = (documents) =>
  documents.map((video) => {
    if (!/^[a-f0-9-]{36}\.(mp4|webm)$/.test(video.filename))
      throw new Error('Invalid video filename in transfer data.');
    return video.filename;
  });

await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000, autoIndex: false });
try {
  const database = mongoose.connection.db;
  if (mode === 'export') {
    const data = {};
    for (const name of collections) data[name] = await database.collection(name).find({}).toArray();
    if (collections.every((name) => data[name].length === 0))
      throw new Error(
        'Source database is empty. Check MONGODB_URI and its database name before exporting.',
      );
    const names = videoNames(data.videos);
    // Check every video before creating the export folder.
    for (const name of names) await fs.access(path.join(videoDirectory, name));
    await fs.mkdir(path.dirname(folder), { recursive: true });
    await fs.mkdir(folder, { mode: 0o700 }); // Refuse to overwrite a previous export.
    await fs.mkdir(path.join(folder, 'videos'), { mode: 0o700 });
    for (const name of names)
      await fs.copyFile(
        path.join(videoDirectory, name),
        path.join(folder, 'videos', name),
        constants.COPYFILE_EXCL,
      );
    await fs.writeFile(
      path.join(folder, 'catalog.ejson'),
      EJSON.stringify({ version: 1, exportedAt: new Date(), data }, { relaxed: false }),
      { flag: 'wx', mode: 0o600 },
    );
    console.log('Exported shop content and videos; admin accounts and sessions excluded.');
    console.log(
      JSON.stringify(Object.fromEntries(collections.map((name) => [name, data[name].length]))),
    );
  } else {
    const payload = EJSON.parse(await fs.readFile(path.join(folder, 'catalog.ejson'), 'utf8'));
    if (
      payload.version !== 1 ||
      !payload.data ||
      Object.keys(payload.data).length !== collections.length ||
      collections.some((name) => !Array.isArray(payload.data[name]))
    )
      throw new Error('Unsupported transfer file.');
    const { data } = payload;
    // Check all collections before writing anything. Never merge or delete live records.
    for (const name of collections)
      if (await database.collection(name).findOne({}))
        throw new Error(`Target ${name} is not empty. Import stopped without replacing data.`);
    const names = videoNames(data.videos);
    for (const name of names) {
      await fs.access(path.join(folder, 'videos', name));
      const exists = await fs.access(path.join(videoDirectory, name)).then(
        () => true,
        () => false,
      );
      if (exists) throw new Error('A target video already exists. Import stopped.');
    }
    await fs.mkdir(videoDirectory, { recursive: true });
    for (const name of names)
      await fs.copyFile(
        path.join(folder, 'videos', name),
        path.join(videoDirectory, name),
        constants.COPYFILE_EXCL,
      );
    for (const name of collections)
      if (data[name].length) await database.collection(name).insertMany(data[name]);
    console.log('Imported shop content. Create a separate production admin account next.');
    console.log(
      JSON.stringify(Object.fromEntries(collections.map((name) => [name, data[name].length]))),
    );
  }
} finally {
  await mongoose.disconnect();
}
