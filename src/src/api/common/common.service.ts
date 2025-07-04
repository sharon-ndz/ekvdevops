import { BadRequestException, Injectable } from '@nestjs/common';
import AttachmentUtils from '../../core/helpers/aws.s3';

@Injectable()
export class CommonService {
  constructor() {}
  /**
   * Generate file upload url
   * @param fileName
   */
  async fileUploadUrl(fileName: string): Promise<{ url: string; key: string }> {
    if (!fileName) {
      throw new BadRequestException({
        statusCode: 400,
        message: ['File name is required'],
      });
    }

    const awsS3bucket = new AttachmentUtils();
    return await awsS3bucket.generateUploadUrl(fileName);
  }

  /**
   * Get pre-signed url by file name
   * @param fileName
   */
  async getPreSignedUrl(fileName: string): Promise<{ url: string }> {
    if (!fileName) {
      throw new BadRequestException({
        statusCode: 400,
        message: ['File name is required'],
      });
    }

    let url: string;

    try {
      const awsS3bucket = new AttachmentUtils();
      url = await awsS3bucket.getPreSignedUrl(fileName);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }

    return {
      url: url,
    };
  }
}
