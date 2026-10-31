// Runs only when the MongoDB volume is first initialized.
// The API receives read/write access to KIHA, never the MongoDB root credential.
const database = db.getSiblingDB('kiha');
const password = process.env.MONGO_APP_PASSWORD;
if (!password) throw new Error('MONGO_APP_PASSWORD is required');
database.createUser({
  user: 'kiha_app',
  pwd: password,
  roles: [{ role: 'readWrite', db: 'kiha' }],
});
