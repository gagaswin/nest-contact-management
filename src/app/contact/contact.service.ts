import { HttpException, Injectable, Post } from '@nestjs/common';
import { ContactResponseDto, CreateContactRequestDto } from './dto/contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Contact } from './entities/contact.entity';
import { Repository } from 'typeorm';
import { ValidationService } from 'src/common/validation.service';
import { ContactValidation } from './contact.validation';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    private readonly validationService: ValidationService,
  ) {}

  toContactResponse(contact: Contact): ContactResponseDto {
    return {
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
    };
  }

  @Post()
  async createContact(
    user: User,
    createContactDto: CreateContactRequestDto,
  ): Promise<ContactResponseDto> {
    const createRequest: CreateContactRequestDto =
      this.validationService.validate(
        ContactValidation.CREATE,
        createContactDto,
      );

    const saveContact = await this.contactRepository.save({
      ...createRequest,
      user: user,
    });

    return this.toContactResponse(saveContact);
  }

  async getContact(user: User, contactId: string): Promise<ContactResponseDto> {
    const contact: Contact = await this.contactRepository.findOneBy({
      user: user,
      id: contactId,
    });

    if (!contact) throw new HttpException('Contact is not found', 404);

    return this.toContactResponse(contact);
  }

  findAll() {
    return `This action returns all contact`;
  }

  findOne(id: number) {
    return `This action returns a #${id} contact`;
  }

  update(id: number, updateContactDto: UpdateContactDto) {
    return `This action updates a #${id} contact`;
  }

  remove(id: number) {
    return `This action removes a #${id} contact`;
  }
}
