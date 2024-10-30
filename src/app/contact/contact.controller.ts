import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactResponseDto, CreateContactRequestDto } from './dto/contact.dto';
import { UpdateContactRequestDto } from './dto/update-contact.dto';
import { Auth } from 'src/common/auth.decorator';
import { User } from '../user/entities/user.entity';
import { WebResponse } from '../web-response';
import { RemoveContactResponseDto } from './dto/remove-contact.dto';

@Controller('/api/contacts')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async createContact(
    @Auth() user: User,
    @Body() createContactDto: CreateContactRequestDto,
  ): Promise<WebResponse<ContactResponseDto>> {
    const result = await this.contactService.createContact(
      user,
      createContactDto,
    );
    return {
      data: result,
    };
  }

  @Get('/:contactId')
  async getContact(
    @Auth() user: User,
    @Param('contactId') contactId: string,
  ): Promise<WebResponse<ContactResponseDto>> {
    const contact = await this.contactService.getContact(user, contactId);
    return {
      data: contact,
    };
  }

  @Patch('/:contactId')
  async updateContact(
    @Auth() user: User,
    @Param('contactId') contactId: string,
    @Body() updateContactRequestDto: UpdateContactRequestDto,
  ): Promise<WebResponse<ContactResponseDto>> {
    updateContactRequestDto.id = contactId;
    const resultUpdate: ContactResponseDto =
      await this.contactService.updateContact(user, updateContactRequestDto);
    return {
      data: resultUpdate,
    };
  }

  @Delete('/:contactId')
  async removeContact(
    @Auth() user: User,
    @Param('contactId') contactId: string,
  ): Promise<WebResponse<RemoveContactResponseDto>> {
    const removeContact: RemoveContactResponseDto =
      await this.contactService.removeContact(user, contactId);

    return {
      data: removeContact,
    };
  }

  @Get()
  async searchContacts(
    @Auth() user: User,
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('phone') phone?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('size', new ParseIntPipe({ optional: true })) size: number = 10,
  ): Promise<WebResponse<ContactResponseDto[]>> {
    const contacts = this.contactService.searchContact(user, {
      name,
      email,
      phone,
      page,
      size,
    });
    return contacts;
  }
}
