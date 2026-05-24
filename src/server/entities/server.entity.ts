import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Server {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  // RELACIÓN: Muchos servidores pueden pertenecer a un mismo dueño (User)
  @ManyToOne(() => User)
  owner: User;
}
