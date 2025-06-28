import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { LicenseFile } from './license-file.entity';
import { ApplicantFile } from './applicant-file.entity';

@Entity({ name: 'files' })
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @Column({ name: 'file_name' })
  fileName: string;

  @Expose()
  @Column({ name: 'bucket_key' })
  bucketKey: string;

  @Expose()
  @Column({ name: 'bucket_name' })
  bucketName: string;

  @Expose()
  @Column({ name: 'mime_type', length: 50 })
  mimeType: string;

  @Expose()
  @Column({ name: 'checksum' })
  checksum: string;

  presignedUrl?: string;

  base64String?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ApplicantFile, (applicantFile) => applicantFile.drivingSchool)
  applicantFiles?: ApplicantFile[];

  @OneToMany(() => LicenseFile, (licenseFile) => licenseFile.license)
  licenseFiles?: LicenseFile[];
}
