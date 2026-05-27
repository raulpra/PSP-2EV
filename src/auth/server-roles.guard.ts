import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from '../channels/entities/channel.entity'; // Ajusta esta ruta a tu proyecto
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class ServerRolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector, // Herramienta de NestJS para leer los decoradores
    @InjectRepository(Channel)
    private channelsRepository: Repository<Channel>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Miramos qué roles exige la ruta ('owner')
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si la ruta no tiene el decorador @Roles, dejamos pasar a todo el mundo
    if (!requiredRoles) {
      return true;
    }

    // Extraemos la petición HTTP, el ID del usuario (del token) y el ID del canal (de la URL)
    const request = context.switchToHttp().getRequest();
    const userId = request.user.userId;
    const channelId = request.params.id;

    // Buscamos el canal y a quién pertenece su servidor
    const channel = await this.channelsRepository.findOne({
      where: { id: +channelId },
      relations: {
        server: {
          owner: true,
        },
      },
    });

    if (!channel) {
      throw new NotFoundException(`El canal con ID ${channelId} no existe.`);
    }

    // Es este usuario el 'owner' del servidor?
    const isOwner = channel.server.owner.id === userId;

    if (requiredRoles.includes('owner') && isOwner) {
      return true; // ¡Permiso concedido!
    }

    // Si llegamos aquí, no tiene el rol
    throw new ForbiddenException('No tienes el rol de Owner en este canal para realizar esta acción.');
  }
}
