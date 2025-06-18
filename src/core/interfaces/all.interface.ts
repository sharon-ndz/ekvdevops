import {
  LicenseFilterRequestType,
  LicenseStatus,
  PermitClassType,
  Reg,
  StatusFilterType,
} from '../constants/enums';

export interface LoggerInterface {
  requestMadeByName: string;
  requestMadeById: number;
  requestMadeByAccessLevel: string;
}

export interface RequestResultInterface {
  success: boolean;
  message: string;
}

export interface drivingTestAnswer {
  category: string;
  question: string;
  result: string;
}

export interface DataResultInterface<T = any> extends RequestResultInterface {
  data: T;
}

export interface PaginationInterface {
  total: number;
  pages: number;
  page: number;
  start: number;
  end: number;
  hasPages: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface OptionalInterface {
  stateId?: number;
  lgaId?: number;
  userId?: number;
  genderId?: number;
  id?: number;
  drivingSchoolId?: number;
  type?: StatusFilterType;
  requestType?: LicenseFilterRequestType;
  roleId?: number;
  status?: LicenseStatus;
  regStatus?: Reg;
  permitClassId?: PermitClassType;
}

export interface FileData {
  fileId: number;
  documentType: string;
}

export interface ListInterface extends OptionalInterface {
  search: string;
  resultPerPage: number;
  page: number;
}

export interface AuthUserInfo {
  id: number;
  drivingSchoolId: number;
  email: string;
  string: string;
  roleId: number;
  stateId: number;
  lgaId: number;
  permissions: string[];
}

export interface Attachment {
  filename: string;
  content?: Buffer;
  path?: string;
  encoding?: string;
  contentType?: string;
}

export interface FileFieldsInterface {
  id: number;
  fileName: string;
  bucketKey: string;
  presignedUrl?: string;
  base64String?: string;
}
