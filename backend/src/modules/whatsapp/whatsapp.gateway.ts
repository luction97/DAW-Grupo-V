import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: 'http://localhost:4200', credentials: true } })
export class WhatsappGateway implements OnGatewayConnection {
  @WebSocketServer() 
  server!: Server;

  // Memoria del estado actual
  private estadoActual: string = 'INICIANDO...';
  private ultimoQr: string = '';

  // Este evento se dispara automáticamente cada vez que Angular entra a la página
  handleConnection(client: Socket) {
    client.emit('whatsapp-status', this.estadoActual);
    if (this.ultimoQr) {
      client.emit('whatsapp-qr', this.ultimoQr);
    }
  }

  emitirQr(qrUrl: string) {
    this.ultimoQr = qrUrl;
    this.estadoActual = 'ESPERANDO ESCANEO DEL QR';
    this.server.emit('whatsapp-qr', qrUrl);
  }

  emitirEstado(estado: string) {
    this.estadoActual = estado;
    if (estado === 'CONECTADO') {
      this.ultimoQr = ''; // Borramos el QR porque ya se conectó
    }
    this.server.emit('whatsapp-status', estado);
  }

  emitirMensaje(mensaje: any) {
    this.server.emit('whatsapp-message', mensaje);
  }
}