import { ApiProperty } from '@nestjs/swagger';
import { EstadosProyectosEnum } from '../../enums/estados-proyectos.enum';
import { ListTareaDTO } from './list-tarea.dto';

export class ProyectoDTO {
  @ApiProperty()
  nombre!: string;

  @ApiProperty()
  estado!: EstadosProyectosEnum;

  @ApiProperty()
  fechaObjetivo!: string;

  @ApiProperty()
  fechaCreacion!: string;

  @ApiProperty()
  cliente!: string;

  @ApiProperty()
  tareas!: ListTareaDTO[];
}
