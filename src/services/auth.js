
/**
 * Auth Service - Handles all auth-related API calls
 * Implements Single Responsibility Principle (SRP)
 * 
 * SEGURIDAD: Usa tokenManager para almacenamiento seguro en memoria
 */

import axios from 'axios';
import { setToken, clearToken } from './utils/tokenManager';

// External API endpoints
const BASE_URL = 'http://localhost:5001/api';

/**
 * Realiza login y almacena el token de forma segura
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @param {number} retries - Número de reintentos
 * @returns {Promise<Object>} Datos de respuesta del login
 */
export const uathLogin = async (email, password, retries = 3) => {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    const response = await axios.post(`${BASE_URL}/Auth/login`, {
      "username": "admin",
      "password": "password123"
    }, { headers });
    
    // SEGURIDAD: Almacenar token en memoria en lugar de sessionStorage
    if (response.data.token) {
      // Si el backend envía expiresIn, usarlo; sino, default 1 hora
      const expiresIn = response.data.expiresIn || 3600;
      setToken(response.data.token, expiresIn);
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    if (retries === 0) throw error;
    return uathLogin(email, password, retries - 1);
  }
};

/**
 * Realiza logout y limpia el token
 */
export const logout = () => {
  clearToken();
  // Aquí puedes agregar lógica adicional como llamar a un endpoint de logout
};