import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EstadosProyectosEnum } from '../enums/estados-proyectos.enum';
import { Cliente } from './cliente.entity';
import { Tarea } from './tarea.entity';

@Entity({ name: 'proyectos' })
export class Proyecto {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nombre!: string;

  @Column({ type: 'enum', enum: EstadosProyectosEnum })
  estado!: EstadosProyectosEnum;

  @Column({ name: 'id_cliente', nullable: true })
  idCliente!: number | null;

  @Column({ name: 'fecha_objetivo', type: 'date', nullable: true })
  fechaObjetivo!: Date | null;

  // NUEVO: Automatiza la fecha de alta en la BD, pero permite sobrescritura manual en el seed
  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamp' })
  fechaCreacion!: Date;

  @ManyToOne(() => Cliente, { nullable: true })
  @JoinColumn({ name: 'id_cliente' })
  cliente!: Cliente | null;

  @OneToMany(() => Tarea, (tarea) => tarea.proyecto)
  tareas!: Tarea[];
}