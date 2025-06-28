import {
  ActiveInactiveStatus,
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

export interface ProcessedImageUrls {
  originalUrl: string;
  largeUrl: string;
  smallUrl: string;
  originalS3Key: string;
  largeS3Key: string;
  smallS3Key: string;
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

export interface LgaDistribution {
  lgaId: number;
  count: number;
}

export interface StateAndEntityType {
  stateId: number;
  entityType: 'license' | 'permit';
}

export interface UserStatusDistribution {
  status: ActiveInactiveStatus;
  statusLabel: string; // 'Active' or 'Inactive'
  count: number;
}

export interface RevenueStats {
  totalAmount: number;
  percentageDifference: {
    percentage: number;
    status: string;
  };
}

export interface LicenseRevenueStats {
  allLicenses: RevenueStats;
  newLicenses: RevenueStats;
  renewalLicenses: RevenueStats;
  replacementLicenses: RevenueStats;
}

export interface MonthlyRevenueRaw {
  month: number; // e.g., 1 for January, 2 for February
  totalRevenue: string; // Comes as string from SUM, needs parseFloat
}

export interface MonthlyChartDataPoint {
  month: string; // e.g., "Jan", "Feb"
  revenue: number;
}

export interface ServiceTypeDistributionPoint {
  label: string;
  percentage: number;
}

export interface LgaRevenueRaw {
  lgaId: number;
  totalRevenue: string; // Comes as string from SUM, needs parseFloat
}

export interface LgaRevenuePoint {
  lgaId: number;
  lgaName?: string;
  totalRevenue: number;
}

export interface GrowthStats {
  total: number;
  percentageDifference: number;
  growthType: 'positive' | 'negative' | 'neutral';
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

export interface SourceDistribution {
  source: string;
  count: number;
}

export interface AgeGroupDistribution {
  ageGroup: string;
  count: number;
}

export interface RequestTypeDistribution {
  requestType: string;
  count: number;
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

export interface LicenseImageTemplate {
  stateName: string;
  header: string;
  document: string;
  lgaAbbreviation: string;
  imageTemplate: string;
  passportPhoto: string;
  passportPhoto2: string;
  sideSignatory: string;
  bottomSignature: string;
  sideSignature: string;
  topSignatory: string;
  topSignature: string;
  stateLogo: string;
  frscLogo: string;
  dlLabel: string;
  dlValue: string;
  class: string;
  dobLabel: string;
  dobValue: string;
  expLabel: string;
  expValue: string;
  issueLabel: string;
  issueValue: string;
  sexLabel: string;
  sexValue: string;
  heightLabel: string;
  heightValue: string;
  weightLabel: string;
  weightValue: string;
  firstName: string;
  LastName: string;
  address: string;
  location: string;
  state: string;
  eyeLabel: string;
  eyeValue: string;
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
