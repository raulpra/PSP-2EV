import {
  ForbiddenException,
  InternalServerErrorException,
  Injectable,
} from '@nestjs/common';
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
    try {
      return await this.serverRepository.save(newServer);
    } catch {
      throw new InternalServerErrorException(
        'Error al crear el servidor, inténtalo de nuevo.',
      );
    }
  }

  async findAll(): Promise<Server[]> {
    return this.serverRepository.find({ relations: { owner: true } });
  }

  async findOne(id: number): Promise<Server> {
    const server = await this.serverRepository.findOne({
      where: { id },
      relations: { owner: true },
    });
    if (!server) {
      throw new InternalServerErrorException(
        `Servidor con ID ${id} no encontrado`,
      );
    }
    return server;
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

  async remove(id: number, userId: number): Promise<{ message: string }> {
    // Buscamos el servidor
    const server = await this.findOne(id);

    // Comprobamos si el usuario que intenta borrar es el dueño
    if (server.owner.id !== userId) {
      throw new ForbiddenException(
        'Acceso denegado: Solo el creador del servidor puede eliminarlo',
      );
    }

    // Si llegamos aquí, es que es el dueño
    await this.serverRepository.delete(id);
    return { message: `Servidor con ID ${id} eliminado correctamente` };
  }

  /*
  async remove(id: number): Promise<{ message: string }> {
    await this.serverRepository.delete(id);
    return { message: `Servidor con ID ${id} eliminado correctamente` };
  }
    */
}
