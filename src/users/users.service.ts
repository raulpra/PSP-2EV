import { Injectable, ConflictException } from '@nestjs/common';
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
    // Comprobamos si ya existe con ese email
    const existingUser = await this.usersRepository.findOneBy({
      email: createUserDto.email,
    });
    if (existingUser) {
      throw new ConflictException('Este correo electrónico ya está registrado.');
    }

    // Preparamos el usuario para guardarlo
    const newUser = this.usersRepository.create({
      username: createUserDto.username,
      email: createUserDto.email,
      password: createUserDto.password, // Se guarda tal cual viene del DTO
    });

    // Lo guardamos definitivamente en PostgreSQL
    return this.usersRepository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }
  // Busca un usuario por su email, para el proceso de login
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }
  update(id: number, updateDto: any) {
    return `This action updates a #${id} user`;
  }
  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async updateAvatar(id: number, avatarPath: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    user.avatar = avatarPath; // Le asignamos la ruta de la imagen
    return this.usersRepository.save(user);
  }
}
