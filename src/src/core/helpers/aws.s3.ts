import { v4 as uuidv4 } from 'uuid';
import {
  DeleteObjectCommand,
  DeleteObjectCommandInput,
  GetObjectCommand,
  GetObjectCommandInput,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { awsConstants } from '../constants/constants';
import fs from 'fs';
import * as path from 'path';

class AttachmentUtils {
  private readonly s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      region: awsConstants.region,
      credentials: {
        accessKeyId: awsConstants.accessKeyId,
        secretAccessKey: awsConstants.secret,
      },
    });
  }

  async getFile(key: string) {
    const input = {
      Bucket: awsConstants.s3Bucket,
      Key: key,
    };
    const command = new GetObjectCommand(input);
    return await this.s3.send(command);
  }

  imageUrl(filename: string): string {
    return `https://${awsConstants.s3Bucket}.s3.amazonaws.com/${filename}`;
  }

  async generateUploadUrl(filename: string): Promise<{ url: string; key: string }> {
    try {
      const fileName = `${uuidv4()}-${filename}`;
      const params = {
        Bucket: awsConstants.s3Bucket,
        Key: fileName,
      };

      const command = new PutObjectCommand(params);
      const url = await getSignedUrl(this.s3, command, { expiresIn: 10 * 60 });

      return { url, key: fileName };
    } catch (error) {
      console.error('Error generating upload URL:', error);
      throw new Error('Error generating upload URL');
    }
  }

  async localFileToBase64(fileName: string) {
    const filePath = path.join(__dirname, '..', '..', 'assets', 'images', fileName);
    return new Promise((resolve: (value: any) => void, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        const base64String = data.toString('base64');
        resolve(base64String);
      });
    });
  }

  async getPreSignedUrl(filename: string): Promise<string> {
    try {
      const params = {
        Bucket: awsConstants.s3Bucket,
        Key: filename,
      };

      const command = new GetObjectCommand(params);
      return await getSignedUrl(this.s3, command, { expiresIn: 10 * 60 });
    } catch (error) {
      console.error('Error generating Presigned URL:', error);
      throw new Error('Error generating Presigned URL');
    }
  }

  // Function to upload a base64 string to S3
  async uploadBase64(param: { base64String: string; objectKey: string; stringContent?: boolean }) {
    try {
      // param.stringContent is set to true the content will be uploaded as it is else the buffer will be uploaded
      const body = param.stringContent
        ? param.base64String
        : // Decode the base64 string and create a Buffer object
          Buffer.from(param.base64String, 'base64');

      const uploadParams = {
        Bucket: awsConstants.s3Bucket,
        Key: param.objectKey,
        Body: body,
      };

      const data = await this.s3.send(new PutObjectCommand(uploadParams));
      console.log('file uploaded successfully!');
      return data;
    } catch (err) {
      console.error('Error uploading file:', err);
    }
  }

  async getFileContentBase64(fileName: string) {
    const urlCommand: GetObjectCommandInput = {
      Bucket: awsConstants.s3Bucket,
      Key: fileName,
    };

    const command = new GetObjectCommand(urlCommand);

    const response = await this.s3.send(command);
    return response.Body.transformToString('base64');
  }

  async uploadBase64FileToS3(base64Image: string, bucketKey: string, mimeType: string) {
    //upload to S3
    const input: PutObjectCommandInput = {
      Body: Buffer.from(base64Image, 'base64'),
      Bucket: awsConstants.s3Bucket,
      Key: bucketKey,
      ContentType: mimeType,
    };
    const command = new PutObjectCommand(input);
    return await this.s3.send(command);
  }

  /**
   * Deletes a file from the S3 bucket.
   * @param key The S3 object key of the file to delete.
   */
  async deleteFileFromS3(key: string): Promise<void> {
    if (!key) {
      console.warn('Attempted to delete file from S3 with an empty key. Skipping.');
      return;
    }
    try {
      const params: DeleteObjectCommandInput = {
        Bucket: awsConstants.s3Bucket,
        Key: key,
      };
      const command = new DeleteObjectCommand(params);
      await this.s3.send(command);
      console.log(`Successfully deleted file from S3: ${key}`);
    } catch (error) {
      console.error(`Error deleting file ${key} from S3:`, error);
      throw new Error(`Failed to delete S3 object ${key}: ${(error as Error).message}`);
    }
  }
}

export default AttachmentUtils;
