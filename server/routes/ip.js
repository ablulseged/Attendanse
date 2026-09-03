import { Router } from 'express';

const router = Router();

function normalizeIp(value) {
  if (!value) return null;
  let ip = value.trim();

  // Node may represent an IPv4 address as ::ffff:196.188.112.77.
  if (ip.toLowerCase().startsWith('::ffff:')) ip = ip.slice(7);
  // Some proxies include an IPv6 zone id; it is not part of the address.
  ip = ip.split('%')[0];

  return ip;
}

router.get('/check-ip', (req, res) => {
  // req.ip respects Express's explicitly configured trust proxy setting.
  const ip = normalizeIp(req.ip);
  const allowedIp = normalizeIp(process.env.ALLOWED_PUBLIC_IP || '196.188.112.77');

  if (!ip) return res.status(400).json({ error: 'Unable to determine client IP.' });

  return res.set('Cache-Control', 'no-store').json({ allowed: ip === allowedIp, ip });
});

export default router;
