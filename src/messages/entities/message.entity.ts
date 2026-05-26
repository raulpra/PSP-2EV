import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Channel } from '../../channels/entities/channel.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  // Fecha y hora actual al insertar en BD
  @CreateDateColumn()
  createdAt: Date;

  // Muchos mensajes pertenecen a un Usuario
  @ManyToOne(() => User)
  sender: User;

  // Muchos mensajes pertenecen a un Canal
  @ManyToOne(() => Channel, { onDelete: 'CASCADE' })
  channel: Channel;
}
