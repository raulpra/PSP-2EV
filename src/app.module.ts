import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { ServerModule } from './server/server.module';
import { Server } from 'http';
import { ChannelsModule } from './channels/channels.module';
import { Channel } from 'diagnostics_channel';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'nestuser',
      password: 'nestpassword',
      database: 'discord_db',
      entities: [User, Server, Channel],
      synchronize: true,
      logging: ['query', 'error'],
    }),
    UsersModule,
    ServerModule,
    ChannelsModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
