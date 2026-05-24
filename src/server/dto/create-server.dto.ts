import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateServerDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del servidor es obligatorio' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Se necesita el ID del creador (ownerId)' })
  ownerId: number;
}
