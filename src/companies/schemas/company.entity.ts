import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/schemas/user.entity';

@Entity()
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'int' })
  users: number;

  @Column({ type: 'int' })
  products: number;

  @Column({ type: 'integer' })
  percentage: number;

  @ManyToOne(() => User)
  createdBy: User;

  @BeforeInsert()
  @BeforeUpdate()
  updatePercentage() {
    // Calculate the percentage based on users and products
    this.percentage = Math.min(
      100,
      Math.max(0, (this.users / this.products) * 100),
    );
  }
}
