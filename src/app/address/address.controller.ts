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
import { WebResponse } from '../web-response';
import { AddressResponseDto } from './dto/common-address.dto';
import { GetAddressRequestDto } from './dto/get-address.dto';
import {
  RemoveAddressRequestDto,
  RemoveAddressResponseDto,
} from './dto/remove-address.dto';
import { UserAuth } from '../auth/decorator/user-auth.decorator';
import IJwtPayload from 'src/utils/IJwtPayload.interface';

@Controller('/api/contacts/:contactId/addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  async createAddress(
    @UserAuth() user: IJwtPayload,
    @Param('contactId') contactId: string,
    @Body() createAddressRequestDto: CreateAddressRequestDto,
  ): Promise<WebResponse<AddressResponseDto>> {
    createAddressRequestDto.contactId = contactId;

    const createResult: AddressResponseDto = await this.addressService.create(
      user.userId,
      createAddressRequestDto,
    );

    return {
      data: createResult,
    };
  }

  @Get('/:addressId')
  async getAddress(
    @UserAuth() user: IJwtPayload,
    @Param('contactId') contactId: string,
    @Param('addressId', ParseIntPipe) addressId: number,
  ): Promise<WebResponse<AddressResponseDto>> {
    const getAddressRequestDto: GetAddressRequestDto = { contactId, addressId };

    const getResult: AddressResponseDto = await this.addressService.get(
      user.userId,
      getAddressRequestDto,
    );

    return {
      data: getResult,
    };
  }

  @Patch('/:addressId')
  async updateAddress(
    @UserAuth() user: IJwtPayload,
    @Param('contactId') contactId: string,
    @Param('addressId', ParseIntPipe) addressId: number,
    @Body() updateAddressRequestDto: UpdateAddressRequestDto,
  ): Promise<WebResponse<AddressResponseDto>> {
    updateAddressRequestDto.contactId = contactId;
    updateAddressRequestDto.id = addressId;

    const updateResult: AddressResponseDto = await this.addressService.update(
      user.userId,
      updateAddressRequestDto,
    );

    return {
      data: updateResult,
    };
  }

  @Delete('/:addressId')
  async removeAddress(
    @UserAuth() user: IJwtPayload,
    @Param('contactId') contactId: string,
    @Param('addressId', ParseIntPipe) addressId: number,
  ): Promise<WebResponse<RemoveAddressResponseDto>> {
    const removeAddressRequestDto: RemoveAddressRequestDto = {
      contactId,
      addressId,
    };

    const removeResult: RemoveAddressResponseDto =
      await this.addressService.remove(user.userId, removeAddressRequestDto);

    return {
      data: removeResult,
    };
  }

  @Get()
  async getListAddress(
    @UserAuth() user: IJwtPayload,
    @Param('contactId') contactId: string,
  ): Promise<WebResponse<AddressResponseDto[]>> {
    const getListResult: AddressResponseDto[] =
      await this.addressService.getList(user.userId, contactId);

    return {
      data: getListResult,
    };
  }
}
