import mongoose from 'mongoose';
import { config } from '../apps/api/src/config.mjs';
import { connectDb, Settings } from '../apps/api/src/models.mjs';

// Coordinates of the pin in the owner's shared link (not the map camera center).
// Verified against Google's redirect on 2026-10-20.
const sharedUrl = 'https://maps.app.goo.gl/7b3bgs5L2yuCSvKK7';
try {
  await connectDb(config.mongoUri);
  const result = await Settings.updateOne(
    { key: 'site', mapsUrl: sharedUrl, mapLocation: null },
    { $set: { mapLocation: { latitude: 10.9413544, longitude: 106.9609977 } } },
    { runValidators: true },
  );
  console.log(
    result.modifiedCount
      ? 'Configured the verified KIHA map pin.'
      : 'Existing location preserved; no update needed.',
  );
} finally {
  await mongoose.disconnect();
}
