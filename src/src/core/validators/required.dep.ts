import {
  ValidateIf,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { Reg } from '../constants/enums';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const RequiredIf = (property: string, dto: any) =>
  ValidateIf((dto) => typeof dto[property] !== 'undefined');

export const RequiredIfValueIs = (property: string, value: any, dto: any) =>
  RequiredIfValueInArray(property, [value], dto);

export const RequiredIfValueInArray = (
  property: string,
  values: any[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dto: any,
) => ValidateIf((dto) => typeof dto[property] !== 'undefined' && values.includes(dto[property]));

export const RequiredIfValueIsNot = (property: string, value: any, dto: any) =>
  RequiredIfValueIsNotInArray(property, [value], dto);

export const RequiredIfValueIsNotInArray = (
  property: string,
  values: any[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dto: any,
) => ValidateIf((dto) => typeof dto[property] !== 'undefined' && !values.includes(dto[property]));

export const RequiredIfDaysBetween = (
  property: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  value: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dtoClass: any,
) =>
  ValidateIf((object, value) => {
    if (typeof object[property] !== 'undefined') {
      let date = object[property];
      if (date instanceof Date) {
        date = object[property].toISOString(); // Convert the Date object to a string
      }

      const providedDate = new Date(date);
      const currentDate = new Date();
      const daysAgo = new Date(currentDate.getTime() - value * 24 * 60 * 60 * 1000);

      return providedDate >= daysAgo && providedDate <= currentDate;
    }
    return true;
  });

@ValidatorConstraint({ name: 'yearMonthFormat', async: false })
export class YearMonthFormatConstraint implements ValidatorConstraintInterface {
  validate(value: string) {
    // Regex pattern for year-month format (e.g. 2023-05-23)
    const pattern = /^\d{4}-\d{2}-\d{2}$/;
    return pattern.test(value);
  }
}

@ValidatorConstraint({ name: 'isTime', async: false })
export class IsTimeConstraint implements ValidatorConstraintInterface {
  validate(value: string) {
    // Implement your time validation logic here
    // For example, check if the string matches a valid time format (e.g., HH:mm, HH:mm:ss)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    return timeRegex.test(value);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} is not a valid time.`;
  }
}

@ValidatorConstraint({ name: 'isNGPhoneNumber', async: false })
export class IsNGPhoneNumberConstraints implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(value: any, args: ValidationArguments) {
    const phoneNumberRegex = /^(070|080|081|090|091)\d{8}$/;
    return phoneNumberRegex.test(value);
  }
  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a valid Nigerian phone number.`;
  }
}

@ValidatorConstraint({ name: 'isValidDateFormat', async: false })
export class IsValidDateFormatConstraint implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(value: any, args: ValidationArguments) {
    if (typeof value !== 'string') {
      return false;
    }

    const pattern = /^(\d{2})-(\d{2})-(\d{4})$/;
    const match = value.match(pattern);

    if (!match) {
      return false;
    }

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const year = parseInt(match[3], 10);

    const date = new Date(year, month, day);

    return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a valid date in the format dd-mm-yyyy`;
  }
}

export function IsValidDateFormat(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidDateFormatConstraint,
    });
  };
}

export function IsNGPhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNGPhoneNumberConstraints,
    });
  };
}


export function IsTime(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsTimeConstraint,
    });
  };
}

export function IsYearMonthFormat(validationOptions?: ValidationOptions) {
  return function (propertyObject: any, propertyName: string) {
    registerDecorator({
      name: 'isYearMonthFormat',
      target: propertyObject.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: YearMonthFormatConstraint,
    });
  };
}

export function IsInReg(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isInReg',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        validate(value: any, args: ValidationArguments) {
          const allowedValues = Object.values(Reg).filter((v) => typeof v === 'number'); // Get the numeric values
          return allowedValues.includes(Number(value)) || Object.keys(Reg).includes(value); //includes number or string key
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        defaultMessage(args: ValidationArguments) {
          return `status must be one of the following values: ${Object.keys(Reg).join(', ')}`;
        },
      },
    });
  };
}
