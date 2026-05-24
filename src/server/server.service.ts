import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateServerDto } from './dto/create-server.dto';
import { UpdateServerDto } from './dto/update-server.dto';
import { Server } from './entities/server.entity';

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
      ownerId: { id: createServerDto.ownerId },
    });

    return this.serverRepository.save(newServer);
  }

  async findAll(): Promise<Server[]> {
    return this.serverRepository.find({ relations: ['owner'] });
  }

  findOne(id: number) {
    return `This action returns a #${id} server`;
  }

  update(id: number, updateServerDto: UpdateServerDto) {
    return `This action updates a #${id} server`;
  }

  remove(id: number) {
    return `This action removes a #${id} server`;
  }
}
