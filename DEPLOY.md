# Guía de Despliegue - Configuración del Backend

## Problema Común

Cuando subes el contenido de `/dist/` al servidor, la aplicación no se conecta automáticamente al backend porque las URLs están hardcodeadas.

## Solución

El proyecto ahora usa la variable de entorno `VITE_API_BASE_URL` para configurar la URL del backend.

## Configuración para Producción

### Opción 1: Variable de Entorno en el Build (Recomendado)

Antes de hacer el build, crea o edita el archivo `.env.production` en la raíz del proyecto:

```env
VITE_API_BASE_URL=https://api.sellyourcarrnow.com
```

O la URL donde esté alojado tu backend.

Luego ejecuta el build:

```bash
npm run build
```

Esto compilará la URL del backend directamente en los archivos de producción.

### Opción 2: Configuración Dinámica en el Servidor

Si necesitas cambiar la URL sin recompilar, puedes crear un archivo `config.js` en la carpeta `public/` que se cargue antes de la aplicación:

1. Crea `public/config.js`:
```javascript
window.APP_CONFIG = {
  API_BASE_URL: 'https://api.sellyourcarrnow.com'
};
```

2. Agrega este script en `index.html` antes de tu aplicación:
```html
<script src="/config.js"></script>
```

3. Modifica `src/services/utils/httpClient.js` para leer esta configuración:
```javascript
const API_BASE_URL = 
  window.APP_CONFIG?.API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://api.sellyourcarrnow.com' 
    : 'http://localhost:5001');
```

### Opción 3: Usar el mismo dominio (Proxy)

Si el backend está en el mismo dominio pero en un subdirectorio o puerto diferente, puedes configurar un proxy en tu servidor web (Nginx/Apache) para redirigir las peticiones `/api/*` al backend.

**Ejemplo para Nginx:**
```nginx
location /api/ {
    proxy_pass http://localhost:5001/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

En este caso, usa `VITE_API_BASE_URL=/` o déjalo vacío.

## Verificación

Después de desplegar:

1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Network"
3. Intenta usar la aplicación
4. Verifica que las peticiones se hagan a la URL correcta del backend

## Notas Importantes

- Las variables de entorno en Vite deben comenzar con `VITE_` para ser accesibles
- Las variables de entorno se compilan en el build, no son dinámicas en tiempo de ejecución
- Si cambias la URL del backend después del build, necesitarás recompilar
- Asegúrate de que el backend tenga CORS configurado para permitir peticiones desde tu dominio frontend

