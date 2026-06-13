import { InjectRepository } from '@nestjs/typeorm';
import { CreateProyectoDto } from '../dtos/requests/create-proyecto.dto';
import { Proyecto } from '../entities/proyecto.entity';
import { Repository, In } from 'typeorm';
import { EstadosProyectosEnum } from '../enums/estados-proyectos.enum';
import { UpdateProyectoDto } from '../dtos/requests/update-proyecto.dto';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ListProyectoDTO } from '../dtos/responses/list-proyecto.dto';
import { ProyectoDTO } from '../dtos/responses/proyecto.dto';
import { ListTareaDTO } from '../dtos/responses/list-tarea.dto';
import { ClientesService } from './clientes.service';
import { ListClienteDTO } from '../dtos/responses/list-cliente.dto';

@Injectable()
export class ProyectosService {
  constructor(
    @InjectRepository(Proyecto)
    private readonly repository: Repository<Proyecto>,
    @Inject(forwardRef(() => ClientesService))
    private readonly clientesService: ClientesService,
  ) {}

  async crearProyecto(dto: CreateProyectoDto): Promise<{ id: number }> {
    const proyecto: Proyecto = this.repository.create(dto);
    proyecto.estado = EstadosProyectosEnum.ACTIVO;

    if (dto.idCliente) {
      const clienteActivo: boolean =
        await this.clientesService.existeClienteActivoPorId(dto.idCliente);

      if (!clienteActivo) {
        throw new BadRequestException(
          'El cliente especificado no existe o no se encuentra activo',
        );
      }
    }

    await this.repository.save(proyecto);
    return { id: proyecto.id };
  }

  async actualizarProyecto(id: number, dto: UpdateProyectoDto): Promise<void> {
    const proyecto: Proyecto | null = await this.repository.findOne({
      where: { id },
    });

    if (!proyecto) {
      throw new BadRequestException(
        'No se encontró un proyecto asociado al identificador proporcionado',
      );
    }

    if (dto.idCliente) {
      const clienteActivo: boolean =
        await this.clientesService.existeClienteActivoPorId(dto.idCliente);

      if (!clienteActivo) {
        throw new BadRequestException(
          'Se debe especificar un cliente activo para el proyecto',
        );
      }
    }

    this.repository.merge(proyecto, dto);

    await this.repository.save(proyecto);
  }

  async obtenerProyectos(): Promise<ListProyectoDTO[]> {
    const proyectos: Proyecto[] = await this.repository.find({
      relations: ['cliente'],
      order: { id: 'ASC' },
    });

    const dtoList: ListProyectoDTO[] = [];

    for (const p of proyectos) {
      const dto = new ListProyectoDTO();
      dto.id = p.id;
      dto.nombre = p.nombre;
      dto.estado = p.estado;
      if (p.fechaObjetivo) {
        dto.fechaObjetivo =
          typeof p.fechaObjetivo === 'string'
            ? p.fechaObjetivo
            : p.fechaObjetivo.toISOString().split('T')[0];
      }
      if (p.fechaCreacion) {
        dto.fechaCreacion =
          typeof p.fechaCreacion === 'string'
            ? p.fechaCreacion
            : p.fechaCreacion.toISOString().split('T')[0];
      }
      if (p.cliente) {
        dto.cliente = new ListClienteDTO();
        dto.cliente.id = p.cliente.id;
        dto.cliente.nombre = p.cliente.nombre;
        dto.cliente.estado = p.cliente.estado;
      }
      dtoList.push(dto);
    }

    return dtoList;
  }

  async obtenerProyecto(id: number): Promise<ProyectoDTO> {
    const proyecto: Proyecto | null = await this.repository.findOne({
      where: { id },
      relations: ['cliente', 'tareas'],
      order: { tareas: { id: 'ASC' } },
    });

    if (!proyecto) {
      throw new BadRequestException(
        'No se encontró un proyecto asociado al identificador proporcionado',
      );
    }

    const dto = new ProyectoDTO();
    dto.nombre = proyecto.nombre;
    dto.estado = proyecto.estado;
    if (proyecto.fechaObjetivo) {
      dto.fechaObjetivo =
        typeof proyecto.fechaObjetivo === 'string'
          ? proyecto.fechaObjetivo
          : proyecto.fechaObjetivo.toISOString().split('T')[0];
    }
    if (proyecto.fechaCreacion) {
      dto.fechaCreacion =
        typeof proyecto.fechaCreacion === 'string'
          ? proyecto.fechaCreacion
          : proyecto.fechaCreacion.toISOString().split('T')[0];
    }
    if (proyecto.cliente) {
      dto.cliente = proyecto.cliente.nombre;
    }
    const tareas: ListTareaDTO[] = [];
    for (const t of proyecto.tareas) {
      const tareaDto = new ListTareaDTO();
      tareaDto.id = t.id;
      tareaDto.descripcion = t.descripcion;
      tareaDto.estado = t.estado;
      if (t.fechaInicio) {
        tareaDto.fechaInicio =
          typeof t.fechaInicio === 'string'
            ? t.fechaInicio
            : t.fechaInicio.toISOString().split('T')[0];
      }
      if (t.fechaFinalizacion) {
        tareaDto.fechaFinalizacion =
          typeof t.fechaFinalizacion === 'string'
            ? t.fechaFinalizacion
            : t.fechaFinalizacion.toISOString().split('T')[0];
      }
      tareas.push(tareaDto);
    }

    dto.tareas = tareas;

    return dto;
  }

  async existeProyectoPorIdCliente(idCliente: number): Promise<boolean> {
    const existe: boolean = await this.repository.exists({
      where: {
        cliente: { id: idCliente },
        estado: In([
          EstadosProyectosEnum.ACTIVO,
          EstadosProyectosEnum.FINALIZADO,
        ]),
      },
    });
    return existe;
  }
}
