import crypto from 'crypto';

const getAdminSecret = () => {
  return process.env.ADMIN_JWT_SECRET || process.env.ADMIN_SECRET || 'diwali_wonderland_admin_secret_key_royal_2026';
};

export const getAdminPassword = () => {
  return process.env.ADMIN_PASSWORD || 'Diwali@Admin2026';
};

/**
 * Generate a cryptographically signed, timestamped admin session token (24-hour validity)
 */
export const generateAdminToken = () => {
  const secret = getAdminSecret();
  const timestamp = Date.now();
  const payload = `diwali_admin_${timestamp}`;
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${timestamp}.${signature}`;
};

/**
 * Verify signed admin token and enforce 24-hour expiration
 */
export const verifyAdminToken = (token) => {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestampStr, signature] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // 24 hours expiration (in ms)
  const maxAge = 24 * 60 * 60 * 1000;
  if (Date.now() - timestamp > maxAge || timestamp > Date.now() + 60000) {
    return false; // Expired or future dated
  }

  const secret = getAdminSecret();
  const expectedPayload = `diwali_admin_${timestamp}`;
  const expectedSignature = crypto.createHmac('sha256', secret).update(expectedPayload).digest('hex');

  // Constant-time comparison to prevent timing attacks
  const sigBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');

  if (sigBuffer.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
};

/**
 * Express middleware to protect administrative routes
 */
export const requireAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['x-admin-token']) {
    token = String(req.headers['x-admin-token']).trim();
  }

  if (!token || !verifyAdminToken(token)) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Valid administrative credentials or session token required.',
    });
  }

  req.admin = { role: 'admin', authenticatedAt: Date.now() };
  next();
};
