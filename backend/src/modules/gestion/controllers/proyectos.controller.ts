import {
  Body,
  Controller,
  Get,
  NotImplementedException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreateProyectoDto } from '../dtos/requests/create-proyecto.dto';
import { UpdateProyectoDto } from '../dtos/requests/update-proyecto.dto';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { ListProyectoDTO } from '../dtos/responses/list-proyecto.dto';
import { ProyectoDTO } from '../dtos/responses/proyecto.dto';
import { ProyectosService } from '../services/proyectos.service';
import { AuthGuard } from '../../auth/guards/auth.guard';

@Controller('proyectos')
export class ProyectosController {
  constructor(private readonly proyectosService: ProyectosService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  async crearProyecto(@Body() dto: CreateProyectoDto): Promise<{ id: number }> {
    return await this.proyectosService.crearProyecto(dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Put(':id')
  async actualizarProyecto(
    @Body() dto: UpdateProyectoDto,
    @Param('id') id: number,
  ): Promise<void> {
    await this.proyectosService.actualizarProyecto(id, dto);
  }

  @ApiBearerAuth()
  @ApiOkResponse({ type: ListProyectoDTO, isArray: true })
  @UseGuards(AuthGuard)
  @Get()
  async obtenerProyectos(): Promise<ListProyectoDTO[]> {
    return await this.proyectosService.obtenerProyectos();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':id')
  async obtenerProyecto(@Param('id') id: number): Promise<ProyectoDTO> {
    return await this.proyectosService.obtenerProyecto(id);
  }
}
