export class RemoveAddressRequestDto {
  contactId: string;
  addressId: number;
}

export class RemoveAddressResponseDto {
  addressId: number;
  isRemove: boolean;
}
