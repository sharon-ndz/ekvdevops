import { SetMetadata } from '@nestjs/common';

export enum Role {
  FRSC = 1,
  Admin = 2,
  SchoolAdmin = 3,
  MVAA = 4,
  DVIS = 5,
  LASDRI = 6,
  MVAA_ADMIN = 7,
  DVIS_ADMIN = 8,
  LASDRI_ADMIN = 9,
}

export const RoleName = (roleId: number) => {
  switch (Number(roleId)) {
    case 1:
      return 'FRSC';
    case 2:
      return 'Admin';
    case 3:
      return 'School Administrator';
    case 4:
      return 'Motor Vehicle Administration Agency';
    case 5:
      return 'State Vehicle Inspection Service';
    case 6:
      return "State Driver's Institute";
    case 7:
      return 'MVAA Administrator';
    case 8:
      return 'DVIS Administrator';
    case 9:
      return 'LASDRI Administrator';
    default:
      return 'unknown';
  }
};

export enum Permission {
  // New Licence Module
  canSeeNewLicense = 'canSeeNewLicense',
  canListNewLicense = 'canListNewLicense',
  canViewNewLicense = 'canViewNewLicense',
  canRegisterNewLicense = 'canRegisterNewLicense',
  canModifyNewLicense = 'canModifyNewLicense',
  canQueryNewLicense = 'canQueryNewLicense',
  canApproveNewLicense = 'canApproveNewLicense',

  // Renewal License Module
  canSeeLicenseRenewal = 'canSeeLicenseRenewal',
  canListLicenseRenewal = 'canListLicenseRenewal',
  canViewLicenseRenewal = 'canViewLicenseRenewal',
  canModifyLicenseRenewal = 'canModifyLicenseRenewal',
  canQueryLicenseRenewal = 'canQueryLicenseRenewal',
  canApproveLicenseRenewal = 'canApproveLicenseRenewal',

  // License ReIssuance Module
  canSeeLicenseReplacement = 'canSeeLicenseReplacement',
  canViewLicenseReplacement = 'canViewLicenseReplacement',
  canListLicenseReplacement = 'canListLicenseReplacement',
  canQueryLicenseReplacement = 'canQueryLicenseReplacement',
  canApproveLicenseReplacement = 'canApproveLicenseReplacement',

  // Modification Module
  canSeeModification = 'canSeeModification',
  canListModification = 'canListModification',
  canViewModification = 'canViewModification',
  canQueryModification = 'canQueryModification',
  canApproveModification = 'canApproveModification',

  // user management
  canSeeUser = 'canSeeUser',
  canManageUser = 'canManageUser',
  canManageSchoolAdmins = 'canManageSchoolAdmins',
  canManageFRSC = 'canManageFRSC',

  // Driving School management
  canSeeDrivingSchool = 'canSeeDrivingSchool',
  canListDrivingSchool = 'canListDrivingSchool',
  canViewDrivingSchool = 'canViewDrivingSchool',
  canResetDrivingSchoolPassword = 'canResetDrivingSchoolPassword',
  canApproveDrivingSchool = 'canApproveDrivingSchool',
  canRejectDrivingSchool = 'canRejectDrivingSchool',
  canDeactivateDrivingSchool = 'canDeactivateDrivingSchool',
  canActivateDrivingSchool = 'canActivateDrivingSchool',

  // Verification Report
  canSeeVerification = 'canSeeVerification',

  // Transaction Report
  canSeeTransactionReport = 'canSeeTransactionReport',
  canListTransactionReport = 'canListTransactionReport',
  canViewTransactionReport = 'canViewTransactionReport',
  canViewTransactionReportCards = 'canViewTransactionReportCards',
  canRefundTransaction = 'canRefundTransaction',

  // Approval TIU
  canSeeLicenseApproval = 'canSeeLicenseApproval',
  canSeeLicenseModificationApproval = 'canSeeLicenseModificationApproval',

  //Notifications
  canSeeLicenseNotification = 'canSeeLicenseNotification',
  canListLicenseNotification = 'canListLicenseNotification',
  canViewLicenseNotification = 'canViewLicenseNotification',

  // New permissions to identify user type
  isFRSC = 'isFRSC',
  isSchoolAdmin = 'isSchoolAdmin',
  isAdmin = 'isAdmin',
}

export const _KEY = 'permissions';
export const Permissions = (...permissions: Permission[]) => SetMetadata(_KEY, permissions);
