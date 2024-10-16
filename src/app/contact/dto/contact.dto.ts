export class CreateContactRequestDto {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export class ContactResponseDto {
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
}
