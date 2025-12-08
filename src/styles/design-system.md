# Design System - We Buy Any Car

## Problema Resuelto
Este documento estandariza los estilos UI que estaban mezclados entre Tailwind, CSS inline y index.css, asegurando consistencia visual en toda la aplicación.

## Componentes UI Reutilizables

### Button
Ubicación: `src/components/UI/Button/Button.jsx`

**Variantes:**
- `primary` - Botón principal (azul)
- `secondary` - Botón secundario (gris)
- `outline` - Botón con borde
- `ghost` - Botón transparente
- `danger` - Botón de peligro (rojo)

**Tamaños:**
- `sm` - Pequeño
- `md` - Mediano (default)
- `lg` - Grande

**Uso:**
```jsx
import Button from '@/components/UI/Button';

<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>
```

### Input
Ubicación: `src/components/UI/Input/Input.jsx`

**Props:**
- `label` - Etiqueta del campo
- `error` - Mensaje de error
- `hint` - Texto de ayuda
- `icon` - Icono (componente Lucide)
- `disabled` - Estado deshabilitado
- `required` - Campo requerido

**Uso:**
```jsx
import Input from '@/components/UI/Input';
import { Mail } from 'lucide-react';

<Input
  name="email"
  label="Email"
  type="email"
  icon={Mail}
  error={errors.email}
  required
/>
```

## Colores

### Primarios
- `primary-50` a `primary-900` - Azul principal
- Uso: Botones principales, enlaces, elementos interactivos

### Secundarios
- `gray-50` a `gray-900` - Escala de grises
- Uso: Texto, bordes, fondos

### Estados
- `red-400` a `red-600` - Errores y peligro
- `green-400` a `green-600` - Éxito
- `yellow-400` a `yellow-600` - Advertencias

## Espaciado

### Contenedores
- `section-container` - Contenedor de sección con padding responsive
- `max-w-6xl mx-auto` - Ancho máximo centrado

### Gaps
- `gap-4` - Espaciado pequeño (1rem)
- `gap-6` - Espaciado mediano (1.5rem)
- `gap-8` - Espaciado grande (2rem)

## Tipografía

### Títulos
- `text-3xl font-bold` - H1
- `text-2xl font-bold` - H2
- `text-xl font-semibold` - H3

### Texto
- `text-base` - Texto normal (16px)
- `text-sm` - Texto pequeño (14px)
- `text-gray-600` - Texto secundario

## Clases Utilitarias Personalizadas

### Formularios
- `.input-field` - Campo de entrada estándar
- `.label` - Etiqueta de formulario
- `.error-message` - Mensaje de error

### Tarjetas
- `.card` - Tarjeta con sombra y bordes redondeados
- `.card-hover` - Tarjeta con efecto hover

## Animaciones

### Framer Motion
Usar para transiciones suaves:
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  {content}
</motion.div>
```

## Responsive Design

### Breakpoints
- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px
- `xl:` - 1280px

### Mobile First
Siempre diseñar primero para móvil, luego agregar estilos para pantallas más grandes.

## Reglas de Uso

1. **SIEMPRE** usar componentes UI reutilizables (Button, Input) en lugar de crear nuevos
2. **NUNCA** usar estilos inline excepto para valores dinámicos
3. **PREFERIR** clases de Tailwind sobre CSS personalizado
4. **MANTENER** consistencia en espaciado y colores
5. **USAR** animaciones sutiles con Framer Motion

## Migración de Código Existente

Si encuentras código con estilos inconsistentes:
1. Reemplazar botones personalizados con `<Button>`
2. Reemplazar inputs personalizados con `<Input>`
3. Usar clases de Tailwind en lugar de CSS inline
4. Aplicar el sistema de colores definido
