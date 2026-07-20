import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const clearAuth = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('user');
  localStorage.removeItem('userRoleId');
  localStorage.removeItem('login_session_id');
  localStorage.removeItem('userPermissions');
  localStorage.removeItem('permissions');

  delete axios.defaults.headers.common['Authorization'];
  delete axios.defaults.headers.common['X-Login-Session-ID'];
};

export const performLogout = async (navigate) => {
  try {
    const token = localStorage.getItem('authToken');
    const loginSessionId = localStorage.getItem('login_session_id');

    if (token) {
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      if (loginSessionId) {
        headers['X-Login-Session-ID'] = loginSessionId;
      }

      await axios.post(`${API_URL}/logout`, {}, { headers });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearAuth();

    if (navigate) {
      navigate('/login');
    }
  }
};
