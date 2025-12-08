/**
 * Input Sanitization Utilities
 * SEGURIDAD: Previene ataques XSS sanitizando inputs del usuario
 */

/**
 * Sanitiza texto eliminando caracteres peligrosos
 * @param {string} input - Texto a sanitizar
 * @returns {string} Texto sanitizado
 */
export const sanitizeText = (input) => {
  if (typeof input !== 'string') return '';
  
  // Eliminar tags HTML
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
};

/**
 * Sanitiza HTML permitiendo solo tags seguros
 * @param {string} html - HTML a sanitizar
 * @returns {string} HTML sanitizado
 */
export const sanitizeHTML = (html) => {
  if (typeof html !== 'string') return '';
  
  // Lista de tags permitidos (whitelist)
  const allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br', 'span'];
  
  // Eliminar scripts y eventos
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');
  
  // Eliminar tags no permitidos
  sanitized = sanitized.replace(/<(\/?)([\w]+)[^>]*>/g, (match, slash, tag) => {
    if (allowedTags.includes(tag.toLowerCase())) {
      return `<${slash}${tag}>`;
    }
    return '';
  });
  
  return sanitized;
};

/**
 * Sanitiza URL verificando que sea segura
 * @param {string} url - URL a sanitizar
 * @returns {string} URL sanitizada o vacía si es peligrosa
 */
export const sanitizeURL = (url) => {
  if (typeof url !== 'string') return '';
  
  // Eliminar espacios
  url = url.trim();
  
  // Verificar que no contenga javascript:, data:, vbscript:
  const dangerousProtocols = /^(javascript|data|vbscript):/i;
  if (dangerousProtocols.test(url)) {
    console.warn('⚠️ URL peligrosa bloqueada:', url);
    return '';
  }
  
  // Solo permitir http, https, mailto
  const safeProtocols = /^(https?|mailto):/i;
  if (url.includes(':') && !safeProtocols.test(url)) {
    console.warn('⚠️ Protocolo no permitido:', url);
    return '';
  }
  
  return url;
};

/**
 * Escapa caracteres especiales para prevenir XSS
 * @param {string} str - String a escapar
 * @returns {string} String escapado
 */
export const escapeHTML = (str) => {
  if (typeof str !== 'string') return '';
  
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return str.replace(/[&<>"'/]/g, (char) => htmlEscapes[char]);
};

/**
 * Sanitiza número de teléfono
 * @param {string} phone - Teléfono a sanitizar
 * @returns {string} Teléfono sanitizado
 */
export const sanitizePhone = (phone) => {
  if (typeof phone !== 'string') return '';
  
  // Solo permitir números, espacios, guiones, paréntesis y +
  return phone.replace(/[^\d\s\-()+ ]/g, '').trim();
};

/**
 * Sanitiza email
 * @param {string} email - Email a sanitizar
 * @returns {string} Email sanitizado
 */
export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return '';
  
  // Convertir a minúsculas y eliminar espacios
  email = email.toLowerCase().trim();
  
  // Solo permitir caracteres válidos en emails
  return email.replace(/[^a-z0-9@._\-+]/g, '');
};

/**
 * Sanitiza VIN (Vehicle Identification Number)
 * @param {string} vin - VIN a sanitizar
 * @returns {string} VIN sanitizado
 */
export const sanitizeVIN = (vin) => {
  if (typeof vin !== 'string') return '';
  
  // VIN solo contiene letras y números (sin I, O, Q)
  // Convertir a mayúsculas y eliminar caracteres no válidos
  return vin.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '').substring(0, 17);
};

/**
 * Sanitiza código postal
 * @param {string} zipCode - Código postal a sanitizar
 * @returns {string} Código postal sanitizado
 */
export const sanitizeZipCode = (zipCode) => {
  if (typeof zipCode !== 'string') return '';
  
  // Solo números, máximo 5 dígitos
  return zipCode.replace(/\D/g, '').substring(0, 5);
};

/**
 * Sanitiza objeto completo recursivamente
 * @param {Object} obj - Objeto a sanitizar
 * @returns {Object} Objeto sanitizado
 */
export const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  const sanitized = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      
      if (typeof value === 'string') {
        sanitized[key] = sanitizeText(value);
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }
  
  return sanitized;
};
