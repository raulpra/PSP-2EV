import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  // Inyectamos el Repositorio de TypeORM para poder hablar con la tabla 'user'
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Preparamos el usuario para guardarlo
    const newUser = this.usersRepository.create({
      username: createUserDto.username,
      email: createUserDto.email,
      password: createUserDto.password, // Se guarda tal cual viene del DTO
    });

    try {
      // Intentamos guardarlo en la base de datos
      return await this.usersRepository.save(newUser);
    } catch (error) {
      // Si el error es por violación de la restricción UNIQUE (email o username repetido)
      if (error.code === '23505') {
        throw new ConflictException(
          'Este correo electrónico o nombre de usuario ya está registrado.',
        );
      }
      throw new InternalServerErrorException(
        'Error al crear el usuario. Por favor, inténtalo de nuevo.',
      );
    }
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }
  // Busca un usuario por su email, para el login
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async update(id: number, data: Partial<User>): Promise<User | null> {
    await this.usersRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    await this.usersRepository.delete(id);
    return { message: `Usuario con ID ${id} eliminado correctamente` };
  }

  async updateAvatar(id: number, avatarPath: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    user.avatar = avatarPath; // Le asignamos la ruta de la imagen
    return this.usersRepository.save(user);
  }
}
