import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from '../entities/usuario.entity';
import { Repository } from 'typeorm';
import { EstadosUsuariosEnum } from '../enums/estados-usuarios.enum';

@Injectable()
export class UsuariosService implements OnModuleInit {
  private readonly logger = new Logger(UsuariosService.name);
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRespository: Repository<Usuario>,
  ) {}

  async onModuleInit() {
    const adminExists = await this.usuariosRespository.findOneBy({ nombre: 'admin' });
    if (!adminExists) {
      const admin = this.usuariosRespository.create({
        nombre: 'admin',
        clave: bcrypt.hashSync('1234', 10),
        estado: EstadosUsuariosEnum.ACTIVO,
      });
      await this.usuariosRespository.save(admin);
      this.logger.log('Seeder: Usuario administrador creado (admin / 1234)');
    }
  }

  async buscarUsuarioActivoPorNombre(nombre: string): Promise<Usuario | null> {
    return await this.usuariosRespository.findOneBy({
      estado: EstadosUsuariosEnum.ACTIVO,
      nombre,
    });
  }
}
