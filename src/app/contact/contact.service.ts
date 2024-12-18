import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateContactRequestDto } from './dto/create-contact.dto';
import { ContactResponseDto } from './dto/common-contact.dto';
import { UpdateContactRequestDto } from './dto/update-contact.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Contact } from './entities/contact.entity';
import {
  DeleteResult,
  Repository,
  SelectQueryBuilder,
  UpdateResult,
} from 'typeorm';
import { ValidationService } from 'src/common/validation.service';
import { ContactValidation } from './contact.validation';
import { User } from '../user/entities/user.entity';
import { RemoveContactResponseDto } from './dto/remove-contact.dto';
import { SearchContactRequestDto } from './dto/search-contact.dto';
import { WebResponse } from '../web-response';
import { UserService } from '../user/user.service';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    private readonly validationService: ValidationService,
    private readonly userService: UserService,
  ) {}

  // common \\
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
      user: user,
      id: contactId,
    });

    if (!contact) {
      throw new HttpException('Contact is not found', HttpStatus.NOT_FOUND);
    }

    return contact;
  }

  // service \\
  async create(
    userId: string,
    createContactRequestDto: CreateContactRequestDto,
  ): Promise<ContactResponseDto> {
    const validateCreateContactRequestDto: CreateContactRequestDto =
      this.validationService.validate(
        ContactValidation.CREATE,
        createContactRequestDto,
      );

    const user: User = await this.userService.findOneUserById(userId);

    const saveResult: Contact = await this.contactRepository.save({
      ...validateCreateContactRequestDto,
      user: user,
    });

    return this.toContactResponse(saveResult);
  }

  async get(userId: string, contactId: string): Promise<ContactResponseDto> {
    const user: User = await this.userService.findOneUserById(userId);

    const getResult: Contact = await this.toCheckContactExist(user, contactId);

    return this.toContactResponse(getResult);
  }

  async update(
    userId: string,
    updateContactRequestDto: UpdateContactRequestDto,
  ): Promise<ContactResponseDto> {
    const { id, firstName, lastName, email, phone }: UpdateContactRequestDto =
      this.validationService.validate<UpdateContactRequestDto>(
        ContactValidation.UPDATE,
        updateContactRequestDto,
      );

    const user: User = await this.userService.findOneUserById(userId);

    let contact: Contact = await this.toCheckContactExist(user, id);

    const updateContactData: Partial<Contact> = {
      firstName,
      lastName,
      email,
      phone,
    };

    const updateResult: UpdateResult = await this.contactRepository.update(
      { id: contact.id, user: user },
      updateContactData,
    );

    if (updateResult.affected === 0) {
      throw new HttpException(
        'Failed to update contact',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    contact = await this.toCheckContactExist(user, id);

    return this.toContactResponse(contact);
  }

  async remove(userId: string, id: string): Promise<RemoveContactResponseDto> {
    const user: User = await this.userService.findOneUserById(userId);

    const contact: Contact = await this.toCheckContactExist(user, id);

    const removeResult: DeleteResult = await this.contactRepository.delete({
      user: user,
      id: contact.id,
    });

    if (removeResult.affected === 0) {
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

  async search(
    userId: string,
    searchContactRequestDto: SearchContactRequestDto,
  ): Promise<WebResponse<ContactResponseDto[]>> {
    const { name, email, phone, page, size }: SearchContactRequestDto =
      this.validationService.validate<SearchContactRequestDto>(
        ContactValidation.SEARCH,
        searchContactRequestDto,
      );

    const user: User = await this.userService.findOneUserById(userId);

    const selectQuery: SelectQueryBuilder<Contact> = this.contactRepository
      .createQueryBuilder('contacts')
      .select([
        'contacts.firstName',
        'contacts.lastName',
        'contacts.email',
        'contacts.phone',
      ])
      .where('contacts.user_id = :id', {
        id: user.id,
      });

    if (name) {
      selectQuery.andWhere(
        '(contacts.firstName ILIKE :name OR contacts.lastName ILIKE :name)',
        { name: `%${name}%` },
      );
    }

    if (email) {
      selectQuery.andWhere('contacts.email ILIKE :email', {
        email: `%${email}%`,
      });
    }

    if (phone) {
      selectQuery.andWhere('contacts.phone ILIKE :phone', {
        phone: `%${phone}%`,
      });
    }

    const [contacts, totalContacts] = await selectQuery
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();

    // console.info('Generated query sql: ', selectQuery.getSql());
    // console.info(contacts);

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
