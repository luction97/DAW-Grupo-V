# 📋 Sistema de Gestión de Proyectos

## Trabajo Final Integrador - Desarrollo de Aplicaciones Web 2026

---

## 📌 Datos institucionales

| Ítem | Información |
|------|-------------|
| **Materia** | Desarrollo de Aplicaciones Web |
| **Carrera** | Tecnicatura Universitaria en Desarrollo Web |
| **Institución** | Facultad de Ciencias de la Administración - UNER |
| **Cuatrimestre** | 1° Cuatrimestre 2026 |
| **Tipo** | Trabajo Final Integrador |
| **Grupo** | V |

---

## 🎯 Objetivo del trabajo

Se busca que el estudiante ponga en práctica todos los conocimientos adquiridos durante el cursado de la asignatura, logrando el desarrollo de una aplicación web que permita gestionar **proyectos**, **clientes** y **tareas**, con un enfoque en simplicidad y buenas prácticas de desarrollo.

---

## 📄 Enunciado del proyecto

La consultora en la que usted realiza su pasantía ha decidido iniciar el desarrollo de un sistema de gestión de proyectos que tiene como objetivo principal destacar por su simplicidad. Como parte del equipo de desarrollo, usted y su grupo han sido seleccionados para llevar adelante este proyecto, el cual servirá como evaluación clave para determinar su contratación en la empresa.

---

## ✅ Requerimientos del sistema

### 🔐 Acceso (Autenticación)

- Se deben proporcionar las credenciales de un usuario válido para ingresar al sistema.
- Propiedades de un usuario: `nombre de usuario`, `clave`, `estado` (Activo o Baja).

### 📁 Gestión de proyectos

- Crear y modificar proyectos.
- Ver el detalle de las tareas que componen cada proyecto y el cliente al que corresponde.
- Propiedades de un proyecto: `nombre`, `estado` (Activo, Finalizado o Baja).

### 👥 Gestión de clientes

- Al crear o modificar un proyecto, se puede especificar el cliente correspondiente (solo clientes en estado "Activo") o no especificar ninguno (proyecto interno).
- Crear y modificar clientes.
- Propiedades de un cliente: `nombre`, `estado` (Activo o Baja).
- **Restricción:** Solo se puede dar de baja un cliente si no está registrado en ningún proyecto.

### ✅ Gestión de tareas

- Dado un proyecto ya creado, se debe poder agregar, modificar y eliminar tareas.
- Propiedades de una tarea: `descripción`, `estado` (Pendiente, Finalizado o Baja).

### 👁️ Restricciones de visualización

- Todos los proyectos, clientes y tareas son visibles para todos los usuarios.
- Los usuarios no son propietarios de los registros creados.

---

## 🚀 Tecnologías utilizadas

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **NestJS** | v10 | Backend (framework Node.js) |
| **TypeORM** | v0.3 | ORM para base de datos |
| **PostgreSQL** | v15 | Base de datos relacional |
| **Angular** | v17 | Frontend (framework) |
| **nginx** | latest | Servidor web / proxy inverso |
| **PM2** | latest | Administrador de procesos para Node.js |

---

## 👥 Integrantes del grupo

| N° | Nombre y Apellido | Rol en el equipo | Funcionalidad adicional |
|----|-------------------|------------------|------------------------|
| 1 | Merele, Maximiliano Ramón | *(definir)* | *(completar)* |
| 2 | Peluffo Bou, Verónica Haydeé | *(definir)* | *(completar)* |
| 3 | Perero, Martín Miguel | *(definir)* | *(completar)* |
| 4 | Romero, Andrea Elizabeth | *(definir)* | *(completar)* |
| 5 | Siano, Lucas | *(definir)* | *(completar)* |
| 6 | Vilaboa, Agustín | *(definir)* | *(completar)* |

---

### 📌 Leyenda de roles sugeridos

| Rol | Descripción |
|-----|-------------|
| Coordinador | Organiza el equipo, gestiona tareas y plazos |
| Backend | Desarrollo del servidor NestJS, API y lógica de negocio |
| Frontend | Desarrollo de la interfaz en Angular |
| Base de datos | Diseño del modelo, relaciones y consultas SQL |
| Documentación | README, comentarios en código y entrega |
| Video | Grabación, edición y presentación del video |

---

## 🔐 Credenciales de acceso

| Campo | Valor |
|-------|-------|
| **Usuario** | `admin` |
| **Contraseña** | `admin` |

> ⚠️ **Importante:** El usuario debe estar en estado `Activo` en la base de datos para poder ingresar al sistema.

---

## 📦 Requisitos previos

Antes de comenzar, asegurate de tener instalado:

| Requisito | Versión | Comando para verificar |
|-----------|---------|------------------------|
| [Node.js](https://nodejs.org/) | v18 o superior | `node -v` |
| [PostgreSQL](https://www.postgresql.org/) | v15 o superior | `psql --version` |
| [Angular CLI](https://angular.io/cli) | v17 | `ng version` |
| [Git](https://git-scm.com/) | cualquier versión | `git --version` |

---

## 🛠️ Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/sistema-gestion-proyectos.git
cd sistema-gestion-proyectos
```

## 📁 Estructura del proyecto

```
------ver cual estructura les gusta, arreglar si hace falta la que yo puse y dejar la que quieran--------------

sistema-gestion-proyectos/
├── frontend/                     # Aplicación cliente (Angular)
│   ├── .editorconfig
│   ├── .prettierrc
│   ├── angular.json              # Configuración de Angular
│   ├── package.json              # Dependencias del frontend
│   ├── tsconfig.*.json           # Configuraciones de TypeScript
│   └── src/
│       ├── index.html
│       ├── main.ts
│       ├── proxy.conf.json
│       ├── styles.css
│       ├── assets/               # Recursos estáticos (ej. isotipo.webp)
│       └── app/                  # Lógica principal de la aplicación
│           ├── app.ts, app.html, app.routes.ts, app.config.ts
│           ├── auth/             # Módulo de Autenticación (Login, interceptores, store)
│           ├── template/         # Plantillas y estructura visual base
│           ├── whatsapp/         # Interfaz para el bot de WhatsApp
│           └── proyectos/        # Módulo central de gestión
│               ├── listado/      # Vistas y lógica para listar proyectos
│               ├── gestion/      # Creación y edición de proyectos
│               ├── clientes/     # CRUD y listado de clientes
│               └── tareas/       # CRUD, listado y estadísticas de tareas
│
└── backend/                      # API del servidor (NestJS)
    ├── .env                      # Variables de entorno
    ├── .prettierrc
    ├── ecosystem.config.js       # Configuración para despliegue (ej. PM2)
    ├── eslint.config.mjs
    ├── nest-cli.json             # Configuración de NestJS
    ├── package.json              # Dependencias del backend
    ├── tsconfig.*.json           # Configuraciones de TypeScript
    └── src/
        ├── main.ts               # Punto de entrada de la API
        ├── app.module.ts         # Módulo raíz de la aplicación
        ├── database/             # Scripts de base de datos (seeds.ts)
        └── modules/              # Módulos de la API
            ├── auth/             # Lógica de autenticación
            │   ├── controllers/, dtos/, entities/, enums/, guards/, services/
            ├── gestion/          # Lógica de negocio principal (Clientes, Proyectos, Tareas)
            │   ├── controllers/  # Controladores (clientes, proyectos, tareas)
            │   ├── dtos/         # Objetos de transferencia de datos (requests/responses)
            │   ├── entities/     # Entidades de la base de datos
            │   ├── enums/        # Enumeraciones de estados
            │   └── services/     # Lógica de servicios
            └── whatsapp/         # Integración y servicios del Bot de WhatsApp
                ├── whatsapp.gateway.ts
                ├── whatsapp.module.ts
                └── whatsapp.service.ts


-----------------------------------------------------------------------------------------------------

sistema-gestion-proyectos/
├── backend/                 # NestJS + TypeORM
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/        # Autenticación (JWT)
│   │   │   ├── users/       # Gestión de usuarios
│   │   │   ├── clients/     # Gestión de clientes
│   │   │   ├── projects/    # Gestión de proyectos
│   │   │   └── tasks/       # Gestión de tareas
│   │   └── main.ts
│   ├── .env
│   └── package.json
├── frontend/                # Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/        # Servicios, guards, interceptores
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── clients/
│   │   │   │   ├── projects/
│   │   │   │   └── tasks/
│   │   └── index.html
│   └── package.json
├── nginx/                   # Configuración de nginx
│   └── default.conf
└── README.md
```

---

## ✅ Funcionalidades implementadas

### Requerimientos base (del enunciado)

| N° | Funcionalidad | Estado |
|----|---------------|--------|
| 1 | Autenticación de usuarios (login con JWT) | ✅ |
| 2 | CRUD de clientes | ✅ |
| 3 | CRUD de proyectos (con cliente opcional) | ✅ |
| 4 | CRUD de tareas (asociadas a un proyecto) | ✅ |
| 5 | Restricción: solo se puede dar de baja un cliente si no tiene proyectos asociados | ✅ |
| 6 | Restricción: solo se pueden seleccionar clientes en estado "Activo" para un proyecto | ✅ |
| 7 | Visualización global (todos los usuarios ven los mismos datos) | ✅ |
| 8 | Bot de WhatsApp para consulta de los clientes (los clientes pueden escribir por WhatsApp y consultar el estado de sus proyectos) | ✅ |

---

## 🎥 Video de presentación

🔗 **[Enlace al video de presentación](https://youtu.tv/tu-enlace-aqui)**

### 📌 Requisitos del video (según enunciado)

- ✅ Duración: **8 a 12 minutos**
- ✅ Todos los integrantes con **cámara y micrófono**
- ✅ Un integrante presenta el **funcionamiento general**, exponiendo cómo se cumplieron los objetivos de las consignas base
- ✅ Cada integrante expone su **funcionalidad adicional**, aclarando su nombre y apellido

---

## 📤 Forma de entrega (según enunciado)

La entrega se realiza a través del **campus virtual** en un archivo comprimido `.zip` que debe contener:

| Elemento | Descripción |
|----------|-------------|
| 📁 `sistema-gestion-proyectos/` | Código fuente completo del sistema |
| 📄 `README.md` | Este archivo |
| 🔗 `video_link.txt` (opcional) | Enlace al video (si no está en el README) |

> ⚠️ Respetar las fechas límite publicadas en el campus.

---

## 📄 Licencia

Trabajo académico – sin fines comerciales.

---

## 📞 Contacto

Para consultas, comunicarse con los integrantes del grupo o con la cátedra.

