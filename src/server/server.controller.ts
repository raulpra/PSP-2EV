import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ServerService } from './server.service';
import { CreateServerDto } from './dto/create-server.dto';
import { UpdateServerDto } from './dto/update-server.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    userId: number;
    email: string;
  };
}

@Controller('server')
export class ServerController {
  constructor(private readonly serverService: ServerService) {}

  @UseGuards(JwtAuthGuard) // Solo usuarios autenticados pueden crear servidores, el dueño es quien lo crea, así que necesitamos su ID 
  @Post()
  create(@Body() createServerDto: CreateServerDto, @Req() req: RequestWithUser) {
    createServerDto.ownerId = req.user.userId; // Asignamos el ID del usuario logueado como ownerId
    return this.serverService.create(createServerDto);
  }

  @Get()
  findAll() {
    return this.serverService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serverService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServerDto: UpdateServerDto) {
    return this.serverService.update(+id, updateServerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.userId;
    return this.serverService.remove(+id, userId);
  }
}
