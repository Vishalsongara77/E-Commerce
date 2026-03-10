const app = require('../backend/server');

// Direct Vercel test routes to verify function invocation
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API entry point reached directly', 
    timestamp: new Date().toISOString() 
  });
});

app.get('/api', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API Root reached directly', 
    timestamp: new Date().toISOString() 
  });
});

// Debug middleware for Vercel
app.use((req, res, next) => {
  console.log(`[Vercel API Request] ${req.method} ${req.url}`);
  next();
});

module.exports = app;
