import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module'; 
import { DataSource, Repository } from 'typeorm';
import { Cliente } from '../modules/gestion/entities/cliente.entity';
import { Proyecto } from '../modules/gestion/entities/proyecto.entity';
import { Tarea } from '../modules/gestion/entities/tarea.entity';


async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('--- Iniciando Carga Masiva de Datos de Prueba ---');

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  
  console.log('--- Limpiando datos existentes en PostgreSQL ---');
  await queryRunner.query('TRUNCATE TABLE "tareas" RESTART IDENTITY CASCADE;');
  await queryRunner.query('TRUNCATE TABLE "proyectos" RESTART IDENTITY CASCADE;');
  await queryRunner.query('TRUNCATE TABLE "clientes" RESTART IDENTITY CASCADE;');

  const clienteRepo: Repository<Cliente> = dataSource.getRepository(Cliente);
  const proyectoRepo: Repository<Proyecto> = dataSource.getRepository(Proyecto);
  const tareaRepo: Repository<Tarea> = dataSource.getRepository(Tarea);

  // 1. POOL DE CLIENTES (Se añade explícitamente el estado obligatorio)
  const c1 = await clienteRepo.save(clienteRepo.create({ nombre: 'Martin Perero', estado: 'ACTIVO' as any }));
  const c2 = await clienteRepo.save(clienteRepo.create({ nombre: 'Il Forno Di Pietro', estado: 'ACTIVO' as any }));
  const c3 = await clienteRepo.save(clienteRepo.create({ nombre: 'tudw', estado: 'ACTIVO' as any }));
  const c4 = await clienteRepo.save(clienteRepo.create({ nombre: 'TechSolutions Argentina', estado: 'ACTIVO' as any }));
  const c5 = await clienteRepo.save(clienteRepo.create({ nombre: 'Almacén de Bebidas Concordia', estado: 'ACTIVO' as any }));

  // 2. MATRIZ DE PROYECTOS
  const proyectosData = [
    { nombre: 'E-Commerce Calzado', estado: 'FINALIZADO', fechaObjetivo: '2026-02-15', fechaCreacion: new Date('2026-01-05'), cliente: c1 },
    { nombre: 'Landing Page v1', estado: 'FINALIZADO', fechaObjetivo: '2026-02-28', fechaCreacion: new Date('2026-01-20'), cliente: c2 },
    { nombre: 'API Pasarela de Pagos', estado: 'FINALIZADO', fechaObjetivo: '2026-04-10', fechaCreacion: new Date('2026-02-10'), cliente: c1 },
    { nombre: 'App Catálogo Digital', estado: 'FINALIZADO', fechaObjetivo: '2026-04-30', fechaCreacion: new Date('2026-03-05'), cliente: c3 },
    { nombre: 'Sistema de Gestión de Stock', estado: 'ACTIVO', fechaObjetivo: '2026-05-10', fechaCreacion: new Date('2026-03-12'), cliente: c1 },
    { nombre: 'Módulo Facturación Electrónica', estado: 'ACTIVO', fechaObjetivo: '2026-05-25', fechaCreacion: new Date('2026-04-02'), cliente: c3 },
    { nombre: 'Integración Batch Proveedores', estado: 'BAJA', fechaObjetivo: '2026-05-20', fechaCreacion: new Date('2026-04-15'), cliente: c2 },
    { nombre: 'Chatbot WhatsApp Automatizado', estado: 'ACTIVO', fechaObjetivo: '2026-06-15', fechaCreacion: new Date('2026-05-01'), cliente: c3 },
    { nombre: 'Desarrollo MVP Logística', estado: 'ACTIVO', fechaObjetivo: '2026-06-19', fechaCreacion: new Date('2026-05-18'), cliente: c4 },
    { nombre: 'Refactorización Core Arquitectura', estado: 'ACTIVO', fechaObjetivo: '2026-08-20', fechaCreacion: new Date('2026-05-28'), cliente: null },
    { nombre: 'Migración Infraestructura Cloud', estado: 'ACTIVO', fechaObjetivo: '2026-07-15', fechaCreacion: new Date('2026-06-01'), cliente: null },
    { nombre: 'Portal Web Autogestión', estado: 'ACTIVO', fechaObjetivo: '2026-09-01', fechaCreacion: new Date('2026-06-10'), cliente: c5 }
  ];

  const proyectosGuardados: Proyecto[] = [];
  for (const pData of proyectosData) {
    const nuevoProyecto: Proyecto = new Proyecto();
    nuevoProyecto.nombre = pData.nombre;
    nuevoProyecto.estado = pData.estado as any;
    nuevoProyecto.fechaObjetivo = pData.fechaObjetivo ? new Date(pData.fechaObjetivo) : null;
    nuevoProyecto.fechaCreacion = pData.fechaCreacion;
    nuevoProyecto.cliente = pData.cliente;

    const proyectoSalvado = await proyectoRepo.save(nuevoProyecto);
    proyectosGuardados.push(proyectoSalvado);
  }

  const pStock = proyectosGuardados.find(p => p.nombre === 'Sistema de Gestión de Stock')!;
  const pChatbot = proyectosGuardados.find(p => p.nombre === 'Chatbot WhatsApp Automatizado')!;
  const pFacturacion = proyectosGuardados.find(p => p.nombre === 'Módulo Facturación Electrónica')!;
  const pInterno = proyectosGuardados.find(p => p.nombre === 'Refactorización Core Arquitectura')!;

  // 3. GENERACIÓN DE TAREAS
  const tareasData = [
    { descripcion: 'Modelado Relacional de Tablas', estado: 'FINALIZADA', idProyecto: pStock.id, fechaFinalizacion: new Date('2026-06-02'), fechaInicio: new Date('2026-06-01') },
    { descripcion: 'Pruebas de Conexión de Base de Datos', estado: 'FINALIZADA', idProyecto: pStock.id, fechaFinalizacion: new Date('2026-06-04'), fechaInicio: new Date('2026-06-03') },
    { descripcion: 'Setup del Servidor Express', estado: 'FINALIZADA', idProyecto: pInterno.id, fechaFinalizacion: new Date('2026-06-06'), fechaInicio: new Date('2026-06-05') },
    { descripcion: 'Desarrollo de CRUD de Clientes', estado: 'FINALIZADA', idProyecto: pStock.id, fechaFinalizacion: new Date('2026-06-09'), fechaInicio: new Date('2026-06-07') },
    { descripcion: 'Validación de Webhooks WhatsApp', estado: 'FINALIZADA', idProyecto: pChatbot.id, fechaFinalizacion: new Date('2026-06-11'), fechaInicio: new Date('2026-06-10') },
    { descripcion: 'Maquetado del Frontend Inicial', estado: 'FINALIZADA', idProyecto: pFacturacion.id, fechaFinalizacion: new Date('2026-06-16'), fechaInicio: new Date('2026-06-14') },
    { descripcion: 'Generación de PDF para Facturas', estado: 'FINALIZADA', idProyecto: pFacturacion.id, fechaFinalizacion: new Date('2026-06-18'), fechaInicio: new Date('2026-06-17') },
    { descripcion: 'Pruebas Unitarias de Endpoints', estado: 'FINALIZADA', idProyecto: pInterno.id, fechaFinalizacion: new Date('2026-06-24'), fechaInicio: new Date('2026-06-22') },

    { descripcion: 'Modificar Dashboard Estadístico Avanzado', estado: 'PENDIENTE', idProyecto: pStock.id, fechaFinalizacion: null, fechaInicio: new Date('2026-06-12') },
    { descripcion: 'Ajustar Paleta de Colores Corporativos', estado: 'PENDIENTE', idProyecto: pStock.id, fechaFinalizacion: null, fechaInicio: new Date('2026-06-12') },
    { descripcion: 'Conexión con Teléfonos de Sucursales', estado: 'PENDIENTE', idProyecto: pChatbot.id, fechaFinalizacion: null, fechaInicio: new Date('2026-06-13') },

    { descripcion: 'Migrar Reportes a Excel', estado: 'PENDIENTE', idProyecto: pStock.id, fechaFinalizacion: null, fechaInicio: null },
    { descripcion: 'Implementar Cierre de Sesión Seguro', estado: 'PENDIENTE', idProyecto: pStock.id, fechaFinalizacion: null, fechaInicio: null }
  ];

  for (const tData of tareasData) {
    const nuevaTarea: Tarea = new Tarea();
    nuevaTarea.descripcion = tData.descripcion;
    nuevaTarea.estado = tData.estado as any;
    nuevaTarea.idProyecto = tData.idProyecto;
    nuevaTarea.fechaFinalizacion = tData.fechaFinalizacion;
    nuevaTarea.fechaInicio = tData.fechaInicio;

    await tareaRepo.save(nuevaTarea);
  }

  console.log('--- Base de Datos Poblada Exitosamente ---');
  await app.close();
}

bootstrap();
