// Authentication service for handling login, registration, and user session
class AuthService {
  constructor() {
    this.currentUser = null;
    this.token = localStorage.getItem('authToken');
    this.isAuthenticated = !!this.token;
    this.init();
  }

  async init() {
    if (this.token) {
      try {
        const response = await this.fetchWithAuth('/.netlify/functions/auth/me');
        if (response.user) {
          this.currentUser = response.user;
          this.isAuthenticated = true;
          this.updateUI();
        } else {
          this.logout();
        }
      } catch (error) {
        console.error('Session validation failed:', error);
        this.logout();
      }
    }
  }

  async login(email, password) {
    try {
      const response = await fetch('/.netlify/functions/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      this.token = data.token;
      this.currentUser = data.user;
      this.isAuthenticated = true;
      localStorage.setItem('authToken', this.token);
      this.updateUI();
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }

  async register(name, email, password) {
    try {
      const response = await fetch('/.netlify/functions/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      this.token = data.token;
      this.currentUser = data.user;
      this.isAuthenticated = true;
      localStorage.setItem('authToken', this.token);
      this.updateUI();
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  }

  async logout() {
    try {
      await fetch('/.netlify/functions/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.token = null;
      this.currentUser = null;
      this.isAuthenticated = false;
      localStorage.removeItem('authToken');
      this.updateUI();
      window.location.href = '/login.html';
    }
  }

  async requestPasswordReset(email) {
    try {
      const response = await fetch('/.netlify/functions/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to request password reset');
      }

      return { success: true, message: data.message };
    } catch (error) {
      console.error('Password reset request error:', error);
      return { success: false, error: error.message };
    }
  }

  async resetPassword(token, email, newPassword) {
    try {
      const response = await fetch('/.netlify/functions/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      return { success: true, message: data.message };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: error.message };
    }
  }

  async fetchWithAuth(url, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        this.logout();
      }
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  updateUI() {
    const authElements = document.querySelectorAll('[data-auth]');
    const unauthElements = document.querySelectorAll('[data-unauth]');
    const userElements = document.querySelectorAll('[data-user]');

    if (this.isAuthenticated) {
      authElements.forEach(el => el.style.display = '');
      unauthElements.forEach(el => el.style.display = 'none');
      
      userElements.forEach(el => {
        const attr = el.getAttribute('data-user');
        if (attr === 'name' && this.currentUser?.name) {
          el.textContent = this.currentUser.name;
        } else if (attr === 'email' && this.currentUser?.email) {
          el.textContent = this.currentUser.email;
        }
      });
    } else {
      authElements.forEach(el => el.style.display = 'none');
      unauthElements.forEach(el => el.style.display = '');
    }
  }
}

// Initialize auth service
const auth = new AuthService();

// Expose auth to window for debugging
window.auth = auth;
