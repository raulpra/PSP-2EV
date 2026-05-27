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
import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';
import { ServerRolesGuard } from 'src/auth/server-roles.guard';
import { Roles } from 'src/auth/roles.decorator';

interface RequestWithUser extends Request {
  user: {
    userId: number;
    email: string;
  };
}

@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createChannelDto: CreateChannelDto) {
    return this.channelsService.create(createChannelDto);
  }

  @Get()
  findAll() {
    return this.channelsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.channelsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChannelDto: UpdateChannelDto) {
    return this.channelsService.update(+id, updateChannelDto);
  }

  @UseGuards(JwtAuthGuard, ServerRolesGuard)
  @Roles('owner') // Solo el owner del servidor puede eliminar canales
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.channelsService.remove(+id);
  }
}
