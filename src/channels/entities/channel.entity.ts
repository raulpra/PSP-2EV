import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Server } from '../../server/entities/server.entity';

@Entity()
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: 'text' }) // Por defecto será de texto, pero podría ser 'voice'
  type: string;

  // RELACIÓN: Muchos canales pertenecen a un solo servidor
  @ManyToOne(() => Server)
  server: Server;
}
