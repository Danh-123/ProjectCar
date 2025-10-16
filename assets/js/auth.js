(function(){
  'use strict';

  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const authAlert = document.getElementById('authAlert');

  const loginTabBtn = document.getElementById('loginTabBtn');
  const registerTabBtn = document.getElementById('registerTabBtn');
  const switchToLogin = document.getElementById('switchToLogin');

  function showAlert(type, message){
    authAlert.className = `alert alert-${type}`;
    authAlert.textContent = message;
    authAlert.classList.remove('d-none');
  }

  function clearAlert(){
    authAlert.classList.add('d-none');
    authAlert.textContent = '';
  }

  function isValidEmail(email){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isValidPassword(password){
    // At least 8 chars, one uppercase letter, one number
    return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
  }

  function setActiveTab(tab){
    const isLogin = tab === 'login';
    loginTabBtn.classList.toggle('active', isLogin);
    registerTabBtn.classList.toggle('active', !isLogin);
    loginForm.classList.toggle('d-none', !isLogin);
    registerForm.classList.toggle('d-none', isLogin);
    clearAlert();
  }

  loginTabBtn.addEventListener('click', () => setActiveTab('login'));
  registerTabBtn.addEventListener('click', () => setActiveTab('register'));
  switchToLogin.addEventListener('click', (e) => { e.preventDefault(); setActiveTab('login'); });

  // Prefill: If already logged in, optional redirect
  document.addEventListener('DOMContentLoaded', async () => {
    const token = AuthAPI.getToken();
    if(token){
      try {
        await AuthAPI.getProfile();
        window.location.href = 'dashboard.html';
        return;
      } catch {
        AuthAPI.clearToken();
      }
    }
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlert();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    let valid = true;
    if(!isValidEmail(email)){
      document.getElementById('loginEmail').classList.add('is-invalid');
      valid = false;
    } else {
      document.getElementById('loginEmail').classList.remove('is-invalid');
    }
    if(!password){
      document.getElementById('loginPassword').classList.add('is-invalid');
      valid = false;
    } else {
      document.getElementById('loginPassword').classList.remove('is-invalid');
    }
    if(!valid) return;

    const btn = document.getElementById('loginBtn');
    btn.disabled = true; btn.innerText = 'Đang đăng nhập...';

    try {
      await AuthAPI.login({ email, password });
      showAlert('success', 'Đăng nhập thành công! Đang chuyển hướng...');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 500);
    } catch (err){
      const msg = err?.message || 'Đăng nhập thất bại';
      showAlert('danger', msg);
    } finally {
      btn.disabled = false; btn.innerText = 'Đăng nhập';
    }
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlert();

    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirm').value;

    let valid = true;
    if(!name){
      document.getElementById('regName').classList.add('is-invalid');
      valid = false;
    } else {
      document.getElementById('regName').classList.remove('is-invalid');
    }
    if(!isValidEmail(email)){
      document.getElementById('regEmail').classList.add('is-invalid');
      valid = false;
    } else {
      document.getElementById('regEmail').classList.remove('is-invalid');
    }
    if(!isValidPassword(password)){
      document.getElementById('regPassword').classList.add('is-invalid');
      valid = false;
    } else {
      document.getElementById('regPassword').classList.remove('is-invalid');
    }
    if(password !== confirm || !confirm){
      document.getElementById('regConfirm').classList.add('is-invalid');
      valid = false;
    } else {
      document.getElementById('regConfirm').classList.remove('is-invalid');
    }
    if(!valid) return;

    const btn = document.getElementById('registerBtn');
    btn.disabled = true; btn.innerText = 'Đang đăng ký...';

    try {
      await AuthAPI.register({ name, email, password });
      showAlert('success', 'Đăng ký thành công! Vui lòng đăng nhập.');
      setActiveTab('login');
    } catch (err){
      const msg = err?.message || 'Đăng ký thất bại';
      showAlert('danger', msg);
    } finally {
      btn.disabled = false; btn.innerText = 'Đăng ký';
    }
  });
})();
