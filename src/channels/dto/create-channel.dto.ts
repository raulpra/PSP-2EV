import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del canal es obligatorio' })
  name: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Debes indicar a qué servidor pertenece el canal' })
  serverId: number;
}
