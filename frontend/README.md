# Plataforma Core Empresarial - Frontend

Frontend del sistema de gestión de proyectos, desarrollado con Angular 21 y PrimeNG.

## 🚀 Requisitos Previos

- [Node.js](https://nodejs.org/) (Versión 20 o superior recomendada)
- Backend del proyecto ejecutándose localmente en el puerto `3000`.

## ⚙️ Instalación y Uso

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Ejecutar en entorno de desarrollo:**
   ```bash
   npm run start
   ```

3. **Acceder a la aplicación:**
   Abrí tu navegador e ingresá a [http://localhost:4200](http://localhost:4200).  
   *(La aplicación recargará automáticamente cada vez que guardes un cambio en el código fuente).*

> **Nota importante:** El servidor de desarrollo incluye un proxy (`proxy.conf.json`) que redirige automáticamente todas las peticiones que empiecen con `/v1/` hacia `http://localhost:3000`. Es indispensable tener el backend activo para poder iniciar sesión y ver datos.

## 🛠️ Tecnologías Utilizadas

- **Core**: [Angular 21](https://angular.dev/) (Standalone Components, Signals)
- **UI & Estilos**: [PrimeNG](https://primeng.org/) (Tema Aura)
- **Testing**: [Vitest](https://vitest.dev/)

## 📦 Construcción para Producción

Para compilar el proyecto y prepararlo para producción (generará la carpeta `dist/` con archivos optimizados):

```bash
npm run build
```
