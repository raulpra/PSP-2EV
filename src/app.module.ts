import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'nestuser',
      password: 'nestpassword',
      database: 'discord_db',
      entities: [],
      synchronize: true,
      logging: ['query', 'error'],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
