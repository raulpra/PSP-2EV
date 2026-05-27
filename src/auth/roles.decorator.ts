import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

// Creamos el decorador que aceptará una lista de roles ('owner')
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
