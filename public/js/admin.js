// Admin Dashboard Logic

const DEFAULT_ITEMS = [];

// Global Categories State
let poojaCategories = [];
const defaultCategories = [
  "Brass Items",
  "Copper, Brass, German Silver",
  "Photo Frames",
  "Daily Essentials",
  "Rentals",
  "Decorative Items, Return Gifts"
];

function initCategories() {
  const saved = localStorage.getItem('pooja_custom_categories');
  if (saved) {
    try {
      poojaCategories = JSON.parse(saved);
    } catch (e) {
      poojaCategories = [...defaultCategories];
    }
  } else {
    poojaCategories = [...defaultCategories];
  }
  renderCategoryDatalist();
}

function renderCategoryDatalist() {
  const dl = document.getElementById('categoryOptions');
  if (!dl) return;
  dl.innerHTML = '';
  poojaCategories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    dl.appendChild(opt);
  });
}

function deleteCurrentCategory() {
  const input = document.getElementById('itemCategory');
  const cat = input.value.trim();
  if (!cat) {
    showToast('Please type or select a category to delete.', 'error');
    return;
  }
  if (confirm(`Are you sure you want to remove "${cat}" from the category suggestions?`)) {
    poojaCategories = poojaCategories.filter(c => c.toLowerCase() !== cat.toLowerCase());
    localStorage.setItem('pooja_custom_categories', JSON.stringify(poojaCategories));
    renderCategoryDatalist();
    input.value = '';
    showToast(`Removed "${cat}" from suggestions.`);
  }
}

const DEFAULT_ORDERS = [
  {
    id: 'VRB100001',
    customerName: 'Rajesh Patel',
    mobileNumber: '9845012345',
    address: '45, 2nd Main, Indiranagar, Bangalore - 560038',
    date: '2026-06-28 10:30 AM',
    items: [
      { name: 'Handcrafted Brass Diya (Pair)', price: 249, quantity: 1 },
      { name: 'Daily Pooja Essentials Kit', price: 149, quantity: 2 }
    ],
    totalAmount: 547,
    paymentMethod: 'UPI',
    status: 'Pending',
    notificationHistory: []
  },
  {
    id: 'VRB100002',
    customerName: 'Lakshmi Narasimhan',
    mobileNumber: '9731234567',
    address: 'Flat 302, Sai Residency, Malleshwaram, Bangalore - 560003',
    date: '2026-06-28 11:15 AM',
    items: [
      { name: 'Ornate Brass Pooja Handbell', price: 179, quantity: 1 },
      { name: 'Goddess Lakshmi Gold-Plated Frame', price: 199, quantity: 1 }
    ],
    totalAmount: 378,
    paymentMethod: 'Cash',
    status: 'Confirmed',
    notificationHistory: [
      {
        type: 'CONFIRMED',
        sentTime: '2026-06-28 11:20 AM',
        status: 'Sent',
        mobile: '9731234567',
        message: '🙏 Veerabhadra Pooja Store\n\nHello Lakshmi Narasimhan,\n\nYour order has been confirmed.\n\nOrder ID:\nVRB100002\n\nItems:\n- Ornate Brass Pooja Handbell x 1\n- Goddess Lakshmi Gold-Plated Frame x 1\n\nWe are preparing your order.\n\nThank you.'
      }
    ]
  },
  {
    id: 'VRB100003',
    customerName: 'Amit Sharma',
    mobileNumber: '8123456789',
    address: '78/A, 10th Cross, Jayanagar, Bangalore - 560041',
    date: '2026-06-27 03:45 PM',
    items: [
      { name: 'Vratam Peta Setup Kit', price: 299, quantity: 1 }
    ],
    totalAmount: 799,
    paymentMethod: 'Card',
    status: 'Preparing',
    notificationHistory: [
      {
        type: 'CONFIRMED',
        sentTime: '2026-06-27 03:50 PM',
        status: 'Sent',
        mobile: '8123456789',
        message: '🙏 Veerabhadra Pooja Store\n\nHello Amit Sharma,\n\nYour order has been confirmed.\n\nOrder ID:\nVRB100003\n\nItems:\n- Vratam Peta Setup Kit x 1\n\nWe are preparing your order.\n\nThank you.'
      }
    ]
  },
  {
    id: 'VRB100004',
    customerName: 'Priya Sridhar',
    mobileNumber: '9008012345',
    address: '12, Temple Street, Basavanagudi, Bangalore - 560004',
    date: '2026-06-27 09:00 AM',
    items: [
      { name: 'Pure Copper Pooja Kalash', price: 349, quantity: 1 },
      { name: 'Traditional Copper Pooja Lota', price: 279, quantity: 1 },
      { name: 'Premium Sandalwood Paste', price: 99, quantity: 3 }
    ],
    totalAmount: 925,
    paymentMethod: 'UPI',
    status: 'Packed',
    notificationHistory: [
      {
        type: 'CONFIRMED',
        sentTime: '2026-06-27 09:10 AM',
        status: 'Sent',
        mobile: '9008012345',
        message: '🙏 Veerabhadra Pooja Store\n\nHello Priya Sridhar,\n\nYour order has been confirmed.\n\nOrder ID:\nVRB100004\n\nItems:\n- Pure Copper Pooja Kalash x 1\n- Traditional Copper Pooja Lota x 1\n- Premium Sandalwood Paste x 3\n\nWe are preparing your order.\n\nThank you.'
      },
      {
        type: 'PACKED',
        sentTime: '2026-06-27 11:30 AM',
        status: 'Sent',
        mobile: '9008012345',
        message: '📦 Veerabhadra Pooja Store\n\nHello Priya Sridhar,\n\nYour order has been packed successfully.\n\nOrder ID:\nVRB100004\n\nItems:\n- Pure Copper Pooja Kalash x 1\n- Traditional Copper Pooja Lota x 1\n- Premium Sandalwood Paste x 3\n\nYour order is ready for pickup.\n\nPlease visit our store during business hours.\n\nThank you.'
      }
    ]
  },
  {
    id: 'VRB100005',
    customerName: 'Venkat Rao',
    mobileNumber: '9448098765',
    address: '204, Vaikunta Apartments, Rajajinagar, Bangalore - 560010',
    date: '2026-06-26 05:20 PM',
    items: [
      { name: 'Lord Ganesha Gold-Plated Frame', price: 199, quantity: 2 }
    ],
    totalAmount: 398,
    paymentMethod: 'UPI',
    status: 'Ready for Pickup',
    notificationHistory: [
      {
        type: 'CONFIRMED',
        sentTime: '2026-06-26 05:30 PM',
        status: 'Sent',
        mobile: '9448098765',
        message: '🙏 Veerabhadra Pooja Store\n\nHello Venkat Rao,\n\nYour order has been confirmed.\n\nOrder ID:\nVRB100005\n\nItems:\n- Lord Ganesha Gold-Plated Frame x 2\n\nWe are preparing your order.\n\nThank you.'
      },
      {
        type: 'PACKED',
        sentTime: '2026-06-26 06:15 PM',
        status: 'Sent',
        mobile: '9448098765',
        message: '📦 Veerabhadra Pooja Store\n\nHello Venkat Rao,\n\nYour order has been packed successfully.\n\nOrder ID:\nVRB100005\n\nItems:\n- Lord Ganesha Gold-Plated Frame x 2\n\nYour order is ready for pickup.\n\nPlease visit our store during business hours.\n\nThank you.'
      },
      {
        type: 'READY FOR PICKUP',
        sentTime: '2026-06-27 10:00 AM',
        status: 'Sent',
        mobile: '9448098765',
        message: '📍 Veerabhadra Pooja Store\n\nYour order is now ready for pickup.\n\nOrder ID:\nVRB100005\n\nItems:\n- Lord Ganesha Gold-Plated Frame x 2\n\nPlease collect your order from the store.\n\nThank you.'
      }
    ]
  },
  {
    id: 'VRB100006',
    customerName: 'Sunitha Hegde',
    mobileNumber: '9880123456',
    address: '56, Coconut Grove Road, Koramangala, Bangalore - 560034',
    date: '2026-06-25 11:00 AM',
    items: [
      { name: 'Daily Pooja Essentials Kit', price: 149, quantity: 1 },
      { name: 'Organic Camphor Tablets (100g)', price: 79, quantity: 2 }
    ],
    totalAmount: 307,
    paymentMethod: 'UPI',
    status: 'Delivered',
    notificationHistory: [
      {
        type: 'CONFIRMED',
        sentTime: '2026-06-25 11:15 AM',
        status: 'Sent',
        mobile: '9880123456',
        message: '🙏 Veerabhadra Pooja Store\n\nHello Sunitha Hegde,\n\nYour order has been confirmed.\n\nOrder ID:\nVRB100006\n\nItems:\n- Daily Pooja Essentials Kit x 1\n- Organic Camphor Tablets (100g) x 2\n\nWe are preparing your order.\n\nThank you.'
      },
      {
        type: 'PACKED',
        sentTime: '2026-06-25 01:30 PM',
        status: 'Sent',
        mobile: '9880123456',
        message: '📦 Veerabhadra Pooja Store\n\nHello Sunitha Hegde,\n\nYour order has been packed successfully.\n\nOrder ID:\nVRB100006\n\nItems:\n- Daily Pooja Essentials Kit x 1\n- Organic Camphor Tablets (100g) x 2\n\nYour order is ready for pickup.\n\nPlease visit our store during business hours.\n\nThank you.'
      },
      {
        type: 'READY FOR PICKUP',
        sentTime: '2026-06-25 03:00 PM',
        status: 'Sent',
        mobile: '9880123456',
        message: '📍 Veerabhadra Pooja Store\n\nYour order is now ready for pickup.\n\nOrder ID:\nVRB100006\n\nItems:\n- Daily Pooja Essentials Kit x 1\n- Organic Camphor Tablets (100g) x 2\n\nPlease collect your order from the store.\n\nThank you.'
      },
      {
        type: 'DELIVERED',
        sentTime: '2026-06-25 04:30 PM',
        status: 'Sent',
        mobile: '9880123456',
        message: '🙏 Thank You\n\nYour order has been successfully delivered.\n\nOrder ID:\nVRB100006\n\nItems:\n- Daily Pooja Essentials Kit x 1\n- Organic Camphor Tablets (100g) x 2\n\nThank you for shopping with Veerabhadra Pooja Store.\n\nWe hope to serve you again.\n\nPlease share your valuable feedback.'
      }
    ]
  },
  {
    id: 'VRB100007',
    customerName: 'Vikram Singh',
    mobileNumber: '7022099887',
    address: 'Flat 101, Prestige Heights, Whitefield, Bangalore - 560066',
    date: '2026-06-25 02:30 PM',
    items: [
      { name: 'Engraved Brass Aarti Plate', price: 299, quantity: 1 }
    ],
    totalAmount: 299,
    paymentMethod: 'Card',
    status: 'Cancelled',
    notificationHistory: []
  },
  {
    id: 'VRB100008',
    customerName: 'Ananth Prasad',
    mobileNumber: '9663123456',
    address: '15, Sri Rama Temple St, Banashankari, Bangalore - 560085',
    date: '2026-06-24 09:15 AM',
    items: [
      { name: 'Pure Copper Pooja Kalash', price: 349, quantity: 2 }
    ],
    totalAmount: 698,
    paymentMethod: 'UPI',
    status: 'Delivered',
    notificationHistory: [
      {
        type: 'DELIVERED',
        sentTime: '2026-06-24 05:00 PM',
        status: 'Sent',
        mobile: '9663123456',
        message: '🙏 Thank You\n\nYour order has been successfully delivered.\n\nOrder ID:\nVRB100008\n\nItems:\n- Pure Copper Pooja Kalash x 2\n\nThank you for shopping with Veerabhadra Pooja Store.\n\nWe hope to serve you again.\n\nPlease share your valuable feedback.'
      }
    ]
  },
  {
    id: 'VRB100009',
    customerName: 'Deepa Rao',
    mobileNumber: '8971098765',
    address: '89, 4th Block, HSR Layout, Bangalore - 560102',
    date: '2026-06-24 11:45 AM',
    items: [
      { name: 'Premium Sandalwood Paste (Chandanam)', price: 99, quantity: 5 }
    ],
    totalAmount: 495,
    paymentMethod: 'UPI',
    status: 'Delivered',
    notificationHistory: [
      {
        type: 'DELIVERED',
        sentTime: '2026-06-24 03:00 PM',
        status: 'Sent',
        mobile: '8971098765',
        message: '🙏 Thank You\n\nYour order has been successfully delivered.\n\nOrder ID:\nVRB100009\n\nItems:\n- Premium Sandalwood Paste (Chandanam) x 5\n\nThank you for shopping with Veerabhadra Pooja Store.\n\nWe hope to serve you again.\n\nPlease share your valuable feedback.'
      }
    ]
  },
  {
    id: 'VRB100010',
    customerName: 'Kiran Gowda',
    mobileNumber: '9844112233',
    address: '10, 1st Cross, Vijayanagar, Bangalore - 560040',
    date: '2026-06-23 04:30 PM',
    items: [
      { name: 'Traditional Copper Pooja Lota', price: 279, quantity: 1 },
      { name: 'Organic Camphor Tablets (100g)', price: 79, quantity: 3 }
    ],
    totalAmount: 516,
    paymentMethod: 'Cash',
    status: 'Cancelled',
    notificationHistory: []
  },
  {
    id: 'VRB100011',
    customerName: 'Sujatha Iyer',
    mobileNumber: '9900223344',
    address: '77, Margosa Road, Malleshwaram, Bangalore - 560003',
    date: '2026-06-23 10:00 AM',
    items: [
      { name: 'Lord Ganesha Gold-Plated Frame', price: 199, quantity: 1 },
      { name: 'Goddess Lakshmi Gold-Plated Frame', price: 199, quantity: 1 }
    ],
    totalAmount: 398,
    paymentMethod: 'UPI',
    status: 'Delivered',
    notificationHistory: [
      {
        type: 'DELIVERED',
        sentTime: '2026-06-23 04:00 PM',
        status: 'Sent',
        mobile: '9900223344',
        message: '🙏 Thank You\n\nYour order has been successfully delivered.\n\nOrder ID:\nVRB100011\n\nItems:\n- Lord Ganesha Gold-Plated Frame x 1\n- Goddess Lakshmi Gold-Plated Frame x 1\n\nThank you for shopping with Veerabhadra Pooja Store.\n\nWe hope to serve you again.\n\nPlease share your valuable feedback.'
      }
    ]
  },
  {
    id: 'VRB100012',
    customerName: 'Prashanth Bhat',
    mobileNumber: '9845099887',
    address: 'Flat A102, Shanthi Niketan, Vidyaranyapura, Bangalore - 560097',
    date: '2026-06-22 02:15 PM',
    items: [
      { name: 'Daily Pooja Essentials Kit', price: 149, quantity: 4 }
    ],
    totalAmount: 596,
    paymentMethod: 'UPI',
    status: 'Delivered',
    notificationHistory: [
      {
        type: 'DELIVERED',
        sentTime: '2026-06-22 06:00 PM',
        status: 'Sent',
        mobile: '9845099887',
        message: '🙏 Thank You\n\nYour order has been successfully delivered.\n\nOrder ID:\nVRB100012\n\nItems:\n- Daily Pooja Essentials Kit x 4\n\nThank you for shopping with Veerabhadra Pooja Store.\n\nWe hope to serve you again.\n\nPlease share your valuable feedback.'
      }
    ]
  }
];

let items = [];
let orders = [];

// Orders filter, search and pagination state
let activeOrderFilter = 'all';
let currentOrderPage = 1;
let ordersPerPage = 10;
let orderSearchQuery = {
  id: '',
  name: '',
  mobile: ''
};

// Pending status change target
let orderStatusChangeTarget = {
  orderId: '',
  newStatus: ''
};

// Initialize Page
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.hash && window.location.hash.includes('access_token')) {
    window.history.replaceState(null, null, window.location.pathname);
  }
  initData();
  initCategories();
  checkAuth();
  setupEventListeners();
  initUploadZone();

  if (typeof supabaseClient !== 'undefined' && supabaseClient.auth) {
    supabaseClient.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        checkAuth();
      }
    });
  }
});


// Load items from Supabase and orders from Supabase cloud database
async function initData() {
  try {
    const { data, error } = await supabaseClient
      .from('orders')
      .select('items')
      .eq('id', '00000000-0000-0000-0000-000000000000')
      .single();
    
    if (!error && data && data.items && data.items.length > 0) {
      items = data.items;
    } else {
      items = [...DEFAULT_ITEMS];
      saveData();
    }
  } catch (err) {
    console.error('Error fetching products API:', err);
    items = [...DEFAULT_ITEMS];
  }

  // Load orders from Supabase
  try {
    const { data, error } = await supabaseClient
      .from('orders')
      .select('*')
      .neq('status', 'Draft')
      .order('created_at', { ascending: false });

    if (!error && data) {
      orders = data.map(row => ({
        id: row.id,
        customerName: row.customer_name,
        mobileNumber: row.mobile_number,
        address: row.address,
        date: row.order_date,
        items: row.items || [],
        totalAmount: row.total_amount,
        paymentMethod: row.payment_method,
        status: row.status,
        notificationHistory: row.notification_history || []
      }));
    } else {
      console.error('Supabase fetch error:', error);
      orders = [];
    }
  } catch (err) {
    console.error('Error fetching orders from Supabase:', err);
    orders = [];
  }
  
  // Render views after asynchronous retrieval
  renderOrders();
  renderDashboard();
}

async function saveData() {
  localStorage.setItem('pooja_store_items', JSON.stringify(items)); // Keep local fallback
  try {
    await supabaseClient.from('orders').upsert({
      id: '00000000-0000-0000-0000-000000000000',
      customer_name: '__SYSTEM_PRODUCTS__',
      items: items,
      status: 'Draft'
    });
  } catch (err) {
    console.error('Error saving products API:', err);
  }
}

async function saveOrdersToServer(order) {
  try {
    const { error } = await supabaseClient
      .from('orders')
      .update({
        status: order.status,
        notification_history: order.notificationHistory || []
      })
      .eq('id', order.id);

    if (error) {
      console.error('Supabase update error:', error);
    }
  } catch (err) {
    console.error('Error updating order in Supabase:', err);
  }
}

// Authentication Handlers (Supabase Auth Only)
async function checkAuth() {
  const loginSection = document.getElementById('loginSection');
  const dashboardSection = document.getElementById('dashboardLayout');

  if (typeof supabaseClient === 'undefined') {
    console.error('Supabase client unavailable.');
    if (loginSection) loginSection.style.display = 'flex';
    if (dashboardSection) dashboardSection.style.display = 'none';
    return;
  }

  try {
    const { data: { session }, error } = await supabaseClient.auth.getSession();

    if (!error && session && session.user) {
      if (loginSection) loginSection.style.display = 'none';
      if (dashboardSection) dashboardSection.style.display = 'flex';
      
      const adminNameEl = document.querySelector('.user-profile span:last-child');
      if (adminNameEl && session.user.email) {
        adminNameEl.textContent = session.user.email;
      }
      switchTab('dashboard');
    } else {
      if (loginSection) loginSection.style.display = 'flex';
      if (dashboardSection) dashboardSection.style.display = 'none';
    }
  } catch (err) {
    console.error('Auth verification error:', err);
    if (loginSection) loginSection.style.display = 'flex';
    if (dashboardSection) dashboardSection.style.display = 'none';
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const email = emailInput ? emailInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value : '';
  const errorEl = document.getElementById('loginError');
  const submitBtn = e.target.querySelector('button[type="submit"]');

  if (!email || !password) {
    if (errorEl) {
      errorEl.textContent = 'Please enter both email and password.';
      errorEl.style.display = 'block';
    }
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';
  }

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      if (errorEl) {
        errorEl.textContent = error.message || 'Invalid email or password.';
        errorEl.style.display = 'block';
      }
      showToast('Login failed: ' + (error.message || 'Invalid credentials'));
    } else if (data && data.session) {
      if (errorEl) errorEl.style.display = 'none';
      await checkAuth();
      showToast('Welcome back, Admin!');
    }
  } catch (err) {
    console.error('Supabase Admin Login Error:', err);
    if (errorEl) {
      errorEl.textContent = 'Failed to connect to Supabase Auth. Please check connection.';
      errorEl.style.display = 'block';
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';
    }
  }
}

// Admin Google OAuth Login Handler
async function handleAdminGoogleLogin() {
  if (typeof supabaseClient === 'undefined') {
    showToast('Supabase client unavailable.');
    return;
  }

  const btn = document.getElementById('adminGoogleBtn');
  if (btn) {
    btn.disabled = true;
    btn.style.opacity = '0.7';
    btn.innerHTML = '<span>Redirecting to Google...</span>';
  }

  try {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/admin'
      }
    });

    if (error) {
      const errorEl = document.getElementById('loginError');
      if (errorEl) {
        errorEl.textContent = 'Google Login Error: ' + error.message;
        errorEl.style.display = 'block';
      }
      showToast('Google login error: ' + error.message);
    } else if (data && data.url) {
      window.location.href = data.url;
    }
  } catch (err) {
    console.error('Google Admin OAuth Exception:', err);
    showToast('Failed to initialize Google Sign-In.');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg><span>Continue with Google</span>`;
    }
  }
}

async function handleLogout() {
  try {
    if (typeof supabaseClient !== 'undefined') {
      await supabaseClient.auth.signOut();
    }
  } catch (err) {
    console.error('Logout error:', err);
  }
  showToast('Logged out successfully.');
  await checkAuth();
}

window.handleAdminGoogleLogin = handleAdminGoogleLogin;



// Product Variants & Custom Quantities Helpers
function toggleVariantsSection() {
  const hasVariants = document.getElementById('hasVariants').checked;
  const section = document.getElementById('variantsSection');
  const mrpInput = document.getElementById('itemMrp');
  const priceInput = document.getElementById('itemPrice');
  
  if (section) section.style.display = hasVariants ? 'block' : 'none';
  
  if (hasVariants) {
    if (mrpInput) mrpInput.removeAttribute('required');
    if (priceInput) priceInput.removeAttribute('required');
    const salePriceFields = document.getElementById('salePriceFields');
    if (salePriceFields) salePriceFields.style.opacity = '0.5';
  } else {
    if (mrpInput) mrpInput.setAttribute('required', 'required');
    if (priceInput) priceInput.setAttribute('required', 'required');
    const salePriceFields = document.getElementById('salePriceFields');
    if (salePriceFields) salePriceFields.style.opacity = '1.0';
  }
}

function addVariantRow(name = '', mrp = '', price = '') {
  const list = document.getElementById('variantsList');
  if (!list) return;
  
  const rowId = 'variant-row-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  const row = document.createElement('div');
  row.id = rowId;
  row.className = 'variant-row';
  row.style.cssText = 'display: grid; grid-template-columns: 1fr 1.4fr 1fr 1fr auto; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem;';

  // Parse existing name back into qty + unit if editing
  // e.g. "250g Packet" -> qty="250g", unit="Packet"
  // e.g. "1 Box" -> qty="1", unit="Box"
  // e.g. "100g" -> qty="100g", unit="" (just qty, no unit)
  const KNOWN_UNITS = ['g', 'kg', 'ml', 'L', 'Box', 'Packet', 'Piece', 'Pair', 'Set', 'Jar', 'Bottle', 'Bundle', 'Cup', 'Bag', 'Cone', 'Stick', 'Roll'];
  let parsedQty = name;
  let parsedUnit = '';
  if (name) {
    // Try to split on last space to find unit
    const lastSpace = name.lastIndexOf(' ');
    if (lastSpace > 0) {
      const possibleUnit = name.substring(lastSpace + 1);
      if (KNOWN_UNITS.includes(possibleUnit)) {
        parsedQty = name.substring(0, lastSpace);
        parsedUnit = possibleUnit;
      }
    }
  }

  const unitOptions = ['g', 'kg', 'ml', 'L', 'Box', 'Packet', 'Piece', 'Pair', 'Set', 'Jar', 'Bottle', 'Bundle', 'Cup', 'Bag', 'Cone', 'Stick', 'Roll', 'Custom...'];
  const unitOptionsHtml = unitOptions.map(u => {
    const isCustom = u === 'Custom...';
    const selected = (!isCustom && u === parsedUnit) ? 'selected' : '';
    const val = isCustom ? '__custom__' : u;
    return `<option value="${val}" ${selected}>${u}</option>`;
  }).join('');

  // If parsedUnit wasn't in known list, it's custom
  const isCustomUnit = parsedUnit && !KNOWN_UNITS.includes(parsedUnit);
  const customUnitValue = isCustomUnit ? parsedUnit : '';
  const showCustom = isCustomUnit;

  row.innerHTML = `
    <input type="text" class="form-input variant-qty-input" placeholder="e.g. 100, 250, 1" value="${parsedQty}" required style="padding: 0.4rem 0.6rem; font-size: 0.85rem;">
    <div style="display: flex; flex-direction: column; gap: 3px;">
      <select class="form-input variant-unit-select" onchange="toggleCustomUnit(this)" style="padding: 0.4rem 0.5rem; font-size: 0.82rem; cursor: pointer;">
        <option value="">-- Select Unit --</option>
        ${unitOptionsHtml}
      </select>
      <input type="text" class="form-input variant-unit-custom" placeholder="Type unit e.g. Tray" value="${customUnitValue}" style="padding: 0.35rem 0.5rem; font-size: 0.8rem; display: ${showCustom ? 'block' : 'none'};">
    </div>
    <input type="number" class="form-input variant-mrp-input" placeholder="MRP" value="${mrp}" required style="padding: 0.4rem 0.6rem; font-size: 0.85rem;" min="0">
    <input type="number" class="form-input variant-price-input" placeholder="Price" value="${price}" required style="padding: 0.4rem 0.6rem; font-size: 0.85rem;" min="0">
    <button type="button" onclick="removeVariantRow('${rowId}')" style="background: none; border: none; color: var(--color-danger); cursor: pointer; font-size: 1.25rem; padding: 0.25rem; line-height: 1;">&times;</button>
  `;

  // If parsedUnit was custom, select the "Custom..." option
  if (isCustomUnit) {
    const sel = row.querySelector('.variant-unit-select');
    if (sel) sel.value = '__custom__';
  }

  list.appendChild(row);
}

function removeVariantRow(id) {
  const row = document.getElementById(id);
  if (row) row.remove();
}

function toggleCustomUnit(selectEl) {
  const customInput = selectEl.parentElement.querySelector('.variant-unit-custom');
  if (customInput) {
    customInput.style.display = selectEl.value === '__custom__' ? 'block' : 'none';
    if (selectEl.value !== '__custom__') customInput.value = '';
  }
}

// Sidebar Menu Navigation & History Tracking
let tabHistory = [];

function goBackTab() {
  if (tabHistory.length > 0) {
    const prevTab = tabHistory.pop();
    switchTab(prevTab, false);
  }
}

function switchTab(tabId, pushToHistory = true) {
  // Save current active tab to history before switching
  const activeSection = document.querySelector('.panel-section.active');
  if (activeSection && pushToHistory) {
    const activeTabId = activeSection.id.replace('Section', '');
    if (activeTabId !== tabId) {
      // Don't accumulate redundant consecutive duplicates in history
      if (tabHistory[tabHistory.length - 1] !== activeTabId) {
        tabHistory.push(activeTabId);
      }
    }
  }

  // Toggle visibility of back navigation arrows
  const hasHistory = tabHistory.length > 0;
  const desktopBack = document.getElementById('desktopBackBtn');
  const mobileBack = document.getElementById('mobileBackBtn');
  if (desktopBack) desktopBack.style.display = hasHistory ? 'inline-flex' : 'none';
  if (mobileBack) mobileBack.style.display = hasHistory ? 'inline-flex' : 'none';

  // Hide all sections
  document.querySelectorAll('.panel-section').forEach(section => {
    section.classList.remove('active');
  });

  // Remove active sidebar link classes
  document.querySelectorAll('.sidebar-menu .menu-item').forEach(item => {
    item.classList.remove('active');
  });

  // Activate chosen section & sidebar menu highlight
  const targetSection = document.getElementById(tabId + 'Section');
  if (targetSection) targetSection.classList.add('active');

  const menuLink = document.querySelector(`.menu-item a[onclick*="switchTab('${tabId}')"]`);
  if (menuLink) {
    menuLink.parentElement.classList.add('active');
  }

  // Update Main Header Title & Mobile Header Title
  const headerTitle = document.getElementById('headerTitle');
  const mobileHeaderTitle = document.getElementById('mobileHeaderTitle');
  
  let newTitle = '';
  if (tabId === 'dashboard') newTitle = 'Dashboard Overview';
  else if (tabId === 'products') newTitle = 'Product Inventory';
  else if (tabId === 'rentals') newTitle = 'Rental Inventory';
  else if (tabId === 'orders') newTitle = 'Order Management';
  else if (tabId === 'whatsapp-setup') newTitle = 'WhatsApp Automation';
  else if (tabId === 'add-item') {
    const isEditing = document.getElementById('itemId').value !== '';
    newTitle = isEditing ? 'Edit Item Details' : 'Add New Inventory Item';
    
    // Hide ratings when adding a new item, show when editing
    const ratingGroup = document.getElementById('itemRatingGroup');
    if (ratingGroup) {
      ratingGroup.style.display = isEditing ? 'block' : 'none';
    }
  }

  if (headerTitle) {
    headerTitle.textContent = newTitle;
  }
  if (mobileHeaderTitle) {
    // Show store name on dashboard, and sub-page titles on other views
    mobileHeaderTitle.textContent = tabId === 'dashboard' ? 'Veerabhadra Store' : newTitle;
  }

  // Close Mobile Menu on Click
  closeMobileMenu();

  // Route specific rendering updates
  if (tabId === 'dashboard') renderDashboard();
  else if (tabId === 'products') renderProducts();
  else if (tabId === 'rentals') renderRentals();
  else if (tabId === 'orders') renderOrders();
  else if (tabId === 'whatsapp-setup') startWaStatusPolling();
}

// ─── WhatsApp Setup Panel Logic ───────────────────────────────────────────────
let waStatusPollInterval = null;

function startWaStatusPolling() {
  // Immediately fetch
  fetchWaStatus();
  // Poll every 3 seconds while tab is visible
  if (waStatusPollInterval) clearInterval(waStatusPollInterval);
  waStatusPollInterval = setInterval(() => {
    // Stop polling if user navigated away
    const section = document.getElementById('whatsapp-setupSection');
    if (!section || !section.classList.contains('active')) {
      clearInterval(waStatusPollInterval);
      waStatusPollInterval = null;
      return;
    }
    fetchWaStatus();
  }, 3000);
}

async function fetchWaStatus() {
  try {
    const res = await fetch('/api/whatsapp-qr');
    const data = await res.json();
    updateWaStatusUi(data);
  } catch (e) {
    updateWaStatusUi({ ready: false, qr: null, error: true });
  }
}

function updateWaStatusUi(data) {
  const dot = document.getElementById('waStatusDot');
  const title = document.getElementById('waStatusTitle');
  const desc = document.getElementById('waStatusDesc');
  const qrArea = document.getElementById('waQrArea');
  const qrImg = document.getElementById('waQrImage');

  if (!dot || !title || !desc) return;

  if (data.ready) {
    dot.style.background = '#22c55e';
    if (data.provider === 'greenapi') {
      title.textContent = '✅ WhatsApp Connected via Green API (Free)!';
      desc.textContent = '500 free messages/month active. Order updates send automatically on Vercel.';
    } else if (data.provider === 'ultramsg') {
      title.textContent = '✅ WhatsApp Connected via UltraMsg!';
      desc.textContent = 'Cloud messaging is active. Order status messages send automatically on Vercel.';
    } else {
      title.textContent = '✅ WhatsApp Connected!';
      desc.textContent = 'Automated messages are active. Status updates will send automatically.';
    }
    if (qrArea) qrArea.style.display = 'none';
    if (waStatusPollInterval) { clearInterval(waStatusPollInterval); waStatusPollInterval = null; }
  } else if (data.qr) {
    dot.style.background = '#f59e0b';
    title.textContent = '📱 Scan QR Code to Connect';
    desc.textContent = 'Open WhatsApp on your phone and scan the QR code below.';
    if (qrArea) qrArea.style.display = 'block';
    if (qrImg) qrImg.src = data.qr;
  } else if (data.error) {
    dot.style.background = '#ef4444';
    title.textContent = '❌ Server Unreachable';
    desc.textContent = 'Could not connect to server. Make sure the server is running.';
  } else {
    dot.style.background = '#f59e0b';
    title.textContent = '⏳ Initializing WhatsApp...';
    desc.textContent = data.message || 'WhatsApp client is starting up. QR code will appear shortly.';
    if (qrArea) qrArea.style.display = 'none';
  }
}
// ─────────────────────────────────────────────────────────────────────────────

// Bind Element Event Listeners
function setupEventListeners() {
  // Login Form submit
  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);

  // Form conditional fields based on Sale/Rental selection
  const typeSelect = document.getElementById('itemType');
  if (typeSelect) {
    typeSelect.addEventListener('change', toggleFormFields);
  }

  // Item form submit
  const itemForm = document.getElementById('itemForm');
  if (itemForm) itemForm.addEventListener('submit', handleFormSubmit);

  // Mobile Menu toggle interactions
  const menuBtn = document.getElementById('mobileMenuToggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  if (menuBtn && sidebar && overlay) {
    const toggleMenu = () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    };

    menuBtn.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);
  }
}

function closeMobileMenu() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar && overlay) {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
  }
}

// Toggle sale/rental form fields
function toggleFormFields() {
  const type = document.getElementById('itemType').value;
  const saleFields = document.getElementById('salePriceFields');
  const rentalFields = document.getElementById('rentalPriceFields');
  const rentalDimensions = document.getElementById('rentalDimensionsFields');
  const variantsCheckboxGroup = document.getElementById('variantsCheckboxGroup');
  const variantsSection = document.getElementById('variantsSection');

  if (type === 'rental') {
    saleFields.style.display = 'none';
    rentalFields.style.display = 'block';
    if (rentalDimensions) rentalDimensions.style.display = 'grid';
    
    // Hide variants configuration since rentals do not have custom quantities
    if (variantsCheckboxGroup) variantsCheckboxGroup.style.display = 'none';
    if (variantsSection) variantsSection.style.display = 'none';
    const hasVariantsCheckbox = document.getElementById('hasVariants');
    if (hasVariantsCheckbox) {
      hasVariantsCheckbox.checked = false;
    }
    toggleVariantsSection();

    document.getElementById('itemMrp').required = false;
    document.getElementById('itemPrice').required = false;
    document.getElementById('rentalPrice').required = true;
    
    const heightInput = document.getElementById('rentalHeight');
    const widthInput = document.getElementById('rentalWidth');
    if (heightInput) heightInput.required = true;
    if (widthInput) widthInput.required = true;
  } else {
    saleFields.style.display = 'block';
    rentalFields.style.display = 'none';
    if (rentalDimensions) rentalDimensions.style.display = 'none';
    
    // Show variants configuration for sale items
    if (variantsCheckboxGroup) variantsCheckboxGroup.style.display = 'block';
    // Let toggleVariantsSection handle variantsSection display based on checkbox state
    toggleVariantsSection();

    document.getElementById('itemMrp').required = true;
    document.getElementById('itemPrice').required = true;
    document.getElementById('rentalPrice').required = false;
    
    const heightInput = document.getElementById('rentalHeight');
    const widthInput = document.getElementById('rentalWidth');
    if (heightInput) heightInput.required = false;
    if (widthInput) widthInput.required = false;
  }
}

// Toast Alert display helper
function showToast(message) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = '⚡ ' + message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

// 1. Render Dashboard tab
function renderDashboard() {
  const totalProducts = items.filter(i => i.type === 'sale').length;
  const totalRentals = items.filter(i => i.type === 'rental').length;
  const activeOrdersCount = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;

  document.getElementById('totalProductsCount').textContent = totalProducts;
  document.getElementById('totalRentalsCount').textContent = totalRentals;
  
  const totalOrdersCountEl = document.getElementById('totalOrdersCount');
  if (totalOrdersCountEl) {
    totalOrdersCountEl.textContent = activeOrdersCount;
  }

  const recentListContainer = document.getElementById('recentActivityList');
  if (!recentListContainer) return;

  // Show last 4 items (reverse order of array)
  const recentItems = [...items].slice(-4).reverse();
  
  if (recentItems.length === 0) {
    recentListContainer.innerHTML = '<p style="text-align:center; padding:1.5rem; color:var(--color-text-muted);">No items in inventory.</p>';
    return;
  }

  recentListContainer.innerHTML = recentItems.map(item => `
    <div class="recent-item-row">
      <div class="recent-item-info">
        <img src="${item.image || 'images/brass-diya.png'}" alt="" class="recent-item-img">
        <div class="recent-item-details">
          <div class="name">${item.name}</div>
          <div class="meta">${item.type === 'rental' ? 'Rental Setup' : 'For Sale'} • ${item.category || 'Pooja Essentials'}</div>
        </div>
      </div>
      <div class="recent-item-price">
        ₹${item.type === 'rental' ? item.price + '/day' : item.price}
      </div>
    </div>
  `).join('');
}

let productSearchQuery = '';

function handleProductSearch() {
  const input = document.getElementById('searchProductName');
  if (input) {
    productSearchQuery = input.value.trim().toLowerCase();
  }
  renderProducts();
}

function clearProductSearch() {
  const input = document.getElementById('searchProductName');
  if (input) {
    input.value = '';
    productSearchQuery = '';
  }
  renderProducts();
}

function highlightText(text, query) {
  if (!query) return text;
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  return text.replace(regex, '<mark class="search-highlight" style="background-color: rgba(251, 191, 36, 0.3); color: #b45309; padding: 0 2px; border-radius: 3px; font-weight: 600;">$1</mark>');
}

// 2. Render Products list tab
function renderProducts() {
  const tableBody = document.getElementById('productsTableBody');
  if (!tableBody) return;

  let products = items.filter(i => i.type === 'sale');

  if (productSearchQuery) {
    const q = productSearchQuery.trim().toLowerCase();
    const qSingular = q.endsWith('s') && q.length > 3 ? q.slice(0, -1) : q;
    const queryWords = q.split(/\s+/).filter(w => w.length > 0);
    
    const scoredProducts = products.map(p => {
      let score = 0;
      const name = (p.name || '').toLowerCase();
      const category = (p.category || '').toLowerCase().replace(/-/g, ' ');
      const desc = (p.description || '').toLowerCase();
      
      // 1. Name match scoring
      if (name === q || name === qSingular) score += 100;
      else if (name.startsWith(q) || name.startsWith(qSingular)) score += 75;
      else if (name.includes(` ${q}`) || name.includes(` ${qSingular}`)) score += 60;
      else if (name.includes(q) || name.includes(qSingular)) score += 45;
      
      // 2. Category & Description match
      if (category.includes(q) || category.includes(qSingular)) score += 35;
      if (desc.includes(q) || desc.includes(qSingular)) score += 15;
      
      // 3. Fallback: Check individual word matches (fuzzy behavior)
      if (score === 0 && queryWords.length > 0) {
        let wordMatches = 0;
        queryWords.forEach(w => {
          if (name.includes(w) || category.includes(w) || desc.includes(w)) {
            wordMatches++;
          }
        });
        if (wordMatches === queryWords.length) score += 25; // All words found
        else if (wordMatches > 0) score += (wordMatches * 5); // Partial words found
      }

      return { item: p, score };
    });

    products = scoredProducts.filter(res => res.score > 0)
                             .sort((a, b) => b.score - a.score)
                             .map(res => res.item);
  }

  if (products.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:3rem; color:var(--color-text-muted);">
      <div style="font-size:2rem; margin-bottom:1rem;">🪔</div>
      <div style="font-weight:600; font-size:1.1rem; color:var(--color-text);">No products found for "${productSearchQuery}"</div>
      <div style="font-size:0.9rem; margin-top:0.5rem;">Try adjusting your search or add a new product.</div>
    </td></tr>`;
    return;
  }

  tableBody.innerHTML = products.map(p => {
    const saveAmt = Math.max(0, p.mrp - p.price);
    const categoryName = p.category ? p.category.replace('-', ' ') : 'Pooja items';
    const isOOS = !!p.outOfStock;
    
    // Highlight matched text
    const displayName = productSearchQuery ? highlightText(p.name, productSearchQuery) : p.name;
    const displayCategory = productSearchQuery ? highlightText(categoryName, productSearchQuery) : categoryName;

    return `
      <tr>
        <td>
          <div class="item-cell-info">
            <img src="${p.image || 'images/brass-diya.png'}" alt="" class="item-cell-img" style="${isOOS ? 'opacity:0.5;' : ''}">
            <div>
              <span class="item-cell-name" style="display:block;">${displayName}${isOOS ? '<span class="out-of-stock-badge">Out of Stock</span>' : ''}</span>
              ${p.variants && p.variants.length > 0 ? `<span style="font-size:0.75rem; color:var(--color-primary); font-weight:600; display:block; margin-top:2px;">Custom Quantities: ${p.variants.map(v => v.name).join(', ')}</span>` : ''}
            </div>
          </div>
        </td>
        <td><span class="badge-category">${displayCategory}</span></td>
        <td>
          <div class="price-box">
            <span class="price-selling">₹${p.price}</span>
            <span class="price-mrp">₹${p.mrp}</span>
          </div>
        </td>
        <td><span style="font-weight: 600; color: #ffb300; white-space: nowrap;">★ ${p.rating || '4.8'}</span></td>
        <td>
          <span class="price-save">Save ₹${saveAmt}</span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="action-btn-stock ${isOOS ? 'is-out-of-stock' : ''}" onclick="toggleOutOfStock('${p.id}')" title="${isOOS ? 'Mark as In Stock' : 'Mark as Out of Stock'}">
              ${isOOS ? '🔴 Out of Stock' : '🟢 In Stock'}
            </button>
            <button class="action-btn action-btn-edit" onclick="editItem('${p.id}')" title="Edit Product"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path></svg></button>
            <button class="action-btn action-btn-delete" onclick="deleteItem('${p.id}')" title="Delete Product"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// 3. Render Rentals list tab
function renderRentals(searchTerm = '') {
  const tableBody = document.getElementById('rentalsTableBody');
  if (!tableBody) return;

  let rentals = items.filter(i => i.type === 'rental');
  
  if (searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    const searchWords = term.split(/\s+/);
    
    rentals = rentals.map(r => {
      let score = 0;
      const itemName = (r.name || '').toLowerCase();
      
      if (itemName === term) {
        score += 100;
      } else if (itemName.startsWith(term)) {
        score += 75;
      } else if (itemName.includes(term)) {
        score += 50;
      }
      
      const itemWords = itemName.split(/\s+/);
      let allWordsMatched = true;
      searchWords.forEach(word => {
        if (itemWords.includes(word)) {
          score += 20;
        } else if (itemName.includes(word)) {
          score += 5;
        } else {
          allWordsMatched = false;
        }
      });
      
      if (!allWordsMatched && score === 0) {
        return { ...r, _score: -1 };
      }
      return { ...r, _score: score };
    }).filter(r => r._score > -1);
    
    rentals.sort((a, b) => b._score - a._score);
  }

  if (rentals.length === 0) {
    if (searchTerm) {
      tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:3rem; color:var(--color-text-muted);">
        <div style="font-size:3rem; margin-bottom:1rem;">🔍</div>
        <div style="font-size:1.1rem; font-weight:500; color:var(--color-text-main);">No rentals found for "${searchTerm}"</div>
        <div style="font-size:0.9rem; margin-top:0.5rem;">Try checking for typos or searching with different keywords.</div>
      </td></tr>`;
    } else {
      tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--color-text-muted);">No rentals found.</td></tr>`;
    }
    return;
  }

  tableBody.innerHTML = rentals.map(r => `
    <tr>
      <td>
        <div class="item-cell-info">
          <img src="${r.image || 'images/vratam-peta.png'}" alt="" class="item-cell-img">
          <div>
            <span class="item-cell-name" style="display:block;">${r.name}</span>
            ${r.height || r.width ? `<span style="font-size:0.75rem; color:var(--color-primary); font-weight:600; display:block; margin-top:2px;">Size: ${r.height || 'N/A'} (H) x ${r.width || 'N/A'} (W)</span>` : ''}
          </div>
        </div>
      </td>
      <td>
        <div class="price-box">
          <span class="price-selling">₹${r.price} / day</span>
          ${r.deposit ? `<span style="font-size:0.8rem;color:var(--color-text-muted)">Deposit: ₹${r.deposit}</span>` : ''}
        </div>
      </td>
      <td>
        <span style="font-size:0.875rem; color:var(--color-text-muted); display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
          ${r.description || 'No description provided.'}
        </span>
      </td>
      <td><span style="font-weight: 600; color: #ffb300; white-space: nowrap;">★ ${r.rating || '4.8'}</span></td>
      <td>
        <div class="action-buttons">
          <button class="action-btn action-btn-edit" onclick="editItem('${r.id}')" title="Edit Rental"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path></svg></button>
          <button class="action-btn action-btn-delete" onclick="deleteItem('${r.id}')" title="Delete Rental"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Toggle Out-of-Stock status for a product
async function toggleOutOfStock(id) {
  const index = items.findIndex(i => i.id === id);
  if (index === -1) return;

  const wasOos = !!items[index].outOfStock;
  items[index].outOfStock = !items[index].outOfStock;
  const isOosNow = !!items[index].outOfStock;

  // Persist to localStorage
  saveData();

  // Show feedback toast
  showToast(`"${items[index].name}" marked as ${isOosNow ? 'Out of Stock' : 'In Stock'}.`);

  // Re-render products table to reflect changes
  renderProducts();

  // If item was Out of Stock and is now Back In Stock, send WhatsApp notifications to waiting customers
  if (wasOos && !isOosNow) {
    notifyWaitingCustomersForStock(items[index]);
  }
}

// Send automated WhatsApp alerts to customers who clicked "Notify Me" for a product
async function notifyWaitingCustomersForStock(item) {
  let subscribers = [];

  // 1. Fetch pending notifications from Supabase
  if (typeof supabaseClient !== 'undefined') {
    try {
      const { data, error } = await supabaseClient
        .from('stock_notifications')
        .select('*')
        .or(`product_id.eq.${item.id},product_name.eq.${item.name}`)
        .eq('notified', false);

      if (!error && data && data.length > 0) {
        subscribers = data;
      }
    } catch (e) {
      console.warn('Supabase fetch stock_notifications fallback:', e);
    }
  }

  // 2. Fetch pending notifications from LocalStorage fallback
  try {
    const localNotifs = JSON.parse(localStorage.getItem('pooja_stock_notifications') || '[]');
    const localPending = localNotifs.filter(n => !n.notified && (n.product_id === item.id || n.product_name === item.name));
    
    // Merge without duplicate mobile numbers
    localPending.forEach(lp => {
      const exists = subscribers.some(s => s.mobile_number === lp.mobile_number);
      if (!exists) subscribers.push(lp);
    });
  } catch (e) {}

  if (subscribers.length === 0) {
    showToast(`ℹ️ No waiting subscribers for "${item.name}".`);
    return;
  }

  let notifiedCount = 0;
  showToast(`📢 Sending back-in-stock WhatsApp alerts to ${subscribers.length} customer(s)...`);

  for (const sub of subscribers) {
    const custName = sub.customer_name || 'Customer';
    let mobile = (sub.mobile_number || '').replace(/\D/g, '');
    if (!mobile) continue;
    if (mobile.length === 10) mobile = '91' + mobile;

    const message = `🎉 *Good News from Veerabhadra Pooja Store!* 🪔\n\nHello ${custName},\n\nGreat news! *${item.name}* is now *BACK IN STOCK*! ✅\n\nVisit our website to place your order now, or reply directly to this message to order.\n\nThank you for shopping with Veerabhadra Pooja Store! 🙏`;

    try {
      const res = await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: mobile, message: message })
      });
      if (res.ok) notifiedCount++;
    } catch (err) {
      console.error(`Failed to send WhatsApp stock alert to +${mobile}:`, err);
    }

    // Mark as notified in Supabase if record has a Supabase database ID
    if (sub.id && typeof sub.id === 'number' && typeof supabaseClient !== 'undefined') {
      try {
        await supabaseClient
          .from('stock_notifications')
          .update({ notified: true })
          .eq('id', sub.id);
      } catch (e) {}
    }
  }

  // Mark local storage records as notified
  try {
    const localNotifs = JSON.parse(localStorage.getItem('pooja_stock_notifications') || '[]');
    localNotifs.forEach(n => {
      if (n.product_id === item.id || n.product_name === item.name) n.notified = true;
    });
    localStorage.setItem('pooja_stock_notifications', JSON.stringify(localNotifs));
  } catch (e) {}

  if (notifiedCount > 0) {
    showToast(`✅ Sent WhatsApp back-in-stock alert to ${notifiedCount} waiting customer(s)!`);
  }
}

// Form CRUD Operations
function clearForm() {
  document.getElementById('itemId').value = '';
  document.getElementById('itemName').value = '';
  document.getElementById('itemCategory').value = '';
  document.getElementById('itemMrp').value = '';
  document.getElementById('itemPrice').value = '';
  document.getElementById('rentalPrice').value = '';
  document.getElementById('rentalDeposit').value = '';
  
  const heightInput = document.getElementById('rentalHeight');
  const widthInput = document.getElementById('rentalWidth');
  if (heightInput) heightInput.value = '';
  if (widthInput) widthInput.value = '';

  document.getElementById('itemDescription').value = '';
  document.getElementById('itemImageUrl').value = '';
  document.getElementById('itemRating').value = '5.0';
  
  const hasVariantsCheckbox = document.getElementById('hasVariants');
  if (hasVariantsCheckbox) hasVariantsCheckbox.checked = false;
  const listContainer = document.getElementById('variantsList');
  if (listContainer) listContainer.innerHTML = '';
  toggleVariantsSection();
  
  const fileInput = document.getElementById('itemImageFile');
  if (fileInput) fileInput.value = '';
  
  hidePreview();

  document.getElementById('itemType').value = 'sale';
  
  // Default forms layout
  document.getElementById('formSubmitBtn').textContent = 'Add Inventory Item';
  toggleFormFields();
}

function openAddForm() {
  clearForm();
  switchTab('add-item');
}

function editItem(id) {
  const item = items.find(i => i.id === id);
  if (!item) return;

  clearForm();
  
  document.getElementById('itemId').value = item.id;
  document.getElementById('itemName').value = item.name;
  document.getElementById('itemCategory').value = item.category || '';
  document.getElementById('itemImageUrl').value = item.image || '';
  document.getElementById('itemType').value = item.type;
  document.getElementById('itemDescription').value = item.description || '';

  if (item.image) {
    const filename = item.image.substring(item.image.lastIndexOf('/') + 1) || 'image';
    showPreview(item.image, filename, 'Saved Image');
  } else {
    hidePreview();
  }

  const hasVariantsCheckbox = document.getElementById('hasVariants');
  const listContainer = document.getElementById('variantsList');
  if (listContainer) listContainer.innerHTML = '';
  if (item.variants && item.variants.length > 0) {
    if (hasVariantsCheckbox) hasVariantsCheckbox.checked = true;
    item.variants.forEach(v => {
      addVariantRow(v.name, v.mrp, v.price);
    });
  } else {
    if (hasVariantsCheckbox) hasVariantsCheckbox.checked = false;
  }
  toggleVariantsSection();

  if (item.type === 'rental') {
    document.getElementById('rentalPrice').value = item.price;
    document.getElementById('rentalDeposit').value = item.deposit || '';
    
    const heightInput = document.getElementById('rentalHeight');
    const widthInput = document.getElementById('rentalWidth');
    if (heightInput) heightInput.value = item.height || '';
    if (widthInput) widthInput.value = item.width || '';
  } else {
    document.getElementById('itemMrp').value = item.mrp;
    document.getElementById('itemPrice').value = item.price;
  }

  document.getElementById('itemRating').value = item.rating || '5.0';

  document.getElementById('formSubmitBtn').textContent = 'Update Item Details';
  toggleFormFields();
  switchTab('add-item');
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('itemId').value;
  const type = document.getElementById('itemType').value;
  
  const actionText = id ? 'update' : 'add';
  const typeText = type === 'rental' ? 'rental product' : 'inventory product';
  const proceed = confirm(`Are you sure you want to ${actionText} this ${typeText}?`);
  if (!proceed) return;

  const name = document.getElementById('itemName').value.trim();
  const categoryRaw = document.getElementById('itemCategory').value.trim();
  const category = categoryRaw || 'daily-essentials';
  if (categoryRaw && !poojaCategories.some(c => c.toLowerCase() === categoryRaw.toLowerCase())) {
    poojaCategories.push(categoryRaw);
    localStorage.setItem('pooja_custom_categories', JSON.stringify(poojaCategories));
    renderCategoryDatalist();
  }
  const fileInput = document.getElementById('itemImageFile');
  let imageUrl = document.getElementById('itemImageUrl').value.trim();
  const description = document.getElementById('itemDescription').value.trim();

  // Check dropzone preview element for uploaded/selected image data
  const previewImg = document.getElementById('previewImage');
  if (!imageUrl && previewImg && previewImg.src && previewImg.src !== window.location.href && previewImg.src.length > 50) {
    imageUrl = previewImg.src;
  }


  let price, mrp, deposit, height = null, width = null;
  let variants = [];

  const hasVariants = document.getElementById('hasVariants').checked;
  if (type === 'sale' && hasVariants) {
    const rows = document.querySelectorAll('#variantsList .variant-row');
    rows.forEach(row => {
      const qtyInput = row.querySelector('.variant-qty-input');
      const unitSelect = row.querySelector('.variant-unit-select');
      const unitCustom = row.querySelector('.variant-unit-custom');
      const mrpInput = row.querySelector('.variant-mrp-input');
      const priceInput = row.querySelector('.variant-price-input');
      if (qtyInput && mrpInput && priceInput) {
        const vQty = qtyInput.value.trim();
        let vUnit = '';
        if (unitSelect) {
          if (unitSelect.value === '__custom__') {
            vUnit = unitCustom ? unitCustom.value.trim() : '';
          } else {
            vUnit = unitSelect.value;
          }
        }
        // Combine: "100" + "g" → "100g", "250" + "Box" → "250 Box"
        const needsSpace = vUnit && !['g', 'kg', 'ml', 'L'].includes(vUnit);
        const vName = vQty + (vUnit ? (needsSpace ? ' ' + vUnit : vUnit) : '');
        const vMrp = parseFloat(mrpInput.value) || 0;
        const vPrice = parseFloat(priceInput.value) || 0;
        if (vName) {
          variants.push({ name: vName, mrp: vMrp, price: vPrice });
        }
      }
    });

    if (variants.length > 0) {
      mrp = variants[0].mrp;
      price = variants[0].price;
    } else {
      mrp = parseFloat(document.getElementById('itemMrp').value) || 0;
      price = parseFloat(document.getElementById('itemPrice').value) || 0;
    }
    deposit = null;
  } else if (type === 'rental') {
    price = parseFloat(document.getElementById('rentalPrice').value);
    const depVal = document.getElementById('rentalDeposit').value.trim();
    deposit = depVal ? parseFloat(depVal) : null;
    mrp = null;
    
    const heightInput = document.getElementById('rentalHeight');
    const widthInput = document.getElementById('rentalWidth');
    height = heightInput ? heightInput.value.trim() : null;
    width = widthInput ? widthInput.value.trim() : null;
  } else {
    mrp = parseFloat(document.getElementById('itemMrp').value);
    price = parseFloat(document.getElementById('itemPrice').value);
    deposit = null;
  }
  const rating = parseFloat(document.getElementById('itemRating').value) || 5.0;

  // Construct item record
  const itemData = {
    id: id || 'item-' + Date.now(),
    name,
    category,
    image: imageUrl || (type === 'rental' ? 'images/vratam-peta.png' : 'images/brass-diya.png'),
    type,
    price,
    mrp,
    deposit,
    height: type === 'rental' ? height : undefined,
    width: type === 'rental' ? width : undefined,
    description,
    rating,
    variants: variants.length > 0 ? variants : undefined
  };

  if (id) {
    // Edit flow
    const index = items.findIndex(i => i.id === id);
    if (index > -1) {
      items[index] = itemData;
      showToast('Item updated successfully!');
    }
  } else {
    // Create flow
    items.push(itemData);
    showToast('New item added to inventory!');
  }

  saveData();
  clearForm();
  switchTab(type === 'rental' ? 'rentals' : 'products');
}

function deleteItem(id) {
  const item = items.find(i => i.id === id);
  if (!item) return;

  const confirmed = confirm(`Are you sure you want to delete "${item.name}"?`);
  if (!confirmed) return;

  items = items.filter(i => i.id !== id);
  saveData();
  showToast('Item removed from inventory.');

  if (item.type === 'rental') {
    renderRentals();
  } else {
    renderProducts();
  }
}

let rentalSearchQuery = '';

function handleRentalSearch() {
  const input = document.getElementById('searchRentalName');
  if (input) {
    rentalSearchQuery = input.value.trim().toLowerCase();
  }
  renderRentals(rentalSearchQuery);
}

function clearRentalSearch() {
  const input = document.getElementById('searchRentalName');
  if (input) {
    input.value = '';
    rentalSearchQuery = '';
  }
  renderRentals();
}
// Expose functions globally for layout onclick bindings
window.switchTab = switchTab;
window.editItem = editItem;
window.deleteItem = deleteItem;
window.openAddForm = openAddForm;
window.handleLogout = handleLogout;

// Modern Drag-and-Drop Image Upload Zone Logic
function initUploadZone() {
  const dropzone = document.getElementById('uploadDropzone');
  const fileInput = document.getElementById('itemImageFile');
  const urlInput = document.getElementById('itemImageUrl');
  const removeBtn = document.getElementById('removePreviewBtn');

  if (!dropzone || !fileInput || !urlInput) return;

  // Click on dropzone triggers hidden file input
  dropzone.addEventListener('click', (e) => {
    if (e.target.closest('#removePreviewBtn')) {
      return;
    }
    fileInput.click();
  });

  // Handle file selection
  fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
  });

  // Drag over/enter visual effects
  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('dragover');
    }, false);
  });

  // Drop handler
  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
  });

  function handleFiles(files) {
    if (files.length > 0) {
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        showToast('Please upload an image file (PNG, JPG, JPEG).');
        return;
      }
      
      // Update file input files programmatically
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;

      // Clear url input since local file is selected
      urlInput.value = '';

      // Preview setup and client-side compression
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          
          // Approximate base64 size to KB
          const sizeKB = Math.round(compressedDataUrl.length / 1333); 
          const sizeStr = sizeKB + ' KB (Compressed)';
          
          showPreview(compressedDataUrl, file.name, sizeStr);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Remove preview button handler
  if (removeBtn) {
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      hidePreview();
      urlInput.value = '';
    });
  }

  // Handle manual URL input for preview
  urlInput.addEventListener('input', () => {
    const url = urlInput.value.trim();
    if (url) {
      fileInput.value = ''; // Reset file input
      const filename = url.substring(url.lastIndexOf('/') + 1) || 'image';
      showPreview(url, filename, 'Remote URL');
    } else {
      hidePreview();
    }
  });
}

function showPreview(src, name, sizeInfo) {
  const preview = document.getElementById('dropzonePreview');
  const prompt = document.querySelector('.dropzone-prompt');
  const previewImg = document.getElementById('previewImage');
  const previewName = document.getElementById('previewName');
  const previewSize = document.getElementById('previewSize');

  if (previewImg) previewImg.src = src;
  if (previewName) previewName.textContent = name;
  if (previewSize) previewSize.textContent = sizeInfo || '';
  
  if (preview) preview.style.display = 'flex';
  if (prompt) prompt.style.display = 'none';
}

function hidePreview() {
  const preview = document.getElementById('dropzonePreview');
  const prompt = document.querySelector('.dropzone-prompt');
  const previewImg = document.getElementById('previewImage');
  const fileInput = document.getElementById('itemImageFile');

  if (preview) preview.style.display = 'none';
  if (prompt) prompt.style.display = 'block';
  if (previewImg) previewImg.src = '';
  if (fileInput) fileInput.value = '';
}

/* ========================================================
   ORDER MANAGEMENT SYSTEM LOGIC
   ======================================================== */

// Google Maps Review Link for Customer Reviews
const GOOGLE_MAPS_REVIEW_URL = 'https://maps.app.goo.gl/1nRcdZRke6M8r8ER8';

// Notification Service
const NotificationService = {
  generateMessage(order, status) {
    const customerName = order.customerName;
    const orderId = order.id;
    const productList = order.items.map(it => `- ${it.name} x ${it.quantity}`).join('\n');
    const total = order.totalAmount ? `\n\nTotal: ₹${order.totalAmount}` : '';
    
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return `🙏 *Veerabhadra Pooja Store*\n\nHello ${customerName},\n\nYour order has been *confirmed*! ✅\n\n*Order ID:* ${orderId}\n\n*Items:*\n${productList}${total}\n\nWe are preparing your order. We will notify you when it's packed.\n\nThank you for shopping with us! 🪔`;
        
      case 'PREPARING':
        return `⚙️ *Veerabhadra Pooja Store*\n\nHello ${customerName},\n\nYour order is now being *prepared*!\n\n*Order ID:* ${orderId}\n\n*Items:*\n${productList}\n\nWe will notify you once it is packed and ready.\n\nThank you! 🙏`;
        
      case 'PACKED':
        return `📦 *Veerabhadra Pooja Store*\n\nHello ${customerName},\n\nYour order has been *packed* and is ready! ✅\n\n*Order ID:* ${orderId}\n\n*Items:*\n${productList}\n\nYou can collect your order from our store during business hours.\n\nThank you! 🙏`;
        
      case 'READY FOR PICKUP':
        return `📍 *Veerabhadra Pooja Store*\n\nHello ${customerName},\n\nYour order is *ready for pickup!* 🎉\n\n*Order ID:* ${orderId}\n\n*Items:*\n${productList}\n\nPlease visit our store to collect your order.\n\n📍 https://maps.app.goo.gl/vH5Zj1566uZ7MjFf6?g_st=ac\n\nThank you! 🙏`;
        
      case 'DELIVERED':
        return `✅ *Veerabhadra Pooja Store*\n\nHello ${customerName},\n\nYour order has been successfully *delivered!* 🎉\n\n*Order ID:* ${orderId}\n\n*Items:*\n${productList}\n\nThank you for shopping with Veerabhadra Pooja Store! 🙏\n\n⭐ *We value your feedback!* Please leave us a review on Google Maps:\n📍 ${GOOGLE_MAPS_REVIEW_URL}\n\nWe hope to serve you again soon! 🪔`;
        
      case 'CANCELLED':
        return `❌ *Veerabhadra Pooja Store*\n\nHello ${customerName},\n\nWe regret to inform you that your order has been *cancelled*.\n\n*Order ID:* ${orderId}\n\n*Items:*\n${productList}\n\nIf you have any questions, please contact us on WhatsApp.\n\nSorry for the inconvenience. 🙏`;

        
      default:
        return null;
    }
  }
};

function triggerNotificationIfApplicable(order, status) {
  const message = NotificationService.generateMessage(order, status);
  if (!message) return false;

  const now = new Date();
  const dateStr = now.getFullYear() + '-' +
                  String(now.getMonth() + 1).padStart(2, '0') + '-' +
                  String(now.getDate()).padStart(2, '0') + ' ' +
                  String(now.getHours()).padStart(2, '0') + ':' +
                  String(now.getMinutes()).padStart(2, '0') + ' ' +
                  (now.getHours() >= 12 ? 'PM' : 'AM');

  // Log to notification history
  if (!order.notificationHistory) order.notificationHistory = [];
  order.notificationHistory.push({
    type: status.toUpperCase(),
    sentTime: dateStr,
    status: 'Sending...',
    mobile: order.mobileNumber,
    message: message
  });

  // Attempt fully automated send via whatsapp-web.js backend
  fetch('/api/send-whatsapp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: order.mobileNumber, message: message })
  })
  .then(async (response) => {
    const data = await response.json();
    if (response.ok) {
      // Update log status to Sent
      const logEntry = order.notificationHistory[order.notificationHistory.length - 1];
      if (logEntry) logEntry.status = 'Sent';
      showToast(`✅ WhatsApp sent to ${order.customerName} (${order.mobileNumber})`);
    } else {
      // WhatsApp not connected — fall back to wa.me link
      const logEntry = order.notificationHistory[order.notificationHistory.length - 1];
      if (logEntry) logEntry.status = 'Manual';

      let cleanPhone = (order.mobileNumber || '').replace(/\D/g, '');
      if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');
      showToast(`⚠️ WhatsApp not connected. Opening manually. Go to Admin → WhatsApp Setup to enable automation.`);
    }
  })
  .catch(() => {
    // Network error fallback
    let cleanPhone = (order.mobileNumber || '').replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    showToast(`📲 WhatsApp opened for ${order.customerName}. Tap Send.`);
  });

  return true;
}

// Set active order status filter
function setOrderFilter(status) {
  activeOrderFilter = status;
  currentOrderPage = 1;
  
  const chips = document.querySelectorAll('#orderStatusChips .filter-chip');
  chips.forEach(chip => {
    if (chip.getAttribute('onclick').includes(`'${status}'`)) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });
  
  renderOrders();
}

// Handle key-in search fields
function handleOrderSearch() {
  orderSearchQuery.id = document.getElementById('searchOrderId').value.trim().toLowerCase();
  orderSearchQuery.name = document.getElementById('searchCustomerName').value.trim().toLowerCase();
  orderSearchQuery.mobile = document.getElementById('searchMobile').value.trim().toLowerCase();
  currentOrderPage = 1;
  renderOrders();
}

// Clear order search fields
function clearOrderSearch() {
  document.getElementById('searchOrderId').value = '';
  document.getElementById('searchCustomerName').value = '';
  document.getElementById('searchMobile').value = '';
  orderSearchQuery.id = '';
  orderSearchQuery.name = '';
  orderSearchQuery.mobile = '';
  currentOrderPage = 1;
  renderOrders();
}

// Handle orders page size drop-down
function handleOrdersPerPageChange() {
  const selectEl = document.getElementById('ordersPerPage');
  if (selectEl) {
    ordersPerPage = parseInt(selectEl.value, 10);
  }
  currentOrderPage = 1;
  renderOrders();
}

// Change order list page
function changeOrderPage(direction) {
  currentOrderPage += direction;
  renderOrders();
}

// Render Orders history table
function renderOrders() {
  const tableBody = document.getElementById('ordersTableBody');
  if (!tableBody) return;

  let filtered = orders.filter(order => {
    if (activeOrderFilter !== 'all' && order.status !== activeOrderFilter) {
      return false;
    }
    if (orderSearchQuery.id && !order.id.toLowerCase().includes(orderSearchQuery.id)) {
      return false;
    }
    if (orderSearchQuery.name && !order.customerName.toLowerCase().includes(orderSearchQuery.name)) {
      return false;
    }
    if (orderSearchQuery.mobile && !order.mobileNumber.toLowerCase().includes(orderSearchQuery.mobile)) {
      return false;
    }
    return true;
  });

  // Sort orders descending (VRB100012, VRB100011, etc.)
  filtered.sort((a, b) => {
    const numA = parseInt(a.id.replace('VRB', ''), 10) || 0;
    const numB = parseInt(b.id.replace('VRB', ''), 10) || 0;
    return numB - numA;
  });

  const totalOrders = filtered.length;
  const maxPage = Math.max(1, Math.ceil(totalOrders / ordersPerPage));
  if (currentOrderPage > maxPage) {
    currentOrderPage = maxPage;
  }
  if (currentOrderPage < 1) {
    currentOrderPage = 1;
  }

  const startIndex = (currentOrderPage - 1) * ordersPerPage;
  const endIndex = Math.min(startIndex + ordersPerPage, totalOrders);

  // Update pagination indicators in UI
  const pagStartEl = document.getElementById('paginationStart');
  const pagEndEl = document.getElementById('paginationEnd');
  const pagTotalEl = document.getElementById('paginationTotal');
  const curPageNumEl = document.getElementById('currentPageNum');
  
  if (pagStartEl) pagStartEl.textContent = totalOrders === 0 ? 0 : startIndex + 1;
  if (pagEndEl) pagEndEl.textContent = endIndex;
  if (pagTotalEl) pagTotalEl.textContent = totalOrders;
  if (curPageNumEl) curPageNumEl.textContent = currentOrderPage;

  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');
  if (prevBtn) prevBtn.disabled = currentOrderPage === 1;
  if (nextBtn) nextBtn.disabled = currentOrderPage === maxPage;

  if (totalOrders === 0) {
    tableBody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:2rem; color:var(--color-text-muted);">No matching orders found.</td></tr>`;
    return;
  }

  const pageOrders = filtered.slice(startIndex, endIndex);

  tableBody.innerHTML = pageOrders.map(order => {
    const itemsSummary = order.items.map(it => `${it.name} (x${it.quantity})`).join(', ');
    const statusClass = getStatusBadgeClass(order.status);
    const hasNotification = order.notificationHistory && order.notificationHistory.length > 0;
    const notificationBadge = hasNotification 
      ? `<span class="badge-notification badge-notification-sent">Sent (${order.notificationHistory[order.notificationHistory.length - 1].type})</span>`
      : `<span class="badge-notification badge-notification-none">None</span>`;

    return `
      <tr>
        <td style="font-weight: 700; color: var(--color-primary); font-size: 0.9rem;">${order.id}</td>
        <td style="font-weight: 600;">${order.customerName}</td>
        <td>${order.mobileNumber}</td>
        <td>
          <span style="font-size:0.875rem; color:var(--color-text-dark); display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; text-overflow:ellipsis;" title="${itemsSummary}">
            ${itemsSummary}
          </span>
        </td>
        <td style="font-weight: 700; color: var(--color-text-dark);">₹${order.totalAmount}</td>
        <td style="font-size: 0.85rem; color: var(--color-text-muted); white-space: nowrap;">${order.date}</td>
        <td><span class="badge-category">${order.paymentMethod}</span></td>
        <td>
          <span class="badge-status ${statusClass}">${order.status}</span>
        </td>
        <td>${notificationBadge}</td>
        <td>
          <div class="action-buttons">
            <button class="action-btn action-btn-edit" onclick="viewOrderDetails('${order.id}')" title="View Order Details">👁️</button>
            <select class="table-status-select" onchange="promptStatusChange('${order.id}', this.value); this.value='';" title="Edit Status">
              <option value="" disabled selected>Status...</option>
              <option value="Ready for Pickup">Ready for Pickup</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'Pending': return 'badge-status-pending';
    case 'Confirmed': return 'badge-status-confirmed';
    case 'Preparing': return 'badge-status-preparing';
    case 'Packed': return 'badge-status-packed';
    case 'Ready for Pickup': return 'badge-status-pickup';
    case 'Delivered': return 'badge-status-delivered';
    case 'Cancelled': return 'badge-status-cancelled';
    default: return 'badge-status-pending';
  }
}

// Details Modal populate & open
function viewOrderDetails(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  populateDetailsModal(order);

  const modal = document.getElementById('orderDetailsModal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

function populateDetailsModal(order) {
  document.getElementById('modalOrderId').textContent = `Order Details: ${order.id}`;
  document.getElementById('modalCustName').textContent = order.customerName;
  document.getElementById('modalCustMobile').textContent = order.mobileNumber;
  document.getElementById('modalCustAddress').textContent = order.address;
  document.getElementById('modalPaymentMethod').textContent = order.paymentMethod;
  document.getElementById('modalOrderDate').textContent = order.date;
  
  const statusSelect = document.getElementById('modalStatusSelect');
  if (statusSelect) {
    statusSelect.value = order.status;
  }

  const itemsContainer = document.getElementById('modalReceiptItems');
  if (itemsContainer) {
    itemsContainer.innerHTML = order.items.map(it => `
      <tr>
        <td>${it.name}</td>
        <td style="text-align: right;">₹${it.price}</td>
        <td style="text-align: center;">${it.quantity}</td>
        <td style="text-align: right; font-weight: 600;">₹${it.price * it.quantity}</td>
      </tr>
    `).join('');
  }
  
  document.getElementById('modalReceiptTotal').textContent = `₹${order.totalAmount}`;

  const logContainer = document.getElementById('modalNotificationLog');
  if (logContainer) {
    if (!order.notificationHistory || order.notificationHistory.length === 0) {
      logContainer.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:1rem; color:var(--color-text-muted);">No notifications sent for this order.</td></tr>`;
    } else {
      logContainer.innerHTML = [...order.notificationHistory].reverse().map(log => {
        return `
          <tr>
            <td><strong style="color:var(--color-primary); font-size:0.75rem;">${log.type}</strong></td>
            <td style="white-space:nowrap;">${log.sentTime}</td>
            <td>${log.mobile}</td>
            <td><span class="badge-notification badge-notification-sent">${log.status}</span></td>
            <td>
              <pre style="max-width:250px; font-size:0.725rem; color:var(--color-text-muted); font-family:inherit; white-space:pre-wrap; border:1px solid var(--color-border); padding:0.4rem; border-radius:4px; max-height:80px; overflow-y:auto; background:#fafafa; margin:0;">${log.message}</pre>
            </td>
          </tr>
        `;
      }).join('');
    }
  }
}

function closeOrderModal() {
  const modal = document.getElementById('orderDetailsModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Trigger status update from inside details modal
function triggerStatusUpdateFromModal() {
  const select = document.getElementById('modalStatusSelect');
  if (!select) return;
  
  const title = document.getElementById('modalOrderId').textContent;
  const match = title.match(/VRB\d+/);
  if (!match) return;
  const orderId = match[0];
  const newStatus = select.value;
  
  promptStatusChange(orderId, newStatus);
}

// Status update confirmation flow
function promptStatusChange(orderId, newStatus) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  if (order.status === newStatus) {
    showToast(`Status is already "${newStatus}".`);
    return;
  }

  orderStatusChangeTarget.orderId = orderId;
  orderStatusChangeTarget.newStatus = newStatus;

  const previewEl = document.getElementById('confirmStatusChangePreview');
  if (previewEl) {
    previewEl.textContent = `${orderId}: "${order.status}" ➔ "${newStatus}"`;
  }

  const confirmModal = document.getElementById('statusConfirmationModal');
  if (confirmModal) {
    confirmModal.style.display = 'flex';
  }
}

function closeConfirmationModal() {
  const confirmModal = document.getElementById('statusConfirmationModal');
  if (confirmModal) {
    confirmModal.style.display = 'none';
  }
  orderStatusChangeTarget = { orderId: '', newStatus: '' };
}

async function confirmStatusUpdate() {
  const { orderId, newStatus } = orderStatusChangeTarget;
  if (!orderId || !newStatus) return;

  const orderIndex = orders.findIndex(o => o.id === orderId);
  if (orderIndex === -1) return;

  const order = orders[orderIndex];
  order.status = newStatus;
  
  triggerNotificationIfApplicable(order, newStatus);
  
  closeConfirmationModal();
  
  // Asynchronously save update to server
  await saveOrdersToServer(order);
  
  renderOrders();
  renderDashboard();
  
  const detailsModal = document.getElementById('orderDetailsModal');
  if (detailsModal && detailsModal.style.display === 'flex') {
    const modalOrderIdEl = document.getElementById('modalOrderId');
    if (modalOrderIdEl && modalOrderIdEl.textContent.includes(orderId)) {
      populateDetailsModal(order);
    }
  }

  showToast(`Order ${orderId} updated to "${newStatus}"!`);
}

// Bind to window context
window.setOrderFilter = setOrderFilter;
window.handleOrderSearch = handleOrderSearch;
window.clearOrderSearch = clearOrderSearch;
window.handleProductSearch = handleProductSearch;
window.clearProductSearch = clearProductSearch;
window.handleRentalSearch = handleRentalSearch;
window.clearRentalSearch = clearRentalSearch;
window.handleOrdersPerPageChange = handleOrdersPerPageChange;
window.changeOrderPage = changeOrderPage;
window.viewOrderDetails = viewOrderDetails;
window.closeOrderModal = closeOrderModal;
window.promptStatusChange = promptStatusChange;
window.closeConfirmationModal = closeConfirmationModal;
window.confirmStatusUpdate = confirmStatusUpdate;
window.triggerStatusUpdateFromModal = triggerStatusUpdateFromModal;
window.renderOrders = renderOrders;
window.toggleOutOfStock = toggleOutOfStock;


