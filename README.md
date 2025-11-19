# WeBuyAnyCar USA - Frontend

Aplicación web desarrollada con React 18 y Vite que permite a los usuarios valuar y vender sus vehículos. La aplicación ofrece múltiples flujos de entrada (VIN, Make/Model, License Plate) y gestiona todo el proceso desde la valuación inicial hasta la programación de citas.

## 📋 Descripción del Proyecto

Este proyecto es el frontend de la plataforma WeBuyAnyCar USA, una aplicación React moderna y responsive que permite a los usuarios:

- **Valuar vehículos** mediante tres métodos diferentes:
  - Número VIN (Vehicle Identification Number)
  - Marca y Modelo
  - Placa del vehículo
- **Gestionar citas** para evaluación presencial de vehículos
- **Consultar sucursales cercanas** basadas en ubicación
- **Seguir el proceso completo** desde la valuación hasta la confirmación

## ✨ Características Principales

- 🚗 **Múltiples Flujos de Valuación**: VIN, Make/Model, y License Plate
- 📅 **Sistema de Citas**: Calendario interactivo para programar evaluaciones
- 📍 **Búsqueda de Sucursales**: Localización de tiendas cercanas
- 🎨 **UI Moderna**: Diseño responsive con Tailwind CSS
- ⚡ **Rendimiento Optimizado**: Construido con Vite para carga rápida
- 🎭 **Animaciones Suaves**: Transiciones con Framer Motion
- 📊 **Tracking Integrado**: Google Tag Manager para analytics
- 🔄 **Gestión de Estado**: Context API para estado global
- 📝 **Validación de Formularios**: React Hook Form con validaciones

## 🛠️ Tecnologías Utilizadas

### Core
- **React 18.2.0**: Biblioteca principal para UI
- **Vite 5.1.0**: Build tool y dev server
- **React Router DOM 6.22.0**: Navegación y routing

### UI/UX
- **Tailwind CSS 3.4.1**: Framework de estilos utility-first
- **Framer Motion 11.0.3**: Animaciones y transiciones
- **Lucide React 0.323.0**: Iconos modernos

### Formularios y Validación
- **React Hook Form 7.50.0**: Manejo de formularios
- **Axios 1.6.7**: Cliente HTTP para llamadas API

### Utilidades
- **clsx 2.1.0**: Utilidad para clases CSS condicionales

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (versión 18.x o superior recomendada)
- [npm](https://www.npmjs.com/) (viene con Node.js) o [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/) (opcional, para clonar el repositorio)
- Un editor de código como [Visual Studio Code](https://code.visualstudio.com/)

## 🚀 Instalación y Configuración

### Paso 1: Clonar o Navegar al Proyecto

Si tienes el proyecto en un repositorio Git:
```bash
git clone <url-del-repositorio>
cd buy-cars/we-buy-any-car-front
```

O simplemente navega a la carpeta del proyecto:
```bash
cd we-buy-any-car-front
```

### Paso 2: Instalar Dependencias

Instala todas las dependencias del proyecto usando npm:

```bash
npm install
```

O si prefieres usar yarn:
```bash
yarn install
```

Este comando leerá el archivo `package.json` y descargará todas las dependencias necesarias en la carpeta `node_modules`.

### Paso 3: Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto (junto a `package.json`) con las siguientes variables:

```env
# URL base de la API backend
VITE_API_BASE_URL=http://localhost:5001

# O para producción:
# VITE_API_BASE_URL=https://api.webuyanycarusa.com
```

> **Nota**: Las variables de entorno en Vite deben comenzar con `VITE_` para ser accesibles en el código.

### Paso 4: Verificar la Configuración

Asegúrate de que:
- El archivo `.env` existe en la raíz del proyecto
- La URL de la API backend es correcta
- Todas las dependencias se instalaron correctamente (verifica que existe la carpeta `node_modules`)

## ▶️ Cómo Ejecutar el Proyecto

### Modo Desarrollo

Para ejecutar el proyecto en modo desarrollo con hot-reload:

```bash
npm run dev
```

O con yarn:
```bash
yarn dev
```

El servidor de desarrollo se iniciará y verás un mensaje similar a:
```
  VITE v5.1.0  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

La aplicación se abrirá automáticamente en tu navegador en `http://localhost:3000`.

**Características del modo desarrollo:**
- Hot Module Replacement (HMR) - Los cambios se reflejan instantáneamente
- Source maps para debugging
- Errores detallados en consola

### Modo Producción (Build)

Para crear una versión optimizada para producción:

```bash
npm run build
```

O con yarn:
```bash
yarn build
```

Esto generará una carpeta `dist/` con los archivos optimizados y minificados listos para desplegar.

### Preview del Build de Producción

Para previsualizar el build de producción localmente:

```bash
npm run preview
```

Esto iniciará un servidor local que sirve los archivos de la carpeta `dist/`, simulando cómo se verá en producción.

### Linting

Para verificar el código con ESLint:

```bash
npm run lint
```

Esto mostrará errores y advertencias de estilo de código.

## 📁 Estructura del Proyecto

```
we-buy-any-car-front/
├── public/                 # Archivos estáticos (si existen)
├── src/
│   ├── components/         # Componentes reutilizables
│   │   ├── Appointment/    # Componentes de citas
│   │   ├── Home/           # Componentes de la página principal
│   │   ├── Layout/         # Header, Footer, Layout
│   │   ├── Tracking/       # Google Tag Manager
│   │   ├── UI/             # Componentes UI genéricos
│   │   └── VehiclePreview/ # Vista previa de vehículos
│   ├── context/            # Context API (estado global)
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Páginas/Views principales
│   ├── services/           # Servicios API y llamadas HTTP
│   ├── utils/              # Utilidades y helpers
│   ├── App.jsx             # Componente raíz de la app
│   ├── App.css             # Estilos globales
│   ├── main.jsx            # Punto de entrada
│   └── index.css           # Estilos base
├── .env                    # Variables de entorno (crear)
├── .gitignore              # Archivos ignorados por Git
├── index.html              # HTML principal
├── package.json            # Dependencias y scripts
├── vite.config.js          # Configuración de Vite
└── README.md               # Este archivo
```

## 🎯 Flujos de la Aplicación

### 1. Flujo VIN
- Usuario ingresa el número VIN
- Validación y decodificación del VIN
- Obtención de información del vehículo
- Continuación al flujo de valuación

### 2. Flujo Make/Model
- Selección de año del vehículo
- Selección de marca
- Selección de modelo
- Continuación al flujo de valuación

### 3. Flujo License Plate
- Ingreso de placa del vehículo
- Validación y búsqueda
- Continuación al flujo de valuación

### 4. Flujo de Citas
- Selección de tipo de cita
- Selección de sucursal
- Selección de fecha y hora
- Confirmación de cita

## 🔌 Integración con Backend

La aplicación se conecta con la API backend mediante el servicio `api.js`. Asegúrate de que:

1. El backend esté corriendo (ver README del backend)
2. La variable `VITE_API_BASE_URL` en `.env` apunte a la URL correcta
3. El backend tenga CORS configurado para permitir solicitudes desde el frontend

### Endpoints Utilizados

- `POST /api/v1/auth/login` - Autenticación
- `GET /api/v1/vehicles/years` - Obtener años
- `GET /api/v1/vehicles/makes/{year}` - Obtener marcas
- `GET /api/v1/vehicles/models/{year}/{make}` - Obtener modelos
- `POST /api/v1/valuation` - Crear valuación
- `POST /api/v1/appointment` - Crear cita

## 🎨 Personalización

### Cambiar el Puerto de Desarrollo

Edita `vite.config.js`:
```javascript
server: {
  port: 3000,  // Cambia este número
  open: true
}
```

### Configurar la Base URL

En `vite.config.js`:
```javascript
base: '/',  // Cambia esto si despliegas en un subdirectorio
```

## 🐛 Solución de Problemas

### Error: "Cannot find module"
- Ejecuta `npm install` nuevamente
- Elimina `node_modules` y `package-lock.json`, luego ejecuta `npm install`

### Error: "Port 3000 is already in use"
- Cambia el puerto en `vite.config.js` o mata el proceso que usa el puerto:
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  
  # Mac/Linux
  lsof -ti:3000 | xargs kill
  ```

### Error de conexión con la API
- Verifica que el backend esté corriendo
- Verifica la variable `VITE_API_BASE_URL` en `.env`
- Revisa la consola del navegador para errores CORS

### El hot-reload no funciona
- Reinicia el servidor de desarrollo
- Limpia la caché del navegador
- Verifica que no haya errores de sintaxis

## 📝 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza el build de producción
- `npm run lint` - Ejecuta ESLint para verificar el código

## 🚀 Despliegue

### Build para Producción

1. Asegúrate de que las variables de entorno en `.env` estén configuradas para producción
2. Ejecuta el build:
   ```bash
   npm run build
   ```
3. La carpeta `dist/` contendrá los archivos listos para desplegar

### Opciones de Despliegue

- **Vercel**: Conecta tu repositorio y despliega automáticamente
- **Netlify**: Similar a Vercel, con soporte para SPA
- **Hostinger**: Sube la carpeta `dist/` vía FTP
- **Servidor propio**: Configura un servidor web (Nginx, Apache) para servir la carpeta `dist/`

> **Nota**: El proyecto está configurado para el dominio `sellyourcarrnow.com` según `vite.config.js`. Ajusta el `base` según tu dominio.

## 📊 Tracking y Analytics

El proyecto incluye integración con Google Tag Manager (GTM) a través del componente `GTMProvider`. Asegúrate de configurar tu ID de GTM en el componente correspondiente.

## 🔒 Seguridad

- Las variables de entorno sensibles deben estar en `.env` y nunca commitearse
- El archivo `.env` está en `.gitignore` por defecto
- En producción, usa HTTPS
- Valida todas las entradas del usuario

## 📄 Licencia

Este proyecto es privado y de uso interno.

## 👥 Contribuidores

Equipo de desarrollo WeBuyAnyCar USA

---

**¿Necesitas ayuda?** Revisa la documentación de [React](https://react.dev/), [Vite](https://vitejs.dev/), o contacta al equipo de desarrollo.

