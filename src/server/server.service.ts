import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateServerDto } from './dto/create-server.dto';
import { UpdateServerDto } from './dto/update-server.dto';
import { Server } from './entities/server.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ServerService {
  constructor(
    @InjectRepository(Server)
    private serverRepository: Repository<Server>,
  ) {}
  async create(createServerDto: CreateServerDto): Promise<Server> {
    const newServer = this.serverRepository.create({
      name: createServerDto.name,
      description: createServerDto.description,
      owner: { id: createServerDto.ownerId },
    });

    return this.serverRepository.save(newServer);
  }

  async findAll(): Promise<Server[]> {
    return this.serverRepository.find({ relations: { owner: true } });
  }

  async findOne(id: number): Promise<Server | null> {
    return this.serverRepository.findOne({
      where: { id },
      relations: { owner: true },
    });
  }

  async update(id: number, updateServerDto: UpdateServerDto): Promise<Server> {
    const server = await this.findOne(id);
    // Separamos el ownerId y guardamos todo lo demás (nombre, descripción...)
    const { ownerId, ...restoDeDatos } = updateServerDto;

    this.serverRepository.merge(server, restoDeDatos);

    if (ownerId) {
      server.owner = { id: ownerId } as User; // Le decimos que confíe en que es un fragmento de User
    }

    return this.serverRepository.save(server);
  }

  async remove(id: number): Promise<{ message: string }> {
    await this.serverRepository.delete(id);
    return { message: `Servidor con ID ${id} eliminado correctamente` };
  }
}
