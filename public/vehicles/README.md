# Imágenes de Vehículos de Prueba

Este directorio contiene imágenes de prueba para validar la visualización de vehículos en la aplicación.

## Imágenes Disponibles

- **toyota-camry.jpg** - Toyota Camry
- **honda-civic.jpg** - Honda Civic
- **ford-f150.jpg** - Ford F-150
- **bmw-sedan.jpg** - BMW Sedan
- **chevrolet-suv.jpg** - Chevrolet SUV
- **tesla-model3.jpg** - Tesla Model 3
- **nissan-altima.jpg** - Nissan Altima
- **default-car.jpg** - Imagen por defecto

## Uso

Las imágenes se asignan automáticamente según la marca del vehículo en el servicio `api.js`:

```javascript
const vehicleImageMap = {
  'toyota': '/vehicles/toyota-camry.jpg',
  'honda': '/vehicles/honda-civic.jpg',
  'ford': '/vehicles/ford-f150.jpg',
  'bmw': '/vehicles/bmw-sedan.jpg',
  'chevrolet': '/vehicles/chevrolet-suv.jpg',
  'tesla': '/vehicles/tesla-model3.jpg',
  'nissan': '/vehicles/nissan-altima.jpg',
}
```

Si la marca no coincide con ninguna del mapa, se usa la imagen por defecto.

## Nota

En producción, estas imágenes serían reemplazadas por un servicio de API real que proporcione imágenes de vehículos basadas en VIN, marca, modelo y año.


