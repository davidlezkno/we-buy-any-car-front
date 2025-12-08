/**
 * HTTP Client - Centralized Axios configuration
 * Implements Dependency Inversion Principle (DIP)
 * 
 * SEGURIDAD: Integrado con tokenManager para manejo seguro de autenticación
 */

import axios from 'axios';
import { getToken, clearToken } from './tokenManager';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://api.example.com';

/**
 * Create axios instance with default configuration
 */
const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Seguridad: Prevenir envío de credenciales a dominios no autorizados
  withCredentials: false,
});

/**
 * Request interceptor for adding auth tokens, logging, etc.
 * SEGURIDAD: Usa tokenManager en lugar de sessionStorage
 */
httpClient.interceptors.request.use(
  (config) => {
    // Agregar token de autenticación si está disponible
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for error handling
 * SEGURIDAD: Limpia token en caso de 401 (no autorizado)
 */
httpClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Centralized error handling
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Handle unauthorized - Limpiar token inválido
          console.error('Unauthorized access - Token inválido o expirado');
          clearToken();
          // Opcional: Redirigir a login si es necesario
          // window.location.href = '/login';
          break;
        case 403:
          // Handle forbidden
          console.error('Forbidden access');
          break;
        case 404:
          // Handle not found
          console.error('Resource not found');
          break;
        case 500:
          // Handle server error
          console.error('Server error');
          break;
        default:
          console.error('API error:', data?.message || error.message);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error:', error.message);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default httpClient;

