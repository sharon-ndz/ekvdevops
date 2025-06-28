import { ApiProperty } from '@nestjs/swagger';
import { File } from '../../entities/file.entity';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { DocumentUploadTypes } from '../../core/constants/enums';

export class FileDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  fileName: string;
  @ApiProperty()
  bucketKey: string;
  @ApiProperty()
  bucketName: string;
  @ApiProperty()
  mimeType: string;
  @ApiProperty()
  checksum: string;
  @ApiProperty({
    type: Date,
    format: 'date',
    example: '2023-09-24T23:27:52.860Z',
  })
  createdAt: Date;

  constructor(file: File) {
    this.id = file.id;
    this.fileName = file.fileName;
    this.bucketKey = file.bucketKey;
    this.bucketName = file.bucketName;
    this.mimeType = file.mimeType;
    this.checksum = file.checksum;
    this.createdAt = file.createdAt;
  }
}

export class FileInterface {
  @ApiProperty()
  @IsNumber()
  fileId: number;

  @ApiProperty()
  @IsEnum(DocumentUploadTypes)
  documentType: DocumentUploadTypes;

  @ApiProperty()
  @IsOptional()
  @IsString()
  fingerType: string;
}

export class CreateFileResponseDto {
  @ApiProperty()
  file: FileDto;
}

export class CreateFileRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty()
  @IsNotEmpty()
  @ApiProperty({ description: 'Remove data:image/png;base64,' })
  base64Image: string;

  @ApiProperty()
  @IsNotEmpty()
  documentType: string;

  @ApiProperty()
  @IsNotEmpty()
  mimeType: string;
}

export class SelectedFileFieldsDto {
  id: number;
  fileName: string;
  bucketKey: string;
  presignedUrl?: string; // Still optional, in case of errors
  base64String?: string;
}
