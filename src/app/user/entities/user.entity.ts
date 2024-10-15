import { Contact } from 'src/app/contact/entities/contact.entity';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

@Entity({ name: 'user' })
export class User {
  @PrimaryColumn({ name: 'username', type: 'varchar', length: 100 })
  username: string;

  @Column({ name: 'password', type: 'varchar', length: 100 })
  password: string;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'token', type: 'varchar', nullable: true })
  token: string;

  @OneToMany(() => Contact, (contact) => contact.user)
  contacts: Contact[];
}
