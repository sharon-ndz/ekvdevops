// roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export enum ApiPermission {
  // Verification
  canVerifyLicense = 'canVerifyLicense',

  // Creating records
  canCreateLicense = 'canCreateLicense',

  // Modifying records
  canModifyLicense = 'canModifyLicense',

  // Read records
  canReadLicense = 'canReadLicense',
}

export const API_PERMISSIONS_KEY = 'apiClientPermissions'; // Renamed to avoid conflict

export const ApiPermissions = (...permissions: ApiPermission[]) =>
  SetMetadata(API_PERMISSIONS_KEY, permissions);
