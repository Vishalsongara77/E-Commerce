const csrf = require('csurf');

let csrfProtection;

if (process.env.NODE_ENV === 'production') {
  csrfProtection = csrf({
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: 'none', // Required for cross-site cookie between Render and Vercel
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
