import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode';
import { WhatsappGateway } from './whatsapp.gateway';
import { ProyectosService } from '../gestion/services/proyectos.service';

@Injectable()
export class WhatsappService implements OnModuleInit {
  private client!: Client;

  constructor(
    private gateway: WhatsappGateway,
    private proyectosService: ProyectosService
  ) {}

  onModuleInit() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: { 
        headless: true,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // <-- RUTA DE TU CHROME
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
                '--disable-extensions',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process', // Esto ayuda mucho en Windows
                '--disable-gpu'],
            // Esto obliga a Puppeteer a esperar a que la página cargue bien
            waitNavigationFinished: true,
          }
    });

    this.client.on('qr', async (qr) => {
      console.log('¡NUEVO CÓDIGO QR GENERADO! Enviando a Angular...');
      const qrDataUrl = await qrcode.toDataURL(qr);
      this.gateway.emitirQr(qrDataUrl);
    });

    this.client.on('ready', () => {
      this.gateway.emitirEstado('CONECTADO');
      console.log('Cliente de WhatsApp listo!');
    });

    this.client.on('message', async (msg) => {

      // FILTRO: Si el mensaje no es texto puro (es foto, audio, sticker, etc.), lo ignoramos
      if (msg.type !== 'chat') {
        return;
      }
      if (msg.from === 'status@broadcast') {
        return;
      }
      if (msg.from.includes('@g.us')) {
        return;
      }

      
      this.gateway.emitirMensaje({ de: msg.from, texto: msg.body });
      const texto = msg.body.toLowerCase();


      // --- LÓGICA DE SALUDO Y BIENVENIDA ---
      // Si el cliente dice hola, buenas, etc., y NO está pidiendo el estado todavía
      const saludos = ['hola', 'buenas', 'buen dia', 'buenos dias', 'buenas tardes', 'buenas noches', 'hello'];
      const esSaludo = saludos.some(saludo => texto.includes(saludo));

      if (esSaludo && !texto.includes('estado de mi proyecto')) {
        const respuestaSaludo = '¡Hola! 👋 Soy el asistente virtual del equipo de proyectum.\n\nPara consultar cómo va tu proyecto, escribime la frase *estado de mi proyecto* seguido del número de tu proyecto.\n\nEjemplo: _estado de mi proyecto 5_';
        
        msg.reply(respuestaSaludo);
        this.gateway.emitirMensaje({ de: 'Bot', texto: respuestaSaludo });
        return; 
      }



      // Lógica de respuesta automatizada
      if (texto.includes('estado de mi proyecto')) {
        const idMatch = texto.match(/\d+/); // Extrae el número del mensaje
        
        if (idMatch) {
          const idProyecto = parseInt(idMatch[0], 10);
          try {
            const proyecto = await this.proyectosService.obtenerProyecto(idProyecto);
            let respuesta = `*Proyecto:* ${proyecto.nombre}\n*Estado:* ${proyecto.estado}\n*Cliente:* ${proyecto.cliente}\n\n*Tareas:*\n`;
            
            proyecto.tareas.forEach(t => {
               respuesta += `- ${t.descripcion} [${t.estado}]\n`;
            });

            msg.reply(respuesta);
            this.gateway.emitirMensaje({ de: 'Bot', texto: respuesta });
          } catch (error) {
            msg.reply('Lo siento, no encontré un proyecto con ese número.');
          }
        } else {
          msg.reply('Por favor, indícame el número de tu proyecto. Ejemplo: "estado de mi proyecto 5"');
        }
      }
    });

    this.client.initialize();
  }
}