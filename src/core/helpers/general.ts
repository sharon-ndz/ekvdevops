import { Student } from '../../entities/student.entity';
import { DrivingSchool } from '../../entities/driving-school.entity';
import { License } from '../../entities/license.entity';
import { Repository } from 'typeorm';
import { ApproveLicenseDto } from '../../api/license/license.dto';
import { Permit } from '../../entities/permit.entity';
import { NewPermitRequestDto } from '../../api/permit/permit.dto';
import { organizations, states } from '../constants/constants';
import { DrivingTestCenter } from '../../entities/driving-test-center.entity';
import { generateUniqueIntegers, getStringInitials, hexCode } from './functions.helpers';

function containsAsterisk(value: any) {
  if (typeof value === 'string') {
    return value.includes('*');
  }
  return false;
}

export function findOrganizationByCode(code: string) {
  return organizations.find((org) => org.code === code);
}

/**
 * Check if NIN data is valid
 * @param data
 */
export function isNINValid(data: any) {
  if (!data) {
    return false;
  }
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      if (typeof data[key] === 'object') {
        if (!isNINValid(data[key])) {
          return false;
        }
      } else {
        if (containsAsterisk(data[key])) {
          return false;
        }
      }
    }
  }
  return true;
}

export function isValidDate(dateString: string): boolean {
  const pattern = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[012])-(19|20)\d\d$/;
  return pattern.test(dateString);
}
/**
 * Check training completion by date
 * @param startDate
 * @param duration
 */
export function hasCompletedTraining(startDate: Date, duration: number): boolean {
  // Get today's date
  const today = new Date();
  // Add duration in months to start date
  const trainingCompletionDate = new Date(new Date(today).setMonth(today.getMonth() + duration));
  if (trainingCompletionDate < today) {
    return true;
  } else if (
    // If training completion date is today, return true
    trainingCompletionDate.getDate() === today.getDate() &&
    trainingCompletionDate.getMonth() === today.getMonth() &&
    trainingCompletionDate.getFullYear() === today.getFullYear()
  ) {
    return true;
  }
  // else return false
  return false;
}

/**
 * Compare dates
 * @param startDate
 * @param endDate
 */
export function hasExpired(startDate: Date, endDate: Date): boolean {
  const today = new Date();
  const end = new Date(endDate);
  return end < today;
}

/**
 * Validate OTP
 * @param issuedAt
 */
export function isOTPValid(issuedAt: Date): boolean {
  const otpValidityDuration = 5 * 60 * 1000; // 5 minutes
  const dbTimezoneOffset = issuedAt.getTimezoneOffset(); // Assuming you store the offset
  const adjustedClientTime = new Date(Date.now() + dbTimezoneOffset);
  return adjustedClientTime.getTime() - issuedAt.getTime() < otpValidityDuration;
}

/**
 * Get a field from array of objects by key and value
 * @param mapObjects
 * @param key
 * @param value
 * @param field
 */
export function getMapValue(mapObjects: any, key: any, value: any, field: any): any {
  if (typeof key === 'undefined') {
    return null;
  }
  const singleMap = mapObjects.find((m: any) => m[key] === value);
  if (!singleMap) {
    return null;
  }
  return singleMap[field];
}

/**
 * Get license approval data
 * @param data
 * @param licenseRepository
 */
export async function getLicenseApprovalData(
  data: ApproveLicenseDto,
  licenseRepository: Repository<License>,
) {
  // Get today's date
  const today = new Date();
  // Add license years to start date
  const expiryDate = new Date(
    new Date(today).setFullYear(
      today.getFullYear() + data.years,
      today.getMonth(),
      today.getDate(),
    ),
  );
  // Get license No
  const licenseNo = await generateLicenseNo(licenseRepository);

  return {
    issuedAt: today,
    expiryAt: expiryDate,
    licenseNo: licenseNo,
  };
}

/**
 * Get permit issuance data
 * @param data
 * @param permitRepository
 */
export async function getPermitIssuanceData(
  data: NewPermitRequestDto,
  permitRepository: Repository<Permit>,
) {
  // Get today's date
  const today = new Date();
  // Add license years to start date
  const expiryDate = new Date(
    new Date(today).setFullYear(
      today.getFullYear() + data.years,
      today.getMonth(),
      today.getDate(),
    ),
  );
  // Get permit No
  const permitNo = await generatePermitNo(permitRepository);

  return {
    issuedAt: today,
    expiryAt: expiryDate,
    permitNo: permitNo,
  };
}

/**
 * Generate Unique License Number
 * @param licenseRepository
 */
const generateLicenseNo = async (licenseRepository: Repository<License>) => {
  const idSet = generateUniqueIntegers(8, 0, 9);
  // ensure this number doesn't exist in DB
  const licenseCount = await licenseRepository.count({
    where: { licenseNo: idSet },
  });
  if (licenseCount > 0) {
    await generateLicenseNo(licenseRepository);
  }
  return idSet;
};

/**
 * Generate Unique License Number
 * @param drivingSchoolRepository
 */
export const generateDrivingSchoolId = async (
  drivingSchoolRepository: Repository<DrivingSchool>,
) => {
  const identifier = hexCode({
    count: 8,
    caps: true,
    prefix: 'DR',
  });
  // ensure this number doesn't exist in DB
  const licenseCount = await drivingSchoolRepository.count({
    where: { identifier: identifier },
  });
  if (licenseCount > 0) {
    await generateDrivingSchoolId(drivingSchoolRepository);
  }
  return identifier;
};

/**
 * Generate certificate number
 * @param student
 */
export function generateCertificateNo(student: Student): string {
  // format: school initials, state code, application last 5 unique number and student last 4 unique number
  // Get school initials (4)
  const schoolInitials = getStringInitials(student.drivingSchool.identifier, 4);
  // Get state code
  const state = states.find((s) => student.drivingSchool.stateId == s.id);
  // Get application number last 5
  const appNoSplit = student.application.applicationNo.split('/');
  const applicationNoLast5 = appNoSplit[appNoSplit.length - 1];
  // Get student number last 5
  const studentNoSplit = student.studentNo.split('-');
  const studentNoLast5 = studentNoSplit[studentNoSplit.length - 1];
  // Form new certificate number
  return `${schoolInitials}/${state.code}/${applicationNoLast5}/${studentNoLast5}`;
}

/**
 * Generate pre-registration application number
 * @param student
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function generatePreRegApplicationNo(student: Student): string {
  const today = new Date();
  // Get student number last 5
  // const studentNoSplit = student.studentNo.split('-');
  // const studentNoLast5 = studentNoSplit[studentNoSplit.length - 1];
  const studentNoLast5 = generateUniqueIntegers(6, 0, 9);
  // Form new certificate number
  return `DRLP/${today.getFullYear()}/${studentNoLast5}`;
}

/* Generate student number
 * @param drivingSchool
 */
export function generateStudentNo(drivingSchool: DrivingSchool): string {
  // Generate unique 5 digits
  const idSet = generateUniqueIntegers(6, 0, 9);
  // Formulate application number
  return `${drivingSchool.identifier}-${idSet}`;
}

/* Generate driving test center identifier
 * @param name
 */
export const generateDrivingCenterNo = async (
  name: string,
  drivingTestCenterRepository: Repository<DrivingTestCenter>,
) => {
  // Get center name initials
  const initials = getStringInitials(name, 2);
  // Generate unique 9 digits
  const idSet = generateUniqueIntegers(9, 0, 9);
  // Identifier
  const code = `${initials}${idSet}`;
  // ensure this number doesn't exist in DB
  const count = await drivingTestCenterRepository.count({
    where: { identifier: code },
  });
  if (count > 0) {
    await generateDrivingCenterNo(name, drivingTestCenterRepository);
  }
  return code;
};

/**
 * Generate driving school application No
 * @param drivingSchool
 */
export function generateDrivingSchoolApplicationNo(drivingSchool: DrivingSchool): string {
  // Get school initials (4)
  const schoolInitials = getStringInitials(drivingSchool.identifier, 4);
  // Get current year e.g 2024
  const currentYear = new Date().getFullYear();
  // Generate unique 5 digits
  const idSet = generateUniqueIntegers(6, 0, 9);
  // Formulate application number
  return `${schoolInitials}/${currentYear}/${idSet}`;
}

/**
 * Generate Unique Permit Number
 * @param permitRepository
 */
export const generatePermitNo = async (permitRepository: Repository<Permit>) => {
  const initials = 'PM';
  // Generate unique digits
  const idSet = generateUniqueIntegers(13, 0, 20);
  const permitNo = `${initials}${idSet}`;
  // ensure this number doesn't exist in DB
  const permitCount = await permitRepository.count({
    where: { permitNo: permitNo },
  });
  if (permitCount > 0) {
    await generatePermitNo(permitRepository);
  }
  return permitNo;
};
