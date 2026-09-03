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

function clientIp(req) {
  // Render forwards the visitor address as the first X-Forwarded-For value.
  // req.ip can otherwise be one of Render's rotating private proxy addresses.
  const forwardedFor = req.get('x-forwarded-for');
  const forwardedIp = forwardedFor?.split(',')[0];
  return normalizeIp(forwardedIp || req.ip);
}

router.get('/check-ip', (req, res) => {
  const ip = clientIp(req);
  const allowedIp = normalizeIp(process.env.ALLOWED_PUBLIC_IP || '196.188.112.77');

  if (!ip) return res.status(400).json({ error: 'Unable to determine client IP.' });

  return res.set('Cache-Control', 'no-store').json({ allowed: ip === allowedIp, ip });
});

export default router;
