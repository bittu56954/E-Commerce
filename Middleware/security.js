// NoSQL Injection Guard
export const nosqlInjectionGuard = (req, res, next) => {
  const sanitize = (obj) => {
    if (obj instanceof Object) {
      for (const key in obj) {
        if (key.startsWith('$') || key.includes('.')) {
          console.warn(`[SECURITY WARNING] Blocked NoSQL Injection attempt. Sanitized key: ${key}`);
          delete obj[key];
        } else {
          sanitize(obj[key]);
        }
      }
    }
  };

  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);
  next();
};

// XSS Protection Sanitizer
export const xssSanitizer = (req, res, next) => {
  const escapeHtml = (str) => {
    if (typeof str !== 'string') return str;
    // Don't sanitize URLs, base64 image strings, or emails to prevent corruption
    if (/^(https?:\/\/|data:image\/|blob:)/i.test(str) || str.includes('@')) {
      return str;
    }
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  };

  const sanitizeInput = (obj) => {
    if (obj instanceof Object) {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = escapeHtml(obj[key]);
        } else {
          sanitizeInput(obj[key]);
        }
      }
    }
  };

  sanitizeInput(req.body);
  sanitizeInput(req.query);
  next();
};

// CSRF Protection (Double Submit Cookie Pattern)
export const csrfProtection = (req, res, next) => {
  // Allow safe methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Exempt auth logins/registrations since they establish the session
  const exemptPaths = [
    '/api/auth/login', 
    '/api/auth/register', 
    '/api/auth/register-direct', 
    '/api/auth/register-admin', 
    '/api/auth/verify-login-otp', 
    '/api/auth/verify-registration-otp', 
    '/api/auth/resend-otp',
    '/api/auth/forgot-password',
    '/api/auth/reset-password'
  ];
  if (exemptPaths.includes(req.path)) {
    return next();
  }

  const csrfCookie = req.cookies ? req.cookies['csrf-token'] : null;
  const csrfHeader = req.headers['x-csrf-token'];

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    console.warn(`[SECURITY WARNING] CSRF validation failed. Cookie: ${csrfCookie}, Header: ${csrfHeader}`);
    return res.status(403).json({ error: 'CSRF token validation failed. Access denied.' });
  }

  next();
};
