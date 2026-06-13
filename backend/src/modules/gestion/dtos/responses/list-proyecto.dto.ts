import { ApiProperty } from '@nestjs/swagger';
import { EstadosProyectosEnum } from '../../enums/estados-proyectos.enum';
import { ListClienteDTO } from './list-cliente.dto';

export class ListProyectoDTO {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  nombre!: string;

  @ApiProperty()
  estado!: EstadosProyectosEnum;

  @ApiProperty()
  fechaObjetivo!: string;

  @ApiProperty()
  fechaCreacion!: string;

  @ApiProperty()
  cliente!: ListClienteDTO;
}
