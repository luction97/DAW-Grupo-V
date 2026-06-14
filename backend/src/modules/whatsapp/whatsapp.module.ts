import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappGateway } from './whatsapp.gateway';
import { GestionModule } from '../gestion/gestion.module';

@Module({
  imports: [GestionModule], // Importamos GestionModule para usar ProyectosService
  providers: [WhatsappGateway, WhatsappService],
})
export class WhatsappModule {}