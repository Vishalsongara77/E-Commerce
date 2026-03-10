const app = require('../backend/server');

// Debug middleware for Vercel
app.use((req, res, next) => {
  console.log(`[Vercel API Request] ${req.method} ${req.url}`);
  next();
});

module.exports = app;
