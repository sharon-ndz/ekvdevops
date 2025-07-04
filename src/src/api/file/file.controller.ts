import { Controller, Post, Body } from '@nestjs/common';
import { FileService } from './file.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateFileRequestDto, CreateFileResponseDto } from './file.dto';

@ApiTags('files')
@Controller('files')
export class FileController {
  constructor(private readonly service: FileService) {}

  @Post()
  @ApiOperation({ description: 'Create file and upload to S3 bucket' })
  @ApiResponse({ status: 200, type: CreateFileResponseDto })
  async create(@Body() createFileDto: CreateFileRequestDto): Promise<CreateFileResponseDto> {
    return await this.service.create(createFileDto);
  }
}
