import { Module } from '@nestjs/common';
import { ServerService } from './server.service';
import { ServerController } from './server.controller';
import { Type } from 'class-transformer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Server } from 'http';

@Module({
  imports: [TypeOrmModule.forFeature([Server])],
  controllers: [ServerController],
  providers: [ServerService],
})
export class ServerModule {}
