import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import * as crypto from 'crypto'; // Librería nativa de Node.js para seguridad
import { ChatGateway } from './chat.gateway';

@Injectable()
export class MessagesService {
  // CLAVE SECRETA (Poner en archivo .env, aquí la ponemos fija para probar)
  private readonly algorithm = 'aes-256-cbc';
  private readonly key = crypto.scryptSync('secreto para poder cifrar', 'salt', 32);

  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    private readonly chatGateway: ChatGateway,
  ) {}

  // Función para cifrar
  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // Guardamos el Vector de Inicialización (IV) pegado al mensaje cifrado para poder descifrarlo luego
    return iv.toString('hex') + ':' + encrypted;
  }
  // Función para descifrar
  private decrypt(encryptedText: string): string {
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift() as string, 'hex');
    const encryptedData = textParts.join(':');
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // Método para crear mensajes que también emite el mensaje en vivo a través del Gateway
  async create(createMessageDto: CreateMessageDto, userId: number): Promise<Message> {
    const newMessage = this.messagesRepository.create({
      // Ciframos el contenido antes de guardarlo
      content: this.encrypt(createMessageDto.content),
      channel: { id: createMessageDto.channelId },
      sender: { id: userId },
    });

    // Guardamos el mensaje cifrado en la base de datos
    const savedMessage = await this.messagesRepository.save(newMessage);

    // Copiamos todos los datos del mensaje guardado pero reemplazamos el content por el texto sin cifrar para enviarlo a los clientes conectados
    const mensajeVisible = {
      ...savedMessage,
      content: createMessageDto.content, // Enviamos el contenido sin cifrar a los clientes conectados
    };
    // Usamos el Gateway para empujar el mensaje en tiempo real a los clientes conectados
    this.chatGateway.enviarMensajeEnVivo(mensajeVisible);

    // Devolvemos el mensaje para que la petición HTTP normal también termine con éxito
    return mensajeVisible;
  }

  /*Método para crear mensajes sin WebSocket.
  async create(createMessageDto: CreateMessageDto, userId: number): Promise<Message> {
    const newMessage = this.messagesRepository.create({
      // Ciframos el contenido antes de guardarlo
      content: this.encrypt(createMessageDto.content),
      channel: { id: createMessageDto.channelId },
      sender: { id: userId },
    });

    return this.messagesRepository.save(newMessage);
  }
  */
  // Obtener los mensajes de un canal y descifrarlos
  async findByChannel(channelId: number): Promise<any[]> {
    const messages = await this.messagesRepository.find({
      where: { channel: { id: channelId } },
      relations: { sender: true }, // Traemos quién lo envió
      order: { createdAt: 'ASC' }, // Ordenamos por fecha de creación
    });

    // Mapeamos los mensajes para descifrar el contenido antes de mandarlo a Postman
    return messages.map((msg) => ({
      id: msg.id,
      content: this.decrypt(msg.content), // Lo desciframos para que el cliente lo lea bien
      createdAt: msg.createdAt,
      sender: msg.sender.username, // Solo enviamos el nombre
    }));
  }

  async findOne(id: number): Promise<Message> {
    const message = await this.messagesRepository.findOne({
      where: { id },
      relations: { sender: true, channel: true },
    });

    if (!message) {
      throw new NotFoundException(`Mensaje con ID ${id} no encontrado`);
    }
    return message;
  }

  async update(id: number, updateMessageDto: UpdateMessageDto): Promise<Message> {
    const message = await this.findOne(id);
    // Si en la actualización envían texto nuevo, lo ciframos antes de guardarlo
    if (updateMessageDto.content) {
      updateMessageDto.content = this.encrypt(updateMessageDto.content);
    }

    this.messagesRepository.merge(message, updateMessageDto);
    return this.messagesRepository.save(message);
  }

  async remove(id: number): Promise<{ message: string }> {
    const message = await this.findOne(id);
    await this.messagesRepository.remove(message);
    return { message: `Mensaje con ID ${id} eliminado correctamente` };
  }
}
