import { Injectable } from '@nestjs/common';
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

    return this.channelsRepository.save(newChannel);
  }

  async findAll(): Promise<Channel[]> {
    return this.channelsRepository.find({ relations: ['server'] });
  }

  async findOne(id: number): Promise<Channel | null> {
    return this.channelsRepository.findOne({
      where: { id },
      relations: { server: true },
    });
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

  async remove(id: number): Promise<{ message: string }> {
    await this.channelsRepository.delete(id);
    return { message: `Canal con ID ${id} eliminado correctamente` };
  }
}
