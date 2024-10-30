export class UpdateAddressRequestDto {
  id: number;
  street?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  contactId: string;
}
