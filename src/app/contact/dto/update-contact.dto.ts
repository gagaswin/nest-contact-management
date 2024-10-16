import { PartialType } from '@nestjs/mapped-types';
import { CreateContactRequestDto } from './contact.dto';

export class UpdateContactDto extends PartialType(CreateContactRequestDto) {}
