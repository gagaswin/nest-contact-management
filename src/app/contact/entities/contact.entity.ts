import { Address } from 'src/app/address/entities/address.entity';
import { User } from 'src/app/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'contacts' })
export class Contact {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({ name: 'email', type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
  phone: string;

  @ManyToOne(() => User, (user) => user.contacts, { nullable: false })
  @JoinColumn({ name: 'username' })
  user: User;

  @OneToMany(() => Address, (address) => address.contact)
  address: Address[];
}
