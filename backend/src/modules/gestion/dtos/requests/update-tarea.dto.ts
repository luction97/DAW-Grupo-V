import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { EstadosTareasEnum } from '../../enums/estados-tareas.enum';
import { CreateTareaDto } from './create-tarea.dto';

export class UpdateTareaDto extends PartialType(CreateTareaDto) {
  @ApiProperty({
    enum: EstadosTareasEnum,
    example: EstadosTareasEnum.PENDIENTE,
  })
  @IsEnum(EstadosTareasEnum)
  @IsOptional()
  estado?: EstadosTareasEnum;

  @ApiProperty({
    description: 'Bandera o fecha para marcar el inicio operativo de la tarea',
    required: false,
    example: true
  })
  @IsOptional()
  fechaInicio?: any;
}
