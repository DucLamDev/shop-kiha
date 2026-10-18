import crypto from 'node:crypto';
import { Admin, Session } from './models.mjs';
import { config } from './config.mjs';
export const cookieName = 'kiha_session';
export const cookieOptions = {
  httpOnly: true,
  secure: config.production,
  sameSite: 'lax',
  path: '/',
};
export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
export async function requireAdmin(req, res, next) {
  const token = req.cookies[cookieName];
  if (!token || !/^[a-f\d]{64}$/.test(token))
    return res.status(401).json({ error: { message: 'Vui lòng đăng nhập để tiếp tục.' } });
  const session = await Session.findOne({
    tokenHash: hashToken(token),
    expiresAt: { $gt: new Date() },
  }).lean();
  const admin =
    session && (await Admin.findOne({ _id: session.admin, isActive: true, role: 'admin' }).lean());
  if (!admin) return res.status(401).json({ error: { message: 'Phiên đăng nhập đã hết hạn.' } });
  req.admin = admin;
  next();
}
export async function createSession(admin, res) {
  const token = crypto.randomBytes(32).toString('hex');
  const maxAge = 8 * 60 * 60 * 1000;
  await Session.create({
    tokenHash: hashToken(token),
    admin: admin._id,
    expiresAt: new Date(Date.now() + maxAge),
  });
  res.cookie(cookieName, token, { ...cookieOptions, maxAge });
}
