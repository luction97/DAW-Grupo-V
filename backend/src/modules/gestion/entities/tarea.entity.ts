import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EstadosTareasEnum } from '../enums/estados-tareas.enum';
import { Proyecto } from './proyecto.entity';

@Entity({ name: 'tareas' })
export class Tarea {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @Column()
  descripcion!: string;

  @Column({ name: 'estado', type: 'enum', enum: EstadosTareasEnum })
  estado!: EstadosTareasEnum;

  @Column({ name: 'id_proyecto' })
  idProyecto!: number;

  // NUEVO: Registra el inicio operativo de la tarea
  @Column({ name: 'fecha_inicio', type: 'timestamp', nullable: true })
  fechaInicio!: Date | null;

  // NUEVO: Registra la finalización de la tarea
  @Column({ name: 'fecha_finalizacion', type: 'timestamp', nullable: true })
  fechaFinalizacion!: Date | null;

  @ManyToOne(() => Proyecto)
  @JoinColumn({ name: 'id_proyecto' })
  proyecto!: Proyecto;
}
