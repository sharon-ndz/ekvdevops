import { Injectable } from '@nestjs/common';
import * as uuid from 'uuid';
import * as mime from 'mime';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFileRequestDto, FileDto } from './file.dto';
import { File } from '../../entities/file.entity';
import AttachmentUtils from '../../core/helpers/aws.s3';
import { awsConstants } from '../../core/constants/constants';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
  ) {}

  /**
   * Upload file
   * @param createFileDto
   */
  async create(createFileDto: CreateFileRequestDto) {
    let mimeType = mime.getType(createFileDto.fileName);
    if (!mimeType) {
      mimeType = createFileDto.mimeType;
    }
    let fileName = `${uuid.v4()}.${mime.getExtension(mimeType)}`;
    if (createFileDto.fileName.includes('.wsq')) {
      mimeType = 'application/octet-stream';
      fileName = `${uuid.v4()}.wsq`;
    }

    const awsS3bucket = new AttachmentUtils();
    const s3PutObjectResponse = await awsS3bucket.uploadBase64FileToS3(
      createFileDto.base64Image,
      fileName,
      mimeType,
    );

    const fileRecord = await this.fileRepository.insert({
      fileName: createFileDto.fileName,
      bucketKey: fileName,
      bucketName: awsConstants.s3Bucket,
      mimeType,
      checksum: s3PutObjectResponse.ETag.replace(/"/g, ''),
    });

    const savedFile = await this.fileRepository.findOne({ where: { id: fileRecord.raw[0].id } });
    return { file: new FileDto(savedFile) };
  }

  /**
   * Get file by id
   * @param id
   */
  async getFileById(id: number): Promise<string> {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) {
      return null;
    }
    const awsS3bucket = new AttachmentUtils();
    return await awsS3bucket.getFileContentBase64(file.bucketKey);
  }

  /**
   * Get presigned url by fileId
   * @param id
   */
  async getPreSignedUrlByFileId(id: number): Promise<string> {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) {
      return null;
    }
    const awsS3bucket = new AttachmentUtils();
    return await awsS3bucket.getPreSignedUrl(file.bucketKey);
  }
}
