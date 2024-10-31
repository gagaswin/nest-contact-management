import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAddressRequestDto } from './dto/create-address.dto';
import { UpdateAddressRequestDto } from './dto/update-address.dto';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Address } from './entities/address.entity';
import { AddressValidation } from './address.validation';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidationService } from 'src/common/validation.service';
import { AddressResponseDto } from './dto/common-address.dto';
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

  private toAddressResponse(address: Address): AddressResponseDto {
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

  async create(
    user: User,
    createAddressRequestDto: CreateAddressRequestDto,
  ): Promise<AddressResponseDto> {
    const valiateCreateAddressRequestDto: CreateAddressRequestDto =
      this.validationService.validate<CreateAddressRequestDto>(
        AddressValidation.CREATE,
        createAddressRequestDto,
      );

    const contact: Contact = await this.contactService.toCheckContactExist(
      user,
      valiateCreateAddressRequestDto.contactId,
    );

    const saveResult: Address = await this.addressRepository.save({
      ...valiateCreateAddressRequestDto,
      contact,
    });

    return this.toAddressResponse(saveResult);
  }

  async get(
    user: User,
    getAddressRequestDto: GetAddressRequestDto,
  ): Promise<AddressResponseDto> {
    const { contactId, addressId }: GetAddressRequestDto =
      this.validationService.validate<GetAddressRequestDto>(
        AddressValidation.GET,
        getAddressRequestDto,
      );

    const contact: Contact = await this.contactService.toCheckContactExist(
      user,
      contactId,
    );

    const address: Address = await this.toCheckAddressExist(contact, addressId);

    return this.toAddressResponse(address);
  }

  async update(
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

    const updateAddress: UpdateResult = await this.addressRepository.update(
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

  async remove(
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

    const removeResult: DeleteResult = await this.addressRepository.delete({
      contact: contact,
      id: address.id,
    });

    if (removeResult.affected === 0) {
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

  async getList(user: User, contactId: string): Promise<AddressResponseDto[]> {
    const contact: Contact = await this.contactService.toCheckContactExist(
      user,
      contactId,
    );

    const getListResult: Address[] = await this.addressRepository.findBy({
      contact: contact,
    });

    return getListResult.map((address) => this.toAddressResponse(address));
  }
}
