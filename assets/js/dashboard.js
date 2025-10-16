(function(){
  'use strict';

  const alertBox = document.getElementById('dashAlert');
  function showAlert(type, message){
    alertBox.className = `alert alert-${type} mt-3`;
    alertBox.textContent = message;
    alertBox.classList.remove('d-none');
  }

  async function ensureAuth(){
    const token = AuthAPI.getToken();
    if(!token){
      window.location.href = 'auth.html';
      return null;
    }
    try {
      const profile = await AuthAPI.getProfile();
      return profile;
    } catch (err){
      AuthAPI.clearToken();
      window.location.href = 'auth.html';
      return null;
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const profile = await ensureAuth();
    if(!profile) return;

    const name = profile.name || profile.fullName || profile.username || 'Người dùng';
    const email = profile.email || 'Không xác định';

    document.getElementById('userName').textContent = name;
    document.getElementById('userEmail').textContent = email;
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    AuthAPI.clearToken();
    window.location.href = 'auth.html';
  });
})();
