(function(){
  'use strict';

  const TOKEN_KEY = 'auth_token';
  // Set API_BASE to '' for same-origin calls, or override by defining window.AUTH_API_BASE
  const API_BASE = (typeof window !== 'undefined' && window.AUTH_API_BASE) ? window.AUTH_API_BASE : '';

  function getToken(){
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  }

  function saveToken(token){
    try { localStorage.setItem(TOKEN_KEY, token); } catch {}
  }

  function clearToken(){
    try { localStorage.removeItem(TOKEN_KEY); } catch {}
  }

  function extractToken(data){
    if(!data || typeof data !== 'object') return null;
    return data.token || data.accessToken || data.access_token || data.jwt || null;
  }

  function getErrorMessage(body){
    if(!body) return 'Có lỗi xảy ra';
    if(typeof body === 'string') return body;
    if(body.message) return body.message;
    // Common validation error formats
    if(body.errors && Array.isArray(body.errors) && body.errors.length){
      return body.errors.map(e => e.msg || e.message || JSON.stringify(e)).join('\n');
    }
    if(body.error) return (typeof body.error === 'string') ? body.error : JSON.stringify(body.error);
    return 'Yêu cầu không thành công';
  }

  async function request(path, { method = 'GET', body, headers = {} } = {}){
    const token = getToken();
    const finalHeaders = Object.assign({ 'Accept': 'application/json' }, headers);
    if(body !== undefined){
      finalHeaders['Content-Type'] = 'application/json';
    }
    if(token){
      finalHeaders['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(API_BASE + path, {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: 'include' // keep cookies if server uses them alongside token
    });

    const contentType = res.headers.get('content-type') || '';
    const isJSON = contentType.includes('application/json');
    const parsed = isJSON ? await res.json().catch(() => null) : await res.text().catch(() => null);

    if(!res.ok){
      const message = getErrorMessage(parsed);
      const error = new Error(message);
      error.status = res.status;
      error.body = parsed;
      throw error;
    }

    return parsed;
  }

  async function register(payload){
    return request('/api/auth/register', { method: 'POST', body: payload });
  }

  async function login(payload){
    const data = await request('/api/auth/login', { method: 'POST', body: payload });
    const token = extractToken(data);
    if(!token){
      // if API returns token wrapped differently, allow custom mapping
      throw new Error('Không nhận được token từ máy chủ');
    }
    saveToken(token);
    return { token, raw: data };
  }

  async function getProfile(){
    return request('/api/auth/profile', { method: 'GET' });
  }

  window.AuthAPI = { request, register, login, getProfile, getToken, saveToken, clearToken };
})();
