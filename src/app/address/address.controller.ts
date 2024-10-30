import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressRequestDto } from './dto/create-address.dto';
import { UpdateAddressRequestDto } from './dto/update-address.dto';
import { Auth } from 'src/common/auth.decorator';
import { User } from '../user/entities/user.entity';
import { WebResponse } from '../web-response';
import { AddressResponseDto } from './dto/address.dto';
import { GetAddressRequestDto } from './dto/get-address.dto';
import {
  RemoveAddressRequestDto,
  RemoveAddressResponseDto,
} from './dto/remove-address.dto';

@Controller('/api/contacts/:contactId/addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  async createAddress(
    @Auth() user: User,
    @Param('contactId') contactId: string,
    @Body() createAddressRequestDto: CreateAddressRequestDto,
  ): Promise<WebResponse<AddressResponseDto>> {
    createAddressRequestDto.contactId = contactId;
    const address = await this.addressService.createAddress(
      user,
      createAddressRequestDto,
    );

    return {
      data: address,
    };
  }

  @Get('/:addressId')
  async getAddress(
    @Auth() user: User,
    @Param('contactId') contactId: string,
    @Param('addressId', ParseIntPipe) addressId: number,
  ): Promise<WebResponse<AddressResponseDto>> {
    const getRequest: GetAddressRequestDto = { contactId, addressId };
    const address: AddressResponseDto = await this.addressService.getAddress(
      user,
      getRequest,
    );

    return {
      data: address,
    };
  }

  @Patch('/:addressId')
  async updateAddress(
    @Auth() user: User,
    @Param('contactId') contactId: string,
    @Param('addressId', ParseIntPipe) addressId: number,
    @Body() updateAddressRequestDto: UpdateAddressRequestDto,
  ): Promise<WebResponse<AddressResponseDto>> {
    updateAddressRequestDto.contactId = contactId;
    updateAddressRequestDto.id = addressId;

    console.info('contactId type: ', typeof contactId);
    console.info('addressId type: ', typeof addressId);

    const updateRequest: AddressResponseDto =
      await this.addressService.updateAddress(user, updateAddressRequestDto);

    return {
      data: updateRequest,
    };
  }

  @Delete('/:addressId')
  async removeAddress(
    @Auth() user: User,
    @Param('contactId') contactId: string,
    @Param('addressId', ParseIntPipe) addressId: number,
  ): Promise<WebResponse<RemoveAddressResponseDto>> {
    const removeRequest: RemoveAddressRequestDto = {
      contactId,
      addressId,
    };

    const removeAddress = await this.addressService.removeAddress(
      user,
      removeRequest,
    );

    return {
      data: removeAddress,
    };
  }

  @Get()
  async getListAddress(
    @Auth() user: User,
    @Param('contactId') contactId: string,
  ): Promise<WebResponse<AddressResponseDto[]>> {
    const listAddress = await this.addressService.getListAddress(
      user,
      contactId,
    );
    return {
      data: listAddress,
    };
  }
}
