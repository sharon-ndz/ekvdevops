import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { File } from './file.entity';
import { BaseEntity } from './base.entity';
import { DocumentUploadTypes } from '../core/constants/enums';
import { DrivingSchool } from './driving-school.entity';
import { FileFieldsInterface } from '../core/interfaces/all.interface';
import { DrivingSchoolApplication } from './driving-school-application.entity';

@Entity({ name: 'applicant_files' })
export class ApplicantFile extends BaseEntity {
  @Column({ name: 'document_type', type: 'varchar', length: 40, nullable: true })
  documentType?: DocumentUploadTypes;

  @Column({ name: 'finger_type', length: 90, nullable: true })
  fingerType: string;

  @ManyToOne(
    () => DrivingSchoolApplication,
    (drivingSchoolApplication) => drivingSchoolApplication.applicantFiles,
    {
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION',
    },
  )
  @JoinColumn([{ name: 'driving_school_application_id', referencedColumnName: 'id' }])
  drivingSchoolApplication: DrivingSchoolApplication;

  @ManyToOne(() => DrivingSchool, (drivingSchool) => drivingSchool.applicantFiles, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'driving_school_id', referencedColumnName: 'id' }])
  drivingSchool: DrivingSchool;

  @ManyToOne(() => File, (file) => file.applicantFiles, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'file_id', referencedColumnName: 'id' }])
  file: FileFieldsInterface;
}
