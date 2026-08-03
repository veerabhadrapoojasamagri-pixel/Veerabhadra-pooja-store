require('dotenv').config();
const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const QRCode = require('qrcode');

// â”€â”€â”€ WhatsApp Web Client (whatsapp-web.js) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let waClient = null;
let waReady = false;
let waQrDataUrl = null;
let waInitializing = false;

function initWhatsAppClient() {
  if (waInitializing || waReady) return;
  waInitializing = true;

  try {
    const { Client, LocalAuth } = require('whatsapp-web.js');

    // Use system-installed Chrome to avoid Puppeteer version conflicts
    const possibleChromePaths = [
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Users\\' + require('os').userInfo().username + '\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
    ];
    const fs2 = require('fs');
    const chromePath = possibleChromePaths.find(p => fs2.existsSync(p));
    if (!chromePath) {
      console.error('[WhatsApp] Chrome not found. Please install Google Chrome.');
      waInitializing = false;
      return;
    }
    console.log('[WhatsApp] Using Chrome at:', chromePath);

    waClient = new Client({
      authStrategy: new LocalAuth({ dataPath: path.join(__dirname, '.whatsapp-session') }),
      puppeteer: {
        executablePath: chromePath,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      }
    });

    waClient.on('qr', async (qr) => {
      console.log('[WhatsApp] QR Code ready â€” scan it from the Admin panel.');
      try {
        waQrDataUrl = await QRCode.toDataURL(qr);
      } catch (e) {
        waQrDataUrl = null;
      }
      waReady = false;
    });

    waClient.on('ready', () => {
      console.log('[WhatsApp] âœ… Connected! Messages will now send automatically.');
      waReady = true;
      waQrDataUrl = null;
    });

    waClient.on('authenticated', () => {
      console.log('[WhatsApp] Authenticated successfully.');
    });

    waClient.on('auth_failure', (msg) => {
      console.error('[WhatsApp] Auth failure:', msg);
      waReady = false;
      waInitializing = false;
    });

    waClient.on('disconnected', (reason) => {
      console.warn('[WhatsApp] Disconnected:', reason);
      waReady = false;
      waQrDataUrl = null;
      waInitializing = false;
      // Auto-reconnect after 10 seconds
      setTimeout(initWhatsAppClient, 10000);
    });

    waClient.initialize().catch(err => {
      console.error('[WhatsApp] Failed to start client (async):', err.message);
      waInitializing = false;
    });
    console.log('[WhatsApp] Initializing client...');
  } catch (err) {
    console.error('[WhatsApp] Failed to start client:', err.message);
    waInitializing = false;
  }
}

// Only start WhatsApp client when running locally (not on Vercel â€” no Chrome support)
if (!process.env.VERCEL) {
  initWhatsAppClient();
}
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const app = express();
app.use(express.json());

// HTTP Security Headers (A+ Security & Lighthouse Audit Optimization)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

const PORT = process.env.PORT || 3000;

// â”€â”€â”€ Cloudinary Image Storage (used when CLOUDINARY_CLOUD_NAME is set) â”€â”€â”€â”€â”€â”€â”€â”€
let cloudinaryConfigured = false;
try {
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key:    process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    cloudinaryConfigured = true;
    console.log('[Cloudinary] Configured for cloud image storage.');
  }
} catch (e) {
  console.warn('[Cloudinary] Not configured:', e.message);
}

// â”€â”€â”€ Multer: Cloudinary or local disk â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let upload;
if (cloudinaryConfigured) {
  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  const cloudinary = require('cloudinary').v2;
  const cloudStorage = new CloudinaryStorage({
    cloudinary,
    params: { folder: 'pooja-store', resource_type: 'auto', allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'webm', 'mov'] }
  });
  upload = multer({ storage: cloudStorage, limits: { fileSize: 50 * 1024 * 1024 } });
} else {
  // Local disk fallback
  const uploadDir = path.join(__dirname, 'public', 'images');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  const localStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname))
  });
  upload = multer({ storage: localStorage, limits: { fileSize: 50 * 1024 * 1024 } });
}

// ─── Supabase manages products directly from client-side now ──────────────────────────

app.post('/api/upload', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded or file too large' });
  // Cloudinary returns req.file.path (URL); local returns req.file.filename
  const imageUrl = cloudinaryConfigured
    ? req.file.path
    : 'images/' + req.file.filename;
  res.json({ imageUrl });
});

const ordersFilePath = path.join(__dirname, 'orders.json');

// â”€â”€â”€ MongoDB Setup (used when MONGODB_URI env var is set) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let mongoDb = null;
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
  const { MongoClient } = require('mongodb');
  const mongoClient = new MongoClient(MONGODB_URI);
  mongoClient.connect()
    .then(() => {
      mongoDb = mongoClient.db('pooja_store');
      console.log('[MongoDB] Connected to Atlas database.');
    })
    .catch(err => console.error('[MongoDB] Connection failed:', err.message));
}

// Read all orders â€” MongoDB if available, else local file
async function readOrders() {
  if (mongoDb) {
    return await mongoDb.collection('orders').find({}).toArray();
  }
  // Local file fallback
  if (!fs.existsSync(ordersFilePath)) {
    const initial = getDefaultOrders();
    fs.writeFileSync(ordersFilePath, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(ordersFilePath, 'utf8') || '[]');
}

// Save (upsert) a single order â€” MongoDB if available, else rewrite file
async function saveOrder(order) {
  if (mongoDb) {
    await mongoDb.collection('orders').replaceOne({ id: order.id }, order, { upsert: true });
    return;
  }
  const orders = await readOrders();
  const idx = orders.findIndex(o => o.id === order.id);
  if (idx > -1) orders[idx] = order; else orders.push(order);
  fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2));
}

// Legacy helpers kept for compatibility
function readOrdersFromFile() {
  if (!fs.existsSync(ordersFilePath)) {
    const initial = getDefaultOrders();
    fs.writeFileSync(ordersFilePath, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(ordersFilePath, 'utf8') || '[]');
}
function writeOrdersToFile(orders) {
  fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2));
}

// Default seed orders for first-time setup
function getDefaultOrders() {
  return [
    {
      id: 'VRB100001',
      customerName: 'Rajesh Patel',
      mobileNumber: '9845012345',
      address: '45, 2nd Main, Indiranagar, Bangalore',
      date: '2026-06-28 10:30 AM',
      items: [{ name: "Handcrafted Brass Diya", price: 249, quantity: 1 }],
      totalAmount: 249,
      paymentMethod: 'UPI',
      status: 'Pending',
      notificationHistory: []
    }
  ];
}


// GET public client configuration loaded from .env
app.get('/api/config', (req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || ''
  });
});

// GET all orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await readOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read orders' });
  }
});

// POST new order
app.post('/api/orders', async (req, res) => {
  try {
    const orders = await readOrders();
    const orderData = req.body;

    let nextIdNum = 100013;
    if (orders.length > 0) {
      const ids = orders.map(o => { const m = o.id.match(/\d+/); return m ? parseInt(m[0], 10) : 100000; });
      nextIdNum = Math.max(...ids) + 1;
    }
    const now = new Date();
    const dateStr = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0') + ' ' +
      String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0') + ' ' +
      (now.getHours() >= 12 ? 'PM' : 'AM');

    const newOrder = {
      id: `VRB${nextIdNum}`,
      customerName: orderData.customerName || 'WhatsApp Customer',
      mobileNumber: orderData.mobileNumber || 'Via WhatsApp',
      address: orderData.address || 'Provided via WhatsApp',
      date: dateStr,
      items: orderData.items || [],
      totalAmount: orderData.totalAmount || 0,
      paymentMethod: orderData.paymentMethod || 'UPI/Cash',
      status: 'Pending',
      notificationHistory: []
    };

    await saveOrder(newOrder);
    res.status(201).json(newOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// PUT update existing order
app.put('/api/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const updatedOrder = req.body;
    await saveOrder(updatedOrder);
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});


// GET WhatsApp connection status
app.get('/api/whatsapp-status', (req, res) => {
  res.json({
    ready: waReady,
    hasQr: !!waQrDataUrl,
    initializing: waInitializing
  });
});

// GET WhatsApp QR code / status (supports Green API, UltraMsg, and local whatsapp-web.js)
app.get('/api/whatsapp-qr', (req, res) => {
  // Green API configured — free option, no QR needed from this panel
  if (process.env.GREEN_API_ID && process.env.GREEN_API_TOKEN) {
    return res.json({ ready: true, qr: null, provider: 'greenapi' });
  }
  // UltraMsg configured
  if (process.env.ULTRAMSG_INSTANCE_ID && process.env.ULTRAMSG_TOKEN) {
    return res.json({ ready: true, qr: null, provider: 'ultramsg' });
  }
  // Local whatsapp-web.js
  if (waReady) {
    return res.json({ ready: true, qr: null, provider: 'local' });
  }
  if (!waQrDataUrl) {
    return res.json({ ready: false, qr: null, message: 'QR not generated yet. Please wait...' });
  }
  res.json({ ready: false, qr: waQrDataUrl });
});

// POST send WhatsApp message
// Priority: Green API (free) → UltraMsg (paid) → local whatsapp-web.js → 503
app.post('/api/send-whatsapp', async (req, res) => {
  const { to, message } = req.body;
  if (!to || !message) {
    return res.status(400).json({ error: 'Missing phone number or message.' });
  }

  let cleanPhone = to.replace(/\D/g, '');
  if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

  // ── Option 1: Official Meta WhatsApp Cloud API ───────────────────────────
  const META_TOKEN = process.env.META_WHATSAPP_TOKEN;
  const META_PHONE_ID = process.env.META_PHONE_NUMBER_ID;
  if (META_TOKEN && META_PHONE_ID) {
    try {
      const https = require('https');
      const postData = JSON.stringify({
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'text',
        text: { body: message }
      });
      const options = {
        hostname: 'graph.facebook.com',
        path: `/v19.0/${META_PHONE_ID}/messages`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${META_TOKEN}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };
      const result = await new Promise((resolve, reject) => {
        const r2 = https.request(options, (r) => {
          let data = '';
          r.on('data', chunk => data += chunk);
          r.on('end', () => resolve({ status: r.statusCode, body: data }));
        });
        r2.on('error', reject);
        r2.write(postData);
        r2.end();
      });
      const body = JSON.parse(result.body);
      if (body.messages && body.messages[0]) {
        console.log(`[Meta API] ✅ Sent to +${cleanPhone}`);
        return res.json({ success: true, to: `+${cleanPhone}`, provider: 'meta' });
      }
      throw new Error(body.error?.message || JSON.stringify(body));
    } catch (err) {
      console.error('[Meta API] Send failed, falling back:', err.message);
    }
  }

  // ── Option 2: Green API — FREE (500 msgs/month, no credit card) ──────────
  const GREEN_ID    = process.env.GREEN_API_ID;
  const GREEN_TOKEN = process.env.GREEN_API_TOKEN;
  if (GREEN_ID && GREEN_TOKEN) {
    try {
      const https = require('https');
      const postData = JSON.stringify({ chatId: `${cleanPhone}@c.us`, message });
      const options = {
        hostname: 'api.green-api.com',
        path: `/waInstance${GREEN_ID}/sendMessage/${GREEN_TOKEN}`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
      };
      const result = await new Promise((resolve, reject) => {
        const r2 = https.request(options, (r) => {
          let data = '';
          r.on('data', chunk => data += chunk);
          r.on('end', () => resolve({ status: r.statusCode, body: data }));
        });
        r2.on('error', reject);
        r2.write(postData);
        r2.end();
      });
      const body = JSON.parse(result.body);
      if (body.idMessage) {
        console.log(`[GreenAPI] ✅ Sent to +${cleanPhone}`);
        return res.json({ success: true, to: `+${cleanPhone}`, provider: 'greenapi' });
      }
      throw new Error(body.message || JSON.stringify(body));
    } catch (err) {
      console.error('[GreenAPI] Send failed, falling back to next provider:', err.message);
    }
  }

  // ── Option 2: UltraMsg Cloud API ─────────────────────────────────────────
  const ULTRAMSG_INSTANCE = process.env.ULTRAMSG_INSTANCE_ID;
  const ULTRAMSG_TOKEN    = process.env.ULTRAMSG_TOKEN;
  if (ULTRAMSG_INSTANCE && ULTRAMSG_TOKEN) {
    try {
      const https = require('https');
      const postData = JSON.stringify({ token: ULTRAMSG_TOKEN, to: cleanPhone, body: message });
      const options = {
        hostname: 'api.ultramsg.com',
        path: `/${ULTRAMSG_INSTANCE}/messages/chat`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
      };
      const result = await new Promise((resolve, reject) => {
        const r2 = https.request(options, (r) => {
          let data = '';
          r.on('data', chunk => data += chunk);
          r.on('end', () => resolve({ status: r.statusCode, body: data }));
        });
        r2.on('error', reject);
        r2.write(postData);
        r2.end();
      });
      const body = JSON.parse(result.body);
      if (body.sent === 'true' || body.message === 'ok') {
        console.log(`[UltraMsg] ✅ Sent to +${cleanPhone}`);
        return res.json({ success: true, to: `+${cleanPhone}`, provider: 'ultramsg' });
      }
      throw new Error(body.error || JSON.stringify(body));
    } catch (err) {
      console.error('[UltraMsg] Send failed, falling back to local provider:', err.message);
    }
  }

  // ── Option 3: Local whatsapp-web.js ──────────────────────────────────────
  if (waReady && waClient) {
    try {
      await waClient.sendMessage(`${cleanPhone}@c.us`, message);
      console.log(`[WhatsApp] ✅ Message sent to +${cleanPhone}`);
      return res.json({ success: true, to: `+${cleanPhone}`, provider: 'local' });
    } catch (error) {
      console.error('[WhatsApp] Send error:', error.message);
      return res.status(500).json({ error: 'Failed to send message', details: error.message });
    }
  }

  // ── Option 4: Not connected ───────────────────────────────────────────────
  return res.status(503).json({
    error: 'WhatsApp not connected.',
    hint: process.env.VERCEL
      ? 'Add GREEN_API_ID + GREEN_API_TOKEN in Vercel Environment Variables (free at green-api.com).'
      : 'Scan the QR code in Admin → WhatsApp Setup tab.'
  });
});

// SEO Routes: Serve sitemap.xml, robots.txt, and manifest.json
app.get('/sitemap.xml', (req, res) => {
  res.header('Content-Type', 'application/xml');
  res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

app.get('/robots.txt', (req, res) => {
  res.header('Content-Type', 'text/plain');
  res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});

app.get('/manifest.json', (req, res) => {
  res.header('Content-Type', 'application/manifest+json');
  res.sendFile(path.join(__dirname, 'public', 'manifest.json'));
});

// Redirect clean routes to corresponding static HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/products', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'products.html'));
});

app.get('/rental', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'rental.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Redirect legacy .html routes to clean routes (SEO best practices)
app.get('/index.html', (req, res) => {
  res.redirect(301, '/');
});

app.get('/products.html', (req, res) => {
  res.redirect(301, '/products');
});

app.get('/rental.html', (req, res) => {
  res.redirect(301, '/rental');
});

app.get('/contact.html', (req, res) => {
  res.redirect(301, '/contact');
});

app.get('/login.html', (req, res) => {
  res.redirect(301, '/login');
});

app.get('/dashboard.html', (req, res) => {
  res.redirect(301, '/dashboard');
});

// Serve assets (CSS, JS, Images) from the public directory
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    // Disable caching to ensure updates are visible immediately
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  }
}));

// Fallback 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Local development: start HTTP server
// Vercel serverless: export the app as a module
if (process.env.VERCEL) {
  module.exports = app;
} else {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}
