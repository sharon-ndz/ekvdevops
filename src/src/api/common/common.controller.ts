import { Controller, Get, Param } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CommonService } from './common.service';
import { ApiOperation } from '@nestjs/swagger';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
@Throttle(5, 60)
@Controller('common')
export class CommonController {
  constructor(private readonly service: CommonService) {}

  @ApiOperation({
    summary: 'Generate file upload url to upload from client to S3',
  })
  @Get('/file-upload-url/:fileName')
  async fileUploadUrl(@Param('fileName') fileName: string): Promise<{ url: string; key: string }> {
    return await this.service.fileUploadUrl(fileName);
  }

  @ApiOperation({
    summary: 'Get presigned url for a file using the filename',
  })
  @Get('/get-preview-url/:fileName')
  async getPreSignedUrl(@Param('fileName') fileName: string): Promise<{ url: string }> {
    return await this.service.getPreSignedUrl(fileName);
  }
}
