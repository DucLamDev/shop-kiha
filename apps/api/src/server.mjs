import mongoose from 'mongoose';
import { config } from './config.mjs';
import { connectDb } from './models.mjs';
import { createApp } from './app.mjs';
await connectDb(config.mongoUri);
const server = createApp().listen(config.port, config.host, () =>
  console.log(`KIHA API: http://${config.host}:${config.port}`),
);
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () =>
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    }),
  );
