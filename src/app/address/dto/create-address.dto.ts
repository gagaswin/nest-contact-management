export class CreateAddressRequestDto {
  contactId: string;
  street?: string;
  city?: string;
  province?: string;
  country: string;
  postalCode: string;
}
