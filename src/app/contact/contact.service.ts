import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ContactResponseDto, CreateContactRequestDto } from './dto/contact.dto';
import { UpdateContactRequestDto } from './dto/update-contact.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Contact } from './entities/contact.entity';
import { Repository, UpdateResult } from 'typeorm';
import { ValidationService } from 'src/common/validation.service';
import { ContactValidation } from './contact.validation';
import { User } from '../user/entities/user.entity';
import { RemoveContactResponseDto } from './dto/remove-contact.dto';
import { SearchContactRequestDto } from './dto/search-contact.dto';
import { WebResponse } from '../web-response';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    private readonly validationService: ValidationService,
  ) {}

  private toContactResponse(contact: Contact): ContactResponseDto {
    return {
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
    };
  }

  async toCheckContactExist(user: User, contactId: string): Promise<Contact> {
    const contact: Contact = await this.contactRepository.findOneBy({
      id: contactId,
      user: user,
    });

    if (!contact) {
      throw new HttpException('Contact is not found', HttpStatus.NOT_FOUND);
    }

    return contact;
  }

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
    const contact: Contact = await this.toCheckContactExist(user, contactId);
    return this.toContactResponse(contact);
  }

  async updateContact(
    user: User,
    updateContactRequestDto: UpdateContactRequestDto,
  ): Promise<ContactResponseDto> {
    const validateContact: UpdateContactRequestDto =
      this.validationService.validate<UpdateContactRequestDto>(
        ContactValidation.UPDATE,
        updateContactRequestDto,
      );

    let contact: Contact = await this.toCheckContactExist(
      user,
      validateContact.id,
    );

    const updateResult: UpdateResult = await this.contactRepository.update(
      { id: contact.id, user: user },
      {
        firstName: validateContact.firstName,
        lastName: validateContact.lastName,
        email: validateContact.email,
        phone: validateContact.phone,
      },
    );

    if (updateResult.affected === 0) {
      throw new HttpException(
        'Failed to update contact',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    contact = await this.toCheckContactExist(user, validateContact.id);

    // // Update the contact entity with new values
    // contact.firstName = validateContact.firstName;
    // contact.lastName = validateContact.lastName;
    // contact.email = validateContact.email;
    // contact.phone = validateContact.phone;
    // // Use save to update the contact
    // contact = await this.contactRepository.save(contact);

    // // coba pake queryBuilder // masih belum bisa
    // await this.contactRepository
    //   .createQueryBuilder()
    //   .update(Contact)
    //   .set({
    //     firstName: validateContact.firstName,
    //     lastName: validateContact.lastName,
    //     email: validateContact.email,
    //     phone: validateContact.phone,
    //   })
    //   .where('id = :id AND user = :user', { id: contact.id, user: user })
    //   .returning(['first_name', 'last_name', 'email', 'phone'])
    //   .execute();

    return this.toContactResponse(contact);
  }

  async removeContact(
    user: User,
    id: string,
  ): Promise<RemoveContactResponseDto> {
    const contact: Contact = await this.toCheckContactExist(user, id);

    const removeContact = await this.contactRepository.delete({
      user: user,
      id: contact.id,
    });

    if (removeContact.affected === 0) {
      throw new HttpException(
        'Failed to delete contact',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      firstName: contact.firstName,
      isRemove: true,
    };
  }

  async searchContact(
    user: User,
    searchRequestDto: SearchContactRequestDto,
  ): Promise<WebResponse<ContactResponseDto[]>> {
    const { name, email, phone, page, size }: SearchContactRequestDto =
      this.validationService.validate<SearchContactRequestDto>(
        ContactValidation.SEARCH,
        searchRequestDto,
      );

    const query = this.contactRepository
      .createQueryBuilder('contacts')
      .select([
        'contacts.firstName',
        'contacts.lastName',
        'contacts.email',
        'contacts.phone',
      ])
      .where('contacts.username = :username', {
        username: user.username,
      });

    if (name) {
      query.andWhere(
        '(contacts.firstName ILIKE :name OR contacts.lastName ILIKE :name)',
        { name: `%${name}%` },
      );
    }

    if (email) {
      query.andWhere('contacts.email ILIKE :email', { email: `%${email}%` });
    }

    if (phone) {
      query.andWhere('contacts.phone ILIKE :phone', { phone: `%${phone}%` });
    }

    const [contacts, totalContacts] = await query
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();

    console.info('Generated query sql: ', query.getSql());
    console.info(contacts);

    return {
      data: contacts.map((contact) => this.toContactResponse(contact)),
      paging: {
        current_page: page,
        size: size,
        total_page: Math.ceil(totalContacts / size),
      },
    };
  }
}
