import { Contact } from 'src/app/contact/entities/contact.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'address' })
export class Address {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'street', type: 'varchar', length: 255, nullable: true })
  street: string;

  @Column({ name: 'city', type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ name: 'province', type: 'varchar', length: 100, nullable: true })
  province: string;

  @Column({ name: 'country', type: 'varchar', length: 100 })
  country: string;

  @Column({ name: 'postal_code', type: 'varchar', length: 10 })
  postalCode: string;

  @ManyToOne(() => Contact, (contact) => contact.id, { nullable: false })
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;
}
