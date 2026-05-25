import {
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
  Injectable,
} from '@nestjs/common';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity';
import { Server } from 'src/server/entities/server.entity';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private channelsRepository: Repository<Channel>,
  ) {}

  async create(createChannelDto: CreateChannelDto): Promise<Channel> {
    const newChannel = this.channelsRepository.create({
      name: createChannelDto.name,
      type: createChannelDto.type || 'text',
      server: { id: createChannelDto.serverId },
    });
    try {
      return await this.channelsRepository.save(newChannel);
    } catch {
      throw new InternalServerErrorException(
        'Error al crear el canal, inténtalo de nuevo.',
      );
    }
  }

  async findAll(): Promise<Channel[]> {
    return this.channelsRepository.find({ relations: { server: true } });
  }

  async findOne(id: number): Promise<Channel> {
    const channel = await this.channelsRepository.findOne({
      where: { id },
      relations: { server: true },
    });
    if (!channel) {
      throw new NotFoundException(`Canal con ID ${id} no encontrado`);
    }
    return channel;
  }

  async update(id: number, updateChannelDto: UpdateChannelDto): Promise<Channel> {
    const channel = await this.findOne(id);
    const { serverId, ...restoDeDatos } = updateChannelDto;
    // Fusionamos los datos (como el nuevo nombre o tipo)
    this.channelsRepository.merge(channel, restoDeDatos);

    if (serverId) {
      channel.server = { id: serverId } as Server;
    }

    return this.channelsRepository.save(channel);
  }

  async remove(id: number, userId: number): Promise<{ message: string }> {
    // 1. Buscamos el canal trayendo las relaciones anidadas (el servidor y su dueño)
    const channel = await this.channelsRepository.findOne({
      where: { id },
      relations: {
        server: {
          owner: true, // Para saber quién es el dueño del servidor
        },
      },
    });

    if (!channel) {
      throw new NotFoundException(`Canal con id ${id} no encontrado`);
    }

    // Comprobamos si el usuario logueado es el Owner del servidor
    if (channel.server.owner.id !== userId) {
      throw new ForbiddenException(
        'Acceso denegado: Solo el Owner del servidor puede eliminar canales',
      );
    }

    // Si es el dueño, borramos el canal
    await this.channelsRepository.delete(id);
    return { message: `Canal con ID ${id} eliminado correctamente` };
  }

  /*async remove(id: number): Promise<{ message: string }> {
    await this.channelsRepository.delete(id);
    return { message: `Canal con ID ${id} eliminado correctamente` };
  }
    */
}
