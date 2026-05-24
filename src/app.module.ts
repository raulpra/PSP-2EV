import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { ServerModule } from './server/server.module';
import { Server } from 'http';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'nestuser',
      password: 'nestpassword',
      database: 'discord_db',
      entities: [User, Server],
      synchronize: true,
      logging: ['query', 'error'],
    }),
    UsersModule,
    ServerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
