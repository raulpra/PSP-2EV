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
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    userId: number;
    email: string;
  };
}

@UseGuards(JwtAuthGuard) // Toda esta zona de mensajes requiere autenticación
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  create(@Body() createMessageDto: CreateMessageDto, @Req() req: RequestWithUser ) {
    // Aquí ya tenemos acceso a req.user.userId, que es el ID del usuario autenticado
    return this.messagesService.create(createMessageDto, req.user.userId);
  }

  //GET /messages/channel/1 -> Trae todos los mensajes del canal con ID 1
  @Get('channel/:channelId')
  findByChannel(@Param('channelId') channelId: string) {
    return this.messagesService.findByChannel(+channelId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messagesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
    return this.messagesService.update(+id, updateMessageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messagesService.remove(+id);
  }
}
