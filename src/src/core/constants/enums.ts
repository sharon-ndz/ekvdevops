export enum Mod {
  Neutral = 0,
  Pending = 1,
  Approved = 2,
  Queried = 3,
}

export enum EmailType {
  PAYMENT = 'payment',
  DEFAULT = 'default',
}

export enum Reference {
  Unused = 0,
  Used = 1,
}

export enum NotificationTypes {
  Email = 'email',
}

export enum Self {
  True = 1,
  False = 0,
}

export enum DeviceTypes {
  ANDROID = 'android',
  IOS = 'ios',
}

export enum DeviceStatus {
  APPROVED = 'approved',
  PENDING = 'pending',
  REJECTED = 'rejected',
  DEACTIVATED = 'deactivated',
}

export enum YesNo {
  YES = 'Yes',
  NO = 'No',
}

export enum EyeColor {
  Blue = 'BLUE',
  Black = 'BLACK',
  Green = 'GREEN',
  Brown = 'BROWN',
  Hazel = 'HAZEL',
  Gray = 'GRAY',
}

export enum Reg {
  Pending = 0,
  Approved = 1,
  Queried = 2,
  Initiated = 3,
  Revalidated = 4,
  Assigned = 5,
  InspectionQueried = 6,
}

export enum Print {
  pending = 0,
  complete = 1,
}

export enum ActiveInactiveStatus {
  Active = 1,
  Inactive = 0,
}

export enum Status {
  Active = 1,
  Inactive = 0,
  Probation = 2,
  Suspended = 3,
}

export enum DifficultyLevel {
  Easy = 1,
  Medium = 2,
  Hard = 3,
}

export enum QuestionCategory {
  DrivingSchoolTest = 1,
  FRSCTest = 2,
}
export enum Reference {
  Approved = 1,
  Rejected = 2,
}

export enum YesNo {
  Yes = 'yes',
  No = 'no',
}

export enum sStatus {
  Active = 'Active',
  Inactive = 'Inactive',
}

export enum Sources {
  PublicPortal = 'public_portal',
  AssistedMobile = 'assisted_mobile',
}

export enum ChangePasswordNextLogin {
  True = 1,
  False = 0,
}

export enum LicenseRequestType {
  New = 'new',
  Renewal = 'renewal',
  Replacement = 'replacement',
}

export enum PermitRequestType {
  New = 'new',
  Renewal = 'renewal',
}

export enum LicenseFilterRequestType {
  All = 'all',
  New = 'new',
  Renewal = 'renewal',
  Replacement = 'replacement',
}

export enum DocumentUploadTypes {
  FACE = 'face',
  MVAA_FACE = 'mvaaFace',
  SIGNATURE = 'signature',
  FINGER = 'finger',
  LICENSE = 'license',
  TEST_FILE = 'testFile',
  LOGO = 'logo',
  AVATAR = 'avatar',
  PHYSICAL_ASSESSMENT = 'physicalAssessment',
  HEALTH_DOCUMENT = 'healthDocument',
}

export enum EmailStatus {
  Pending = 'pending',
  Processing = 'processing',
  Completed = 'completed',
  Failed = 'failed',
}

export enum ReplacementReason {
  Damaged = 'damaged',
  Stolen = 'stolen',
  Lost = 'lost',
}

export enum LicenseStatus {
  Pending = 'pending',
  Processing = 'processing',
  Completed = 'completed',
  Expired = 'expired',
}

export enum ReportServiceTypeLabel {
  NewLicense = 'newLicense',
  RenewalLicense = 'renewalLicense',
  ReplacementLicense = 'replacementLicense',
  Permits = 'permits',
}

export enum PreRegistrationStatus {
  Pending = 0,
  Processing = 1,
  Completed = 2,
}

export enum BookingStatus {
  Pending = 0,
  Booked = 1,
}

export enum TestStatus {
  Scheduled = 'scheduled',
  ReScheduled = 'rescheduled',
  Failed = 'failed',
  Passed = 'passed',
  Missed = 'missed',
}

export enum PaymentStatus {
  Pending = 'pending',
  Completed = 'completed',
  Failed = 'failed',
  Canceled = 'canceled',
  Used = 'used',
}

export enum LicenseStatType {
  All = 'all',
  Renewal = 'renewal',
  Replacement = 'replacement',
}

export enum PermitClassType {
  LearnersPermit = 1,
  CoverNote = 2,
}

export enum StatusFilterType {
  All = 'all',
  Active = 'active',
  Inactive = 'inactive',
}

export enum AccountStatus {
  Approved = 'approved',
  Rejected = 'rejected',
  Pending = 'pending',
}

export enum InspectionStatus {
  Cleared = 'cleared',
  Queried = 'queried',
  Assigned = 'assigned',
  Approved = 'approved',
  Missed = 'missed',
  ReInspection = 're-inspection',
}

export enum CourseLevel {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Expert = 'expert',
}

export enum AccountType {
  Users = 'users',
  VerificationUsers = 'verification_users',
  DrivingSchools = 'driving_schools',
}

export enum ApprovalLevel {
  LevelOne = 1,
  LevelTwo = 2,
  LevelThree = 3,
  LevelFour = 4,
  LevelFive = 5,
}

export enum Currency {
  USD = 'USD',
  NGN = 'NGN',
}

export enum TransactionType {
  unit = 'unit',
  newLicense = 'new_license_payment',
  preRegistration = 'pre_registration_payment',
  licenseReplacement = 'license_replacement_payment',
  licenseRenewal = 'license_renewal_payment',
  drivingSchoolApplication = 'driving_school_application_payment',
  permitIssuance = 'permit_payment',
  biometricsPayment = 'biometrics_payment',
  cbtReschedulePayment = 'cbt_reschedule_payment',
  inspectionFee = 'inspection_payment',
  drivingSchoolCompletionPayment = 'driving_school_completion_payment',
  licenseRenewalMobile = 'license_renewal_payment_mobile',
}

export enum RegType {
  drivingSchool = 'driving_school',
  student = 'student',
  applicant = 'applicant',
}

export enum PaymentGateway {
  FCMB = 'fcmb',
  UNIFIED = 'unified_payment',
  PAYSTACK = 'paystack',
  ALATPAY = 'alatpay',
}

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum StatisticsFilter {
  DrivingSchools = 'Driving Schools',
  Students = 'Students',
  LASDRIOfficers = 'LASDRI Officers',
  Revenue = 'Revenue',
  Tests = 'Tests',
  Centers = 'Centers',
  DVISOfficers = 'DVI Officers',
}

export enum InpectionQuestionCategory {
  LicenseAndAccreditation = 'License And Accreditation',
  FacilitiesAndEquipment = 'Facilities And Equipment',
  VehicleAndDrivingRange = 'Vehicle And DrivingRange',
  LearningMaterials = 'Learning Materials',
}
