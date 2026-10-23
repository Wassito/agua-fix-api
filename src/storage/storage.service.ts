import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { envs } from '../config/envs';

export interface UploadFile {
  buffer: Buffer;
  mimetype: string;
}

@Injectable()
export class StorageService {
  private readonly client = new S3Client({ region: envs.AWS_REGION });

  async uploadFile(file: UploadFile, folder: string): Promise<string> {
    if (!file?.buffer?.length) throw new BadRequestException('La foto es obligatoria');
    const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[file.mimetype];
    if (!extension) throw new BadRequestException('Usa una foto JPEG, PNG o WebP');
    const key = `${folder.replace(/^\/+|\/+$/g, '')}/${randomUUID()}.${extension}`;
    await this.client.send(new PutObjectCommand({
      Bucket: envs.S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));
    return `https://${envs.S3_BUCKET}.s3.${envs.AWS_REGION}.amazonaws.com/${key}`;
  }
}
