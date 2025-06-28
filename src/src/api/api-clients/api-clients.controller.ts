import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiClientsService } from './api-clients.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ListInterface, RequestResultInterface } from '../../core/interfaces/all.interface';
import {
  ApiClientAuthDto,
  ApiClientChangeStatusDto,
  ApiClientCreateDto,
  ApiClientCreateResultInterface,
  ApiClientResultInterface,
  ApiClientUpdateDto,
} from './api-clients.dto';

@Controller('api-clients')
export class ApiClientsController {
  constructor(private readonly service: ApiClientsService) {}

  @Post('/auth')
  async login(@Body() data: ApiClientAuthDto) {
    return this.service.authenticate(data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/')
  async findAll(@Query() data: ListInterface): Promise<ApiClientResultInterface> {
    return await this.service.findAll(data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/')
  async create(
    @Body() data: ApiClientCreateDto,
    @Req() req: any,
  ): Promise<ApiClientCreateResultInterface> {
    return await this.service.create(data, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/change-status')
  async changeStatus(
    @Body() data: ApiClientChangeStatusDto,
    @Req() req: any,
  ): Promise<RequestResultInterface> {
    return this.service.changeStatus(data, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/reset-password/:id')
  async resetPassword(@Param('id') id: number, @Req() req: any): Promise<RequestResultInterface> {
    return this.service.resetPassword({ id }, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async update(@Body() data: ApiClientUpdateDto, @Req() req: any): Promise<RequestResultInterface> {
    return await this.service.update(data, req.user);
  }
}
