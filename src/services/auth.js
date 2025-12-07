
/**
 * Auth Service - Handles all auth-related API calls
 * Implements Single Responsibility Principle (SRP)
 */

import axios from 'axios';

// External API endpoints
const BASE_URL = 'http://localhost:5001/api';

export const uathLogin = async (email, password, retries = 3) => {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    const response = await axios.post(`${BASE_URL}/Auth/login`, {
      "username": "admin",
      "password": "password123"
    }, { headers });
    sessionStorage.setItem('token', response.data.token);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    if (retries === 0) throw error;
    return uathLogin(email, password, retries - 1);
  }
};