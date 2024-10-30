import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAddressRequestDto } from './dto/create-address.dto';
import { UpdateAddressRequestDto } from './dto/update-address.dto';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { AddressValidation } from './address.validation';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidationService } from 'src/common/validation.service';
import { AddressResponseDto } from './dto/address.dto';
import { User } from '../user/entities/user.entity';
import { ContactService } from '../contact/contact.service';
import { GetAddressRequestDto } from './dto/get-address.dto';
import { Contact } from '../contact/entities/contact.entity';
import {
  RemoveAddressRequestDto,
  RemoveAddressResponseDto,
} from './dto/remove-address.dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    private readonly validationService: ValidationService,
    private readonly contactService: ContactService,
  ) {}

  toAddressResponse(address: Address): AddressResponseDto {
    return {
      id: address.id,
      street: address.street,
      city: address.city,
      province: address.province,
      postalCode: address.postalCode,
      country: address.country,
    };
  }

  async toCheckAddressExist(
    contact: Contact,
    addressId: number,
  ): Promise<Address> {
    const address: Address = await this.addressRepository.findOneBy({
      id: addressId,
      contact: contact,
    });

    if (!address) {
      throw new HttpException('Address is not found', HttpStatus.NOT_FOUND);
    }

    return address;
  }

  async createAddress(
    user: User,
    createAddressRequestDto: CreateAddressRequestDto,
  ): Promise<AddressResponseDto> {
    const validateCreateAddress: CreateAddressRequestDto =
      this.validationService.validate<CreateAddressRequestDto>(
        AddressValidation.CREATE,
        createAddressRequestDto,
      );

    const contact: Contact = await this.contactService.toCheckContactExist(
      user,
      validateCreateAddress.contactId,
    );

    const saveAddress = await this.addressRepository.save({
      ...validateCreateAddress,
      contact,
    });

    return this.toAddressResponse(saveAddress);
  }

  async getAddress(
    user: User,
    getAddressRequest: GetAddressRequestDto,
  ): Promise<AddressResponseDto> {
    const validateGetAddressRequestDto: GetAddressRequestDto =
      this.validationService.validate<GetAddressRequestDto>(
        AddressValidation.GET,
        getAddressRequest,
      );

    const contact: Contact = await this.contactService.toCheckContactExist(
      user,
      validateGetAddressRequestDto.contactId,
    );

    const address: Address = await this.toCheckAddressExist(
      contact,
      validateGetAddressRequestDto.addressId,
    );

    return this.toAddressResponse(address);
  }

  async updateAddress(
    user: User,
    updateAddressRequestDto: UpdateAddressRequestDto,
  ): Promise<AddressResponseDto> {
    const {
      id,
      street,
      city,
      province,
      postalCode,
      country,
      contactId,
    }: UpdateAddressRequestDto = this.validationService.validate(
      AddressValidation.UPDATE,
      updateAddressRequestDto,
    );

    const contact: Contact = await this.contactService.toCheckContactExist(
      user,
      contactId,
    );

    let address: Address = await this.toCheckAddressExist(contact, id);

    const updateAddress = await this.addressRepository.update(
      { id: address.id, contact: contact },
      { street, city, province, postalCode, country },
    );

    if (updateAddress.affected === 0) {
      throw new HttpException(
        'Failed to update address',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    address = await this.toCheckAddressExist(contact, id);

    return this.toAddressResponse(address);
  }

  async removeAddress(
    user: User,
    removeAddressRequestDto: RemoveAddressRequestDto,
  ): Promise<RemoveAddressResponseDto> {
    const { contactId, addressId }: RemoveAddressRequestDto =
      this.validationService.validate<RemoveAddressRequestDto>(
        AddressValidation.REMOVE,
        removeAddressRequestDto,
      );

    const contact: Contact = await this.contactService.toCheckContactExist(
      user,
      contactId,
    );

    const address: Address = await this.toCheckAddressExist(contact, addressId);

    const removeAddress = await this.addressRepository.delete({
      contact: contact,
      id: address.id,
    });

    if (removeAddress.affected === 0) {
      throw new HttpException(
        'Failed to delete address',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      addressId: address.id,
      isRemove: true,
    };
  }

  async getListAddress(
    user: User,
    contactId: string,
  ): Promise<AddressResponseDto[]> {
    const contact: Contact = await this.contactService.toCheckContactExist(
      user,
      contactId,
    );

    const listAddress: Address[] = await this.addressRepository.findBy({
      contact: contact,
    });

    return listAddress.map((address) => this.toAddressResponse(address));
  }
}
