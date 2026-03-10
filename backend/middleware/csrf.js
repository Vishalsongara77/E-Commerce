const csrf = require('csurf');

let csrfProtection;

if (process.env.NODE_ENV === 'production') {
  csrfProtection = csrf({
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      domain: process.env.COOKIE_DOMAIN || 'localhost',
      path: '/'
    }
  });
} else {
  csrfProtection = (req, res, next) => {
    if (typeof req.csrfToken !== 'function') {
      req.csrfToken = () => 'dev-csrf-token';
    }
    next();
  };
}

module.exports = csrfProtection;
