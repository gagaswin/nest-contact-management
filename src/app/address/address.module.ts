import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Contact } from '../contact/entities/contact.entity';
import { Address } from './entities/address.entity';
import { ContactModule } from '../contact/contact.module';
import { UserService } from '../user/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Contact, Address]), ContactModule],
  controllers: [AddressController],
  providers: [AddressService, UserService],
})
export class AddressModule {}
