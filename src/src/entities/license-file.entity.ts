import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { File } from './file.entity';
import { BaseEntity } from './base.entity';
import { PreRegistration } from './pre-registration.entity';
import { DocumentUploadTypes } from '../core/constants/enums';
import { License } from './license.entity';
import { FileFieldsInterface } from '../core/interfaces/all.interface';

@Entity({ name: 'license_files' })
export class LicenseFile extends BaseEntity {
  @Column({ name: 'document_type', type: 'varchar', length: 40, nullable: true })
  documentType?: DocumentUploadTypes;

  @Column({ name: 'finger_type', length: 90, nullable: true })
  fingerType?: string;

  @ManyToOne(() => PreRegistration, (preRegistration) => preRegistration.licenseFiles, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'pre_registration_id', referencedColumnName: 'id' })
  preRegistration: PreRegistration;

  @ManyToOne(() => License, (license) => license.licenseFiles, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'license_id', referencedColumnName: 'id' }])
  license: License;

  @ManyToOne(() => File, (file) => file.licenseFiles, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'file_id', referencedColumnName: 'id' }])
  file: FileFieldsInterface;
}
