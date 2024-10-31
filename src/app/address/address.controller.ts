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
import { AddressResponseDto } from './dto/common-address.dto';
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

    const createResult: AddressResponseDto = await this.addressService.create(
      user,
      createAddressRequestDto,
    );

    return {
      data: createResult,
    };
  }

  @Get('/:addressId')
  async getAddress(
    @Auth() user: User,
    @Param('contactId') contactId: string,
    @Param('addressId', ParseIntPipe) addressId: number,
  ): Promise<WebResponse<AddressResponseDto>> {
    const getAddressRequestDto: GetAddressRequestDto = { contactId, addressId };

    const getResult: AddressResponseDto = await this.addressService.get(
      user,
      getAddressRequestDto,
    );

    return {
      data: getResult,
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

    const updateResult: AddressResponseDto = await this.addressService.update(
      user,
      updateAddressRequestDto,
    );

    return {
      data: updateResult,
    };
  }

  @Delete('/:addressId')
  async removeAddress(
    @Auth() user: User,
    @Param('contactId') contactId: string,
    @Param('addressId', ParseIntPipe) addressId: number,
  ): Promise<WebResponse<RemoveAddressResponseDto>> {
    const removeAddressRequestDto: RemoveAddressRequestDto = {
      contactId,
      addressId,
    };

    const removeResult: RemoveAddressResponseDto =
      await this.addressService.remove(user, removeAddressRequestDto);

    return {
      data: removeResult,
    };
  }

  @Get()
  async getListAddress(
    @Auth() user: User,
    @Param('contactId') contactId: string,
  ): Promise<WebResponse<AddressResponseDto[]>> {
    const getListResult: AddressResponseDto[] =
      await this.addressService.getList(user, contactId);

    return {
      data: getListResult,
    };
  }
}
