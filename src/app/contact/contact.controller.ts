import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactResponseDto, CreateContactRequestDto } from './dto/contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Auth } from 'src/common/auth.decorator';
import { User } from '../user/entities/user.entity';
import { WebResponse } from '../web-response';

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

  @Get()
  findAll() {
    return this.contactService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contactService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContactDto: UpdateContactDto) {
    return this.contactService.update(+id, updateContactDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contactService.remove(+id);
  }
}
