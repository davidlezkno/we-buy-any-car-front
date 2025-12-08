/**
 * Token Manager - Secure token storage in memory
 * Solución de seguridad: Almacena tokens en memoria en lugar de sessionStorage
 * para prevenir ataques XSS
 */

// Almacenamiento en memoria (no accesible desde window)
let authToken = null;
let tokenExpiry = null;

/**
 * Almacena el token de autenticación de forma segura en memoria
 * @param {string} token - Token JWT
 * @param {number} expiresIn - Tiempo de expiración en segundos (opcional)
 */
export const setToken = (token, expiresIn = 3600) => {
  authToken = token;
  // Calcular tiempo de expiración
  tokenExpiry = Date.now() + (expiresIn * 1000);
};

/**
 * Obtiene el token de autenticación si aún es válido
 * @returns {string|null} Token o null si no existe o expiró
 */
export const getToken = () => {
  // Verificar si el token existe y no ha expirado
  if (!authToken) {
    return null;
  }
  
  if (tokenExpiry && Date.now() > tokenExpiry) {
    // Token expirado, limpiarlo
    clearToken();
    return null;
  }
  
  return authToken;
};

/**
 * Limpia el token de memoria
 */
export const clearToken = () => {
  authToken = null;
  tokenExpiry = null;
};

/**
 * Verifica si existe un token válido
 * @returns {boolean}
 */
export const hasValidToken = () => {
  return getToken() !== null;
};

/**
 * Obtiene el tiempo restante del token en segundos
 * @returns {number} Segundos restantes o 0 si no hay token
 */
export const getTokenTimeRemaining = () => {
  if (!tokenExpiry) return 0;
  const remaining = Math.max(0, Math.floor((tokenExpiry - Date.now()) / 1000));
  return remaining;
};

// Migración automática: Si hay token en sessionStorage, moverlo a memoria y limpiarlo
if (typeof window !== 'undefined' && window.sessionStorage) {
  const oldToken = sessionStorage.getItem('token');
  if (oldToken) {
    console.warn('⚠️ Migrando token de sessionStorage a almacenamiento seguro en memoria');
    setToken(oldToken);
    sessionStorage.removeItem('token');
  }
}
