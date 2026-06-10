# API de Gestión de Proyectos

Backend desarrollado con **NestJS**, **TypeORM** y **PostgreSQL** para el sistema integral de gestión de clientes, proyectos y tareas.

## 🚀 Requisitos Previos

- [Node.js](https://nodejs.org/) (Versión 20 o superior recomendada)
- [PostgreSQL](https://www.postgresql.org/)

## ⚙️ Configuración Inicial

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar el Entorno:**
   Crea o modifica el archivo `.env` en la raíz del proyecto con las credenciales de tu base de datos local:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=tu_clave
   DB_NAME=gestion_proyectos
   DB_LOGGING=true
   SWAGGER_HABILITADO=true
   JWT_SECRET=tu_secreto_jwt_super_seguro
   ```

3. **Ejecutar el servidor en desarrollo:**
   *(Asegúrate de haber creado la base de datos vacía en PostgreSQL antes de ejecutar)*
   ```bash
   npm run start:dev
   ```

## 📚 Documentación de la API (Swagger)

Una vez iniciado el servidor, puedes visualizar los endpoints y realizar pruebas interactivas accediendo a:
👉 **[http://localhost:3000/docs](http://localhost:3000/docs)**

### ¿Cómo probar los endpoints con JWT?

1. Entrá a Swagger ( http://localhost:3000/docs ).
2. Buscá el endpoint `POST /v1/auth` (suele estar al principio de la página).
3. Hacé clic en "Try it out" y pasale este JSON:
   ```json
   {
     "nombre": "admin",
     "clave": "1234"
   }
   ```
4. Dale a Execute. En la respuesta (Server Response), vas a ver que el sistema te devuelve un código 201 o 200 con algo como esto:
   ```json
   {
     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5..."
   }
   ```
5. Copiá toda esa cadena de texto larga (sin las comillas). Ese es tu token.
6. Subí arriba de todo en Swagger, hacé clic en el botón verde **"Authorize"**, pegá tu token y dale a confirmar. ¡Ya podés usar toda la API!

## 🚢 Despliegue con PM2 (Producción)

Para ejecutar el backend en modo producción con PM2:

1. **Compilar el proyecto:**
   ```bash
   npm run build
   ```

2. **Iniciar con PM2:**
   ```bash
   npm run deploy
   ```
   Esto ejecuta `npm run build && pm2 start ecosystem.config.js`.

3. **Verificar el estado:**
   ```bash
   pm2 status
   ```

4. **Ver logs:**
   ```bash
   pm2 logs gestor-de-proyectos
   ```

5. **Detener la aplicación:**
   ```bash
   pm2 stop gestor-de-proyectos
   ```

> **Nota:** La configuración de PM2 está en `ecosystem.config.js`. El backend corre en el puerto `4000` en producción. Se espera que nginx actúe como reverse proxy, redirigiendo las rutas `/v1/*` hacia `http://127.0.0.1:4000/v1/`.

## 🛠️ Tecnologías Utilizadas

- **Core**: [NestJS](https://nestjs.com/)
- **Base de Datos**: [PostgreSQL](https://www.postgresql.org/) & [TypeORM](https://typeorm.io/)
- **Gestor de Procesos**: [PM2](https://pm2.keymetrics.io/) (v7.x)
- **Reverse Proxy**: [NGINX](https://nginx.org/) (v1.30.2)

## 👥 Equipo de Desarrollo

- [Nombre del integrante 1]
- [Nombre del integrante 2]
- [Nombre del integrante 3]

---
*Trabajo Final Integrador - DAW 2026*
