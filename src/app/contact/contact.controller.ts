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
import { CreateContactRequestDto } from './dto/create-contact.dto';
import { ContactResponseDto } from './dto/common-contact.dto';
import { UpdateContactRequestDto } from './dto/update-contact.dto';
import { WebResponse } from '../web-response';
import { RemoveContactResponseDto } from './dto/remove-contact.dto';
import { UserAuth } from '../auth/decorator/user-auth.decorator';
import IJwtPayload from 'src/utils/IJwtPayload.interface';

@Controller('/api/contacts')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async createContact(
    @UserAuth() user: IJwtPayload,
    @Body() createContactRequestDto: CreateContactRequestDto,
  ): Promise<WebResponse<ContactResponseDto>> {
    const saveResult: ContactResponseDto = await this.contactService.create(
      user.userId,
      createContactRequestDto,
    );

    return {
      data: saveResult,
    };
  }

  @Get('/:contactId')
  async getContact(
    @UserAuth() user: IJwtPayload,
    @Param('contactId') contactId: string,
  ): Promise<WebResponse<ContactResponseDto>> {
    const contact: ContactResponseDto = await this.contactService.get(
      user.userId,
      contactId,
    );

    return {
      data: contact,
    };
  }

  @Patch('/:contactId')
  async updateContact(
    @UserAuth() user: IJwtPayload,
    @Param('contactId') contactId: string,
    @Body() updateContactRequestDto: UpdateContactRequestDto,
  ): Promise<WebResponse<ContactResponseDto>> {
    updateContactRequestDto.id = contactId;

    const updateResult: ContactResponseDto = await this.contactService.update(
      user.userId,
      updateContactRequestDto,
    );

    return {
      data: updateResult,
    };
  }

  @Delete('/:contactId')
  async removeContact(
    @UserAuth() user: IJwtPayload,
    @Param('contactId') contactId: string,
  ): Promise<WebResponse<RemoveContactResponseDto>> {
    const removeResult: RemoveContactResponseDto =
      await this.contactService.remove(user.userId, contactId);

    return {
      data: removeResult,
    };
  }

  @Get()
  async searchContacts(
    @UserAuth() user: IJwtPayload,
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('phone') phone?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('size', new ParseIntPipe({ optional: true })) size: number = 10,
  ): Promise<WebResponse<ContactResponseDto[]>> {
    const searchResult: WebResponse<ContactResponseDto[]> =
      await this.contactService.search(user.userId, {
        name,
        email,
        phone,
        page,
        size,
      });

    return searchResult;
  }
}
