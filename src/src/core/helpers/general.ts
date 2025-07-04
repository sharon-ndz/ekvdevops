import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Student } from '../../entities/student.entity';
import { DrivingSchool } from '../../entities/driving-school.entity';
import { License } from '../../entities/license.entity';
import { Repository } from 'typeorm';
import { ApproveLicenseDto } from '../../api/license/license.dto';
import { Permit } from '../../entities/permit.entity';
import { NewPermitRequestDto } from '../../api/permit/permit.dto';
import { genders, lgas, licenseClasses, organizations, states } from '../constants/constants';
import { DrivingTestCenter } from '../../entities/driving-test-center.entity';
import { generateUniqueIntegers, getStringInitials, hexCode } from './functions.helpers';
import { Role } from '../../middlewares/roles';
import { LicenseImageTemplate, ProcessedImageUrls } from '../interfaces/all.interface';
import { formatDate } from 'date-fns';
import { abbreviate } from 'typeorm/util/StringUtils';
import { DocumentUploadTypes } from '../constants/enums';
import AttachmentUtils from './aws.s3';
import { AuthService } from '../../api/auth/auth.service';
import generate from '../templates/license.tpl';
import axios from 'axios';
import Jimp from 'jimp';
import * as process from 'node:process';

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

export function getCapitalizedFirstLetter(obj: { name: string }) {
  if (obj && obj.name && typeof obj.name === 'string' && obj.name.length > 0) {
    return obj.name.charAt(0).toUpperCase();
  }
  return '';
}

/**
 * Generate License Card
 * @param license
 * @param authService
 */
export const generateLicenseCard = async (license: License, authService: AuthService) => {
  let processedFacePaths: ProcessedImageUrls | null = null;
  try {
    const nin = license.preRegistration.student.application.nin;
    const applicationState = states.find((state) => state.id === license.preRegistration.cbtCenter.stateId);
    const applicationLga = lgas.find((lga) => lga.id === license.preRegistration.cbtCenter.lgaId);
    const state = states.find((state) => state.id === license.stateId);
    const lga = lgas.find((lga) => lga.id === license.lgaId);
    const licenseClass = licenseClasses.find((lClass) => lClass.id === license.licenseClassId);
    const gender = genders.find((gender) => gender.id === license.genderId);
    const dob = license.dateOfBirth.replace(/-/g, '/');
    const issueDate = formatDate(license.issuedAt, 'dd/MM/yyyy');
    const expiryDate = formatDate(license.expiryAt, 'dd/MM/yyyy');
    const lgaAbbreviation = abbreviate(applicationLga.name);
    const applicantFiles = license.preRegistration.student.application.applicantFiles;
    let faceCapture: string | null;
    // check through if there is face capture
    for (const applicantFile of applicantFiles) {
      if (applicantFile.documentType === DocumentUploadTypes.FACE) {
        if (applicantFile.file) {
          const awsS3bucket = new AttachmentUtils();
          faceCapture = await awsS3bucket.getFileContentBase64(applicantFile.file.bucketKey);
        }
      }
    }
    // If face capture is not set, use NIN facial capture
    if (!faceCapture) {
      const ninResp = await authService.verifyNIN(nin);
      if (ninResp.success && ninResp.data) {
        faceCapture = ninResp.data.photo;
      }
    }
    // Generate passport photograph variations with required sizes
    if (faceCapture) {
      try {
        processedFacePaths = await processAndResizeFaceCapture(faceCapture);
      } catch (error) {
        console.error('CRITICAL: Failed to process face capture image for ID card:', error);
        throw error;
      }
    } else {
      throw new Error('Face capture information is missing, cannot generate card image.');
    }

    const licenseImageData: LicenseImageTemplate = {
      stateName: `${applicationState.name} State`,
      document: 'Drivers License',
      lgaAbbreviation: `${lgaAbbreviation}`,
      header: "Driver's License",
      topSignatory: 'Governor: ',
      topSignature: path.join(__dirname, '..', '..', '..', 'public/image/top-signature.png'),
      sideSignatory: 'Commissioner: ',
      sideSignature: path.join(__dirname, '..', '..', '..', 'public/image/side-signature.png'),
      bottomSignature: path.join(__dirname, '..', '..', '..', 'public/image/bottom-signature.png'),
      imageTemplate: path.join(__dirname, '..', '..', '..', 'public/image/template.png'),
      // passportPhoto: path.join(__dirname, '..', '..', '..', 'public/image/passport-photo.png'),
      passportPhoto: processedFacePaths.largeUrl,
      // passportPhoto2: path.join(__dirname, '..', '..', '..', 'public/image/passport-photo.png'),
      passportPhoto2: processedFacePaths.smallUrl,
      stateLogo: path.join(__dirname, '..', '..', '..', 'public/image/logo.png'),
      frscLogo: path.join(__dirname, '..', '..', '..', 'public/image/dl-logo.png'),
      dlLabel: 'DL No: ',
      dlValue: license.licenseNo,
      class: `Class ${licenseClass.code}`,
      dobLabel: 'DOB: ',
      dobValue: `${dob}`,
      expLabel: 'EXP: ',
      expValue: `${expiryDate}`,
      issueLabel: 'ISS: ',
      issueValue: `${issueDate}`,
      sexLabel: 'SEX:',
      sexValue: getCapitalizedFirstLetter(gender),
      heightLabel: 'H: ',
      heightValue: `${license.height}`,
      weightLabel: 'WGT: ',
      weightValue: `${license.weight}kg`,
      firstName: `${license.firstName}`,
      LastName: `${license.lastName}`,
      address: `${license.address}`,
      eyeLabel: 'EYE: ',
      eyeValue: `${license.eyeColor}`,
      location: `${lga.name}`,
      state: `${state.name}`,
    };

    return await generate(licenseImageData);
  } catch (error) {
    console.error('Error during ID card generation process:', error);
    throw error;
  } finally {
    if (processedFacePaths) {
      console.log('Cleaning up temporary face capture files...');
      const keysToDelete = [
        processedFacePaths.originalS3Key,
        processedFacePaths.largeS3Key,
        processedFacePaths.smallS3Key,
      ];

      for (const s3Key of keysToDelete) {
        if (s3Key) {
          try {
            const awsS3bucketForCleanup = new AttachmentUtils();
            await awsS3bucketForCleanup.deleteFileFromS3(s3Key);
          } catch (deleteError) {
            console.error(
              `Non-critical: Error deleting S3 object ${s3Key} during cleanup:`,
              deleteError,
            );
          }
        }
      }
      console.log('S3 cleanup process completed.');
    }
  }
};

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
 * Fetches an image from a URL and returns it as a Buffer.
 * @param url The URL of the image.
 * @returns A Promise resolving to a Buffer.
 */
export async function fetchImageAsBuffer(url: string): Promise<Buffer> {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  } catch (error: any) {
    console.error(`Error fetching image from URL ${url}:`, error.message);
    throw new Error(`Failed to fetch image from URL: ${url}. Status: ${error.response?.status}`);
  }
}

/**
 * Processes a base64 encoded image, creates original, large, and small variations in PNG format,
 * uploads them to S3, and returns their pre-signed URLs.
 *
 * @param base64ImageInput The base64 encoded image string.
 * @param s3KeyPrefix An optional prefix for the S3 object keys (e.g., 'user_faces/processed/'). Defaults to 'processed_id_faces'.
 * @returns A Promise resolving to an object containing pre-signed URLs for the original, large, and small images.
 */
export async function processAndResizeFaceCapture(
  base64ImageInput: string,
  s3KeyPrefix: string = 'processed_id_faces',
): Promise<ProcessedImageUrls> {
  if (!base64ImageInput) {
    throw new Error('Base64 image input string is required.');
  }

  const attachmentUtils = new AttachmentUtils();

  // Clean and Prepare Base64 Data
  let cleanBase64Data = base64ImageInput;
  // Strip the data URI scheme prefix if it exists (e.g., "data:image/png;base64,iVBORw0KGgo...")
  if (base64ImageInput.startsWith('data:image')) {
    cleanBase64Data = base64ImageInput.substring(base64ImageInput.indexOf(',') + 1);
  }

  if (!cleanBase64Data) {
    throw new Error('Invalid or empty base64 data after stripping prefix.');
  }

  let imageBuffer: Buffer;
  try {
    imageBuffer = Buffer.from(cleanBase64Data, 'base64');
  } catch (bufferError: any) {
    console.error('Error converting base64 to buffer:', bufferError);
    throw new Error(`Invalid base64 string provided: ${bufferError.message}`);
  }

  if (!imageBuffer || imageBuffer.length === 0) {
    throw new Error('Failed to load image data into buffer. Buffer is empty.');
  }

  // Read Image with Jimp
  let image: Jimp;
  try {
    image = await Jimp.read(imageBuffer);
  } catch (jimpReadError: any) {
    console.error('Jimp failed to read image buffer:', jimpReadError);
    throw new Error(
      `Could not process image data with Jimp. Ensure it is a valid image format. Error: ${jimpReadError.message}`,
    );
  }

  // Generate Unique S3 Object Keys
  const uniqueId = uuidv4();
  const baseS3Key = s3KeyPrefix.endsWith('/') ? s3KeyPrefix : `${s3KeyPrefix}/`;

  const originalS3Key = `${baseS3Key}original_${uniqueId}.png`;
  const largeS3Key = `${baseS3Key}large_${uniqueId}.png`;
  const smallS3Key = `${baseS3Key}small_${uniqueId}.png`;

  const mimeType = Jimp.MIME_PNG;

  // Process and Upload Original Image
  let originalUrl: string;
  try {
    const originalImageBase64 = await image.getBase64Async(mimeType);
    // Remove the data URI prefix added by Jimp's getBase64Async
    const cleanOriginalBase64 = originalImageBase64.substring(originalImageBase64.indexOf(',') + 1);

    await attachmentUtils.uploadBase64FileToS3(cleanOriginalBase64, originalS3Key, mimeType);
    console.log(`Original image uploaded to S3 key: ${originalS3Key}`);
    originalUrl = await attachmentUtils.getPreSignedUrl(originalS3Key);
  } catch (error: any) {
    console.error(`Error processing or uploading original image to S3 (${originalS3Key}):`, error);
    throw new Error(`Failed to process or upload original image: ${error.message}`);
  }

  // Process and Upload "Large" Variation
  const largeWidth = 894;
  const largeHeight = 1178;
  let largeUrl: string;
  try {
    const largeImage = image.clone();
    const largeImageBase64 = await largeImage
      .contain(largeWidth, largeHeight, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE)
      .quality(90)
      .getBase64Async(mimeType);
    const cleanLargeBase64 = largeImageBase64.substring(largeImageBase64.indexOf(',') + 1);

    await attachmentUtils.uploadBase64FileToS3(cleanLargeBase64, largeS3Key, mimeType);
    console.log(
      `Large image variation (fit ${largeWidth}x${largeHeight}) uploaded to S3 key: ${largeS3Key}`,
    );
    largeUrl = await attachmentUtils.getPreSignedUrl(largeS3Key);
  } catch (error: any) {
    console.error(`Error processing or uploading large image to S3 (${largeS3Key}):`, error);
    throw new Error(`Failed to process or upload large image variation: ${error.message}`);
  }

  // Process and Upload "Small" Variation
  const smallWidth = 120;
  const smallHeight = 150;
  let smallUrl: string;
  try {
    const smallImage = image.clone();
    const smallImageBase64 = await smallImage
      .contain(smallWidth, smallHeight, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE)
      .quality(90)
      .getBase64Async(mimeType);
    const cleanSmallBase64 = smallImageBase64.substring(smallImageBase64.indexOf(',') + 1);

    await attachmentUtils.uploadBase64FileToS3(cleanSmallBase64, smallS3Key, mimeType);
    console.log(
      `Small image variation (fit ${smallWidth}x${smallHeight}) uploaded to S3 key: ${smallS3Key}`,
    );
    smallUrl = await attachmentUtils.getPreSignedUrl(smallS3Key);
  } catch (error: any) {
    console.error(`Error processing or uploading small image to S3 (${smallS3Key}):`, error);
    throw new Error(`Failed to process or upload small image variation: ${error.message}`);
  }

  return {
    originalUrl,
    largeUrl,
    smallUrl,
    originalS3Key,
    largeS3Key,
    smallS3Key,
  };
}

/**
 * Generate Unique License Number
 * @param drivingSchoolRepository
 */
export const generateDrivingSchoolId = async (
  drivingSchoolRepository?: Repository<DrivingSchool>,
) => {
  const identifier = hexCode({
    count: 8,
    caps: true,
    prefix: 'DR',
  });
  if (drivingSchoolRepository) {
    // ensure this number doesn't exist in DB
    const licenseCount = await drivingSchoolRepository.count({
      where: { identifier: identifier },
    });
    if (licenseCount > 0) {
      await generateDrivingSchoolId(drivingSchoolRepository);
    }
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

// Helper to get month name from month number (1-12)
export const getMonthName = (monthNumber: number): string => {
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return monthNames[monthNumber - 1] || '';
};

export const getMonthDateRange = (year: number, month: number) => {
  const startDate = new Date(year, month, 1);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(year, month + 1, 0);
  endDate.setHours(23, 59, 59, 999);
  return { startDate, endDate };
};

// Helper function to calculate percentage difference
export const calculatePercentageDifference = (current: number, previous: number) => {
  if (previous === 0) {
    return {
      percentage: current > 0 ? 100 : 0, // Or handle as infinite, or large number
      status: current > 0 ? 'positive' : 'neutral', // Or handle as 'positive' if current > 0
    };
  }
  const difference = ((current - previous) / previous) * 100;
  return {
    percentage: parseFloat(difference.toFixed(2)), // Round to 2 decimal places
    status: difference > 0 ? 'positive' : difference < 0 ? 'negative' : 'neutral',
  };
};

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

export function getOrganizationCodeByRole(roleId: number): string | null {
  switch (roleId) {
    case Role.MVAA_ADMIN:
      return 'MVAA';
    case Role.DVIS_ADMIN:
      return 'DVIS';
    case Role.LASDRI_ADMIN:
      return 'LASDRI';
    default:
      return null;
  }
}

export function getAllowedRoleIds(roleId: number): number[] | null {
  switch (roleId) {
    case Role.LASDRI_ADMIN:
      return [Role.LASDRI_ADMIN, Role.LASDRI];
    case Role.DVIS_ADMIN:
      return [Role.DVIS_ADMIN, Role.DVIS];
    case Role.MVAA_ADMIN:
      return [Role.MVAA_ADMIN, Role.MVAA];
    default:
      return null;
  }
}
