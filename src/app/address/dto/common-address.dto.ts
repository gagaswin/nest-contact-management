export class AddressResponseDto {
  id: number;
  street?: string;
  city?: string;
  province?: string;
  country: string;
  postalCode: string;
}
