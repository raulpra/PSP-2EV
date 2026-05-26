import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  enviarMensajeEnVivo(mensaje: any) {
    // Cuando lo llamamos lanza nuevoMensaje con los datos del mensaje
    this.server.emit('nuevoMensaje', mensaje);
  }
}
