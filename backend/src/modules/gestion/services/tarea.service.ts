import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTareaDto } from '../dtos/requests/create-tarea.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tarea } from '../entities/tarea.entity';
import { Repository } from 'typeorm';
import { EstadosTareasEnum } from '../enums/estados-tareas.enum';
import { UpdateTareaDto } from '../dtos/requests/update-tarea.dto';

@Injectable()
export class TareasService {
  constructor(
    @InjectRepository(Tarea)
    private readonly tareasRepository: Repository<Tarea>,
  ) {}

  async crearTarea(
    dto: CreateTareaDto,
    idProyecto: number,
  ): Promise<{ id: number }> {
    const tarea: Tarea = this.tareasRepository.create(dto);

    tarea.estado = EstadosTareasEnum.PENDIENTE;
    tarea.idProyecto = idProyecto;
    tarea.fechaFinalizacion = null;
    tarea.fechaInicio = null;

    await this.tareasRepository.save(tarea);

    return { id: tarea.id };
  }

  async actualizarTarea(dto: UpdateTareaDto, idTarea: number): Promise<void> {
    const tarea: Tarea | null = await this.tareasRepository.findOne({
      where: { id: idTarea },
    });

    if (!tarea) {
      throw new BadRequestException('La tarea indicada no existe');
    }

    // Interceptamos si explícitamente se envía la señal de inicio de trabajo
    if (dto.fechaInicio) {
      tarea.fechaInicio = new Date();
    }

    this.tareasRepository.merge(tarea, dto);

    // CONTROL DE TRANSICIÓN DE ESTADO FINALIZADO
    if (tarea.estado === EstadosTareasEnum.FINALIZADA) {
      if (!tarea.fechaFinalizacion) {
        tarea.fechaFinalizacion = new Date();
      }
    } else {
      tarea.fechaFinalizacion = null;
      
      // Si la tarea se regresa explícitamente a PENDIENTE desde el selector,
      // y no se mandó bandera de inicio, reseteamos el cronómetro temporal.
      if (tarea.estado === EstadosTareasEnum.PENDIENTE && !dto.fechaInicio && dto.estado) {
        tarea.fechaInicio = null;
      }
    }

    await this.tareasRepository.save(tarea);
  }
}
