/* Authentication Flow & Supabase Integration */

// --- UI Interactivity ---

function switchPanel(panelId) {
  const panels = ['loginPanel', 'registerPanel', 'forgotPanel'];
  
  panels.forEach(id => {
    const el = document.getElementById(id);
    if (id === panelId) {
      el.classList.remove('hidden');
      // slight delay to allow display:block to apply before animating opacity
      setTimeout(() => el.classList.add('active'), 10);
    } else {
      el.classList.remove('active');
      el.classList.add('hidden');
    }
  });
}

function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
  } else {
    input.type = 'password';
  }
}

// --- Validation Functions ---

function validateEmail(input, groupClassId) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const group = document.getElementById(groupClassId);
  if (input.value && !emailRegex.test(input.value)) {
    group.classList.add('error');
    return false;
  } else {
    group.classList.remove('error');
    return true;
  }
}

function validatePhone(input, groupClassId) {
  const phoneRegex = /^[0-9]{10}$/;
  const group = document.getElementById(groupClassId);
  if (input.value && !phoneRegex.test(input.value)) {
    group.classList.add('error');
    return false;
  } else {
    group.classList.remove('error');
    return true;
  }
}

function validatePassword(input, groupClassId) {
  // Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;
  const group = document.getElementById(groupClassId);
  if (input.value && !passRegex.test(input.value)) {
    group.classList.add('error');
    return false;
  } else {
    group.classList.remove('error');
    return true;
  }
}

// --- Auth Handlers ---

function setLoading(btnId, isLoading) {
  const btn = document.getElementById(btnId);
  if (isLoading) {
    btn.classList.add('loading');
    btn.disabled = true;
    btn.querySelector('.btn-text').textContent = 'Processing...';
  } else {
    btn.classList.remove('loading');
    btn.disabled = false;
    // reset text based on btnId
    if(btnId === 'loginBtn') btn.querySelector('.btn-text').textContent = 'Sign In';
    if(btnId === 'registerBtn') btn.querySelector('.btn-text').textContent = 'Create Account';
    if(btnId === 'forgotBtn') btn.querySelector('.btn-text').textContent = 'Send Reset Link';
  }
}

async function handleLogin(e) {
  e.preventDefault();
  
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const errorEl = document.getElementById('loginGlobalError');
  errorEl.style.display = 'none';

  if (!validateEmail(emailInput, 'loginEmailGroup')) return;

  setLoading('loginBtn', true);

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: emailInput.value,
      password: passwordInput.value,
    });

    if (error) throw error;
    
    // Redirect to home page on success
    window.location.replace('index.html');

  } catch (err) {
    errorEl.textContent = err.message || 'Failed to sign in.';
    errorEl.style.display = 'block';
    setLoading('loginBtn', false);
  }
}

async function handleRegister(e) {
  e.preventDefault();
  
  const emailInput = document.getElementById('regEmail');
  const passwordInput = document.getElementById('regPassword');
  const phoneInput = document.getElementById('regPhone');
  const nameInput = document.getElementById('regName');
  
  const errorEl = document.getElementById('registerGlobalError');
  const successEl = document.getElementById('registerGlobalSuccess');
  
  errorEl.style.display = 'none';
  successEl.style.display = 'none';

  if (!validateEmail(emailInput, 'regEmailGroup')) return;
  if (!validatePhone(phoneInput, 'regPhoneGroup')) return;
  if (!validatePassword(passwordInput, 'regPasswordGroup')) return;

  setLoading('registerBtn', true);

  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email: emailInput.value,
      password: passwordInput.value,
      options: {
        data: {
          full_name: nameInput.value,
          phone: phoneInput.value
        }
      }
    });

    if (error) throw error;
    
    if (data.session === null) {
      // Email confirmation is required
      successEl.textContent = 'Registration successful! Please check your email inbox to confirm your account.';
      successEl.style.display = 'block';
      setLoading('registerBtn', false);
      
      // Optionally reset form
      document.getElementById('registerForm').reset();
    } else {
      // Auto logged in
      successEl.textContent = 'Registration successful! Redirecting...';
      successEl.style.display = 'block';
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1500);
    }

  } catch (err) {
    // Check for rate limit specifically
    if (err.message && err.message.toLowerCase().includes('rate limit')) {
      errorEl.textContent = 'Too many requests. Please try again later.';
    } else {
      errorEl.textContent = err.message || 'Failed to create account.';
    }
    errorEl.style.display = 'block';
    setLoading('registerBtn', false);
  }
}

async function handleForgot(e) {
  e.preventDefault();
  
  const emailInput = document.getElementById('forgotEmail');
  const errorEl = document.getElementById('forgotGlobalError');
  const successEl = document.getElementById('forgotGlobalSuccess');
  
  errorEl.style.display = 'none';
  successEl.style.display = 'none';

  if (!validateEmail(emailInput, 'forgotEmailGroup')) return;

  setLoading('forgotBtn', true);

  try {
    const { data, error } = await supabaseClient.auth.resetPasswordForEmail(emailInput.value);

    if (error) throw error;
    
    successEl.style.display = 'block';
    setLoading('forgotBtn', false);
    
    setTimeout(() => {
      switchPanel('loginPanel');
    }, 3000);

  } catch (err) {
    errorEl.textContent = err.message || 'Failed to send reset link.';
    errorEl.style.display = 'block';
    setLoading('forgotBtn', false);
  }
}

async function handleGoogleLogin() {
  try {
    const errorEl = document.getElementById('loginGlobalError');
    if (errorEl) errorEl.style.display = 'none';

    const redirectUrl = window.location.origin + '/';

    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });

    if (error) {
      if (errorEl) {
        errorEl.textContent = error.message || 'Google Sign-In is not configured in Supabase. Please enable Google provider in your Supabase Dashboard.';
        errorEl.style.display = 'block';
      } else {
        alert(error.message);
      }
      return;
    }

    if (data && data.url) {
      window.location.href = data.url;
    }
  } catch (err) {
    console.error('Google login error:', err);
    alert(err.message || 'Failed to initiate Google login.');
  }
}


// Auto-redirect if already logged in
window.addEventListener('DOMContentLoaded', async () => {
  if (typeof supabaseClient !== 'undefined' && supabaseClient.auth) {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
      window.location.replace('/');
    }
  }
});
