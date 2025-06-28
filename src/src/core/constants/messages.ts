export const MESSAGES = {
  rateLimitExceeded: 'Rate limit exceeded',
  recordInUse: (record: any) => `${record} already used`,
  recordCountDelete: (count: number, max: number) => `${count} of ${max} record(s) delete`,
  recordExists: `Record already exist`,
  errorOccurred: `Error occurred please try again`,
  recordAdded: 'Record added successfully',
  schoolApplicationSubmitted: 'School Application Submitted Successfully',
  drivingSchoolCertificate: 'Congratulations! You Just Passed Your Driving School Lessons',
  cbtTestResult: 'Your CBT Test Result',
  drivingTestResult: 'Your Driving Test Result',
  recordUpdated: 'Record updated successfully',
  recordFound: 'Record found successfully',
  recordNotFound: 'Record not found',
  invalidNin: 'Nin could not be verified.',
  ninNameMismatch: 'Name mismatch with NIN',
  pendingApproval: 'Modification pending approval',
  updateSuccessful: 'Record updated successfully',
  unlinkedSuccessful: 'Device unlinked successfully',
  imageNotFound: 'image not found',
  docTitle: "The Integrated Driver's License Management System (IDLMS) API",
  docDescription:
    "The Integrated Driver's License Management System (IDLMS) is a comprehensive digital platform designed to streamline vehicle registration, driver licensing, and related services in Lagos State",
  printSuccessful: 'Record print successfully',
  printFailed: 'Record print failed',
  approvedSuccessful: 'Record approved successfully',
  rejectSuccessful: 'Record rejected successfully',
  approvedFailed: 'Approval failed',
  logout: 'Logged out successfully',
  passwordStrengthFailed:
    'Password At least one uppercase letter, At least one lowercase letter, At least one digit (number), At least one special character, At least 8 characters in total.',
  oldNewPasswordMatch: 'New password cannot be the same as old password',
  passwordMismatch: 'Password and confirm password does not match.',
  welcome: 'Welcome',
  otpSent: 'OTP sent successfully',
  otpValid: 'Otp valid',
  accountCreatedSubject: 'Account created successfully',
  preRegistrationEmailSubject: 'Your PreRegistration Application Number',
  otpEmailSubject: 'Your OTP Validation Code',
  ninVerificationFailed: 'NIN Verification Failed',
  newApplicationAssigned: 'New Application Assigned',
  applicationApproved: 'Application Approved',
  licenseApproved: 'License Approved',
  lasdriOfficerAssigned: 'LASDRI Officer Assigned',
  applicationPaymentConfirmed: 'Application Payment Confirmed',
  applicationQueried: 'Application Queried',
  inspectionRequested: 'Inspection requested successfully',
  inspectionQueried: 'Inspection Queried',
  inspectionApproved: 'Inspection Approved',
  questionsUploaded: 'Question uploaded',
  invalidValue: (token: string) => `Invalid ${token}`,
  drivingSchoolCertificateBody: (name: string, applicationNo: string, certNo: string) =>
    `<p>Dear ${name},</p>
    <p>Congratulations! You have just passed your driving school lessons.</p> 
     <p>Application ID: <strong>${applicationNo}</strong></p>
     <p>Certificate Number: <strong>${certNo}</strong></p>
     <p>Kindly approach the school for your official certificate hardcopy. For the interim you can use your ceritifcate number for license applications.</p>
    <p>Thank you for choosing our service.</p>
    <p>Best regards,<br> `,
  cbtTestResultBody: (name: string, applicationNo: string, status: string, score: any) =>
    `<p>Dear ${name},</p>
    <p>We have recieved your CBT test submission. Below is details;</p> 
     <p>Application ID: <strong>${applicationNo}</strong></p>
     <p>Score (%): <strong>${score}</strong></p>
     <p>Status: <strong>${status.toUpperCase()}</strong></p>
    <p>Thank you for choosing our service.</p>
    <p>Best regards,<br> `,
  drivingTestResultBody: (name: string, applicationNo: string, status: string, score: any) =>
    `<p>Dear ${name},</p>
    <p>We have recieved your driving test submission. Below is details;</p> 
     <p>Application ID: <strong>${applicationNo}</strong></p>
     <p>Score: <strong>${score}</strong></p>
     <p>Status: <strong>${status.toUpperCase()}</strong></p>
    <p>Thank you for choosing our service.</p>
    <p>Best regards,<br> `,
  otpEmailBody: (otpCode: string) =>
    `<p>Dear User,</p>
    <p>You have requested to validate your email address for our service. Please use the following OTP (One-Time Password) code to complete the validation process:</p>
    <p><strong>OTP Code:</strong> ${otpCode}</p>
    <p>Please note that this OTP code is valid for a single use only and will expire after a short period of time. If you did not initiate this request, please disregard this email.</p>
    <p>Thank you for choosing our service.</p>
    <p>Best regards,<br>`,
  userAccountCreated: (password: string, email: string) =>
    `<p>An account has been created for you by the administrator of the system.</p> 
    <p>Use the following details for your user access:  <br/> Email: <b>${email}</b><br/>Password: <b>${password}</b></p>
    <p>Best regards,<br> `,
  drivingSchoolApplicationCreated: (name: string, email: string, password: string) =>
    `<p>Dear ${name},</p>
    <p>Your driving school application has been received successfully. You will be notified once approved.</p> 
    <p>Use the following details for your user access to driving school portal:  <br/> Email: <b>${email}</b><br/>Password: <b>${password}</b></p>
    <p>Best regards,<br> `,
  drivingSchoolApplicantEmail: (name: string, applicationNo: string) =>
    `<p>Dear ${name},</p>
    <p>Your driving school application has been received successfully. You will be notified once acknowledged.</p> 
     <p>Application ID: <strong>${applicationNo}</strong></p>
    <p>Please keep it safe as you may need it to continue your CBT tests and license application later.</p>
    <p>Thank you for choosing our service.</p>
    <p>Best regards,<br> `,
  preRegistrationEmailBody: (applicationNo: string, name: string) =>
    `<p>Dear ${name},</p>
    <p>You have been pre-registered for your driver's license. Below is your Application Number:</p>
    <p><strong>${applicationNo}</strong></p>
    <p>Please keep it safe as you may need it to continue your registration and issuance.</p>
    <p>Thank you for choosing our service.</p>
    <p>Best regards,<br>`,
  licenseEmailBody: (applicationNo: string, licenseNo: string, name: string) =>
    `<p>Dear ${name},</p>
    <p>Congratulations! Your driver's license has been approved. Below is your license details:</p>
    <p>Application No<strong>${applicationNo}</strong></p>
    <p>License No<strong>${licenseNo}</strong></p>
    <p>You may proceed for license collection if you haven't collected the hard copy already.</p>
    <p>Thank you for choosing our service.</p>
    <p>Best regards,<br>`,
  mailDisclaimer: `<p>This is a confidential email and may also be privileged. If you are not the intended recipient, please inform us immediately.</p>`,
  newApplicationAssignedEmailBody: (name: string, identifier: string) =>
    `<p>Dear ${name},</p>
    <p>You have been assigned to review the application for driving school with identifier number: <strong>${identifier}</strong>.</p>`,
  applicationApprovedEmailBody: () =>
    `<p>Congratulations</p>
    <p>You have been assigned a LASDRI officer for the inspection.</p>`,
  applicationPaymentConfirmedEmailBody: (
    schoolName: string,
    schoolEmail: string,
    schoolPhone: string,
  ) =>
    `<p>Dear User,</p>
  <p>We are pleased to inform you that the payment for your application has been successfully confirmed.</p>
  <p>Driving School Details:</p>
  <ul>
    <li><strong>Name:</strong> ${schoolName}</li>
    <li><strong>Email:</strong> ${schoolEmail}</li>
    <li><strong>Phone:</strong> ${schoolPhone}</li>
  </ul>
  <p>Your application is awaiting admin review.</p>`,
  applicationQueriedEmailBody: (reason: string) =>
    `<p>Dear User,</p>
    <p>Your application has been queried by the admin for the following reason:</p>
    <p><strong>${reason}</strong></p>`,
  inspectionQueriedEmailBody: (reason: string[]) =>
    `<p>Dear User,</p>
    <p>Your inspection has been queried for the following reasons:</p>
    <ul>
      ${reason.map((r) => `<li>${r}</li>`).join('')}
    </ul>`,
  inspectionApprovedEmailBody: () =>
    `<p>Dear User,</p>
    <p>Congratulations, your inspection has been approved.</p>`,
};
