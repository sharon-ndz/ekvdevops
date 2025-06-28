import QRCode from 'qrcode';
import * as fs from 'fs-extra';
import * as CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../entities/user.entity';
import { PaginationInterface } from '../interfaces/all.interface';

class HexCode {
  count: number;
  caps?: boolean;
  prefix?: string;
  suffix?: string;
}

export function createConsistentHash(key: string): string {
  return CryptoJS.MD5(key).toString(CryptoJS.enc.Hex);
}

export function maskNIN(nin: string): string {
  if (nin.length !== 11) {
    throw new Error('NIN must be 11 digits long');
  }
  const firstTwo = nin.slice(0, 2);
  const lastTwo = nin.slice(-2);
  const maskedPart = '*'.repeat(7);
  return `${firstTwo}${maskedPart}${lastTwo}`;
}

export function generateUniqueIntegers(count: number, min: number, max: number): string {
  if (count > max - min + 1) {
    throw new Error('Count exceeds the range of possible unique integers');
  }
  const uniqueNumbers: Set<number> = new Set();
  while (uniqueNumbers.size < count) {
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    uniqueNumbers.add(randomNumber);
  }
  return Array.from(uniqueNumbers).join('');
}

export function getFullName(user: User): string {
  return [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ');
}

export function slugify(text: string): string {
  const lowerCaseText = text.toLowerCase();
  const replacedSpaces = lowerCaseText.replace(/\s+/g, '_');
  return replacedSpaces.replace(/[^a-z0-9-]/g, '');
}

export function getStringInitials(identifier: string, length: number) {
  return identifier.slice(0, length);
}

export const getPagination = (
  count: number,
  page: number,
  offset: number,
  limit: number,
): PaginationInterface => {
  const pages: number = Math.ceil(count / limit);
  const end: number = Math.min(offset + limit, count);
  return {
    total: count,
    pages: pages,
    page: page < pages ? page : pages,
    start: count > 0 ? offset + 1 : 0,
    end: end,
    hasPages: page < pages || page > 1,
    hasNext: page < pages,
    hasPrevious: page > 1,
  };
};

export function hexCode(param: HexCode): string {
  const chars = 'acdefhiklmnoqrstuvwxyz0123456789'.split('');
  let result = '';
  for (let i = 0; i < param.count; i++) {
    const x = Math.floor(Math.random() * chars.length);
    result += chars[x];
  }

  result = (param.prefix ? param.prefix : '') + result + (param.prefix ? param.prefix : '');
  if (param.caps) {
    result = result.toUpperCase();
  }
  return result;
}

export function removeNullAndEmpty(obj: Record<string, any>): Record<string, any> {
  const newObj: Record<string, any> = {};
  for (const key in obj) {
    if (obj[key] !== null && obj[key] !== '') {
      newObj[key] = obj[key];
    }
  }
  return newObj;
}

export async function readJsonFile(filePath: string): Promise<any> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (err: any) {
    console.error(`Error reading JSON file: ${err.message}`);
    throw err;
  }
}

export async function writeJsonFile(filePath: string, data: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
      resolve(true);
    } catch (err: any) {
      console.error(`Error writing JSON file: ${err.message}`);
      reject(err);
    }
  });
}

export function removeMimeTypePrefix(base64String: string): string {
  // Define the regular expression pattern to match either "data:image/png;base64," or "data:image/jpeg;base64,"
  const regex = /^(data:image\/(?:png|jpeg);base64,)/;
  // Use RegExp.replace() to remove the matched prefix from the base64 string
  return base64String.replace(regex, '');
}

export async function genQRCode(QRCodeData: string) {
  const barcode = QRCode.toDataURL(QRCodeData, {
    color: {
      light: '#0000', // Transparent background
    },
  });
  return barcode.split(',')[1];
}

export function numberCode(count: number): string {
  const chars = '0123456789'.split('');
  let result = '';
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * chars.length);
    result += chars[x];
  }
  return result;
}

export function formatMoney(money: number, currency: string) {
  const formater = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  });
  return formater.format(money);
}

export function getDateTime(dateTime = false): string {
  function pad(s: number) {
    return s < 10 ? '0' + s : s;
  }
  const today = new Date();
  if (dateTime) {
    return (
      [pad(today.getFullYear()), pad(today.getMonth() + 1), today.getDate()].join('-') +
      ' ' +
      today.getHours() +
      ':' +
      today.getMinutes() +
      ':' +
      today.getSeconds()
    );
  }
  return pad(today.getHours()) + ':' + pad(today.getMinutes()) + ':' + pad(today.getSeconds());
}

export function getDateDiff(d1: Date, d2: Date): number {
  const t2 = d2.getTime();
  const t1 = d1.getTime();
  return (t2 - t1) / (24 * 3600 * 1000);
}

export function encode(data: any): string {
  return Buffer.from(data).toString('base64');
}

export function decode(base64String: string): string {
  return Buffer.from(base64String, 'base64').toString('ascii');
}

export function removeProperty(data: any, keys: Array<string>): any {
  const myObject = {};
  let index = 0;
  for (const obk in data) {
    if (!keys.includes(obk)) {
      myObject[obk] = data[obk];
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    index++;
  }
  return myObject;
}

export function convertDate(dateString: string) {
  const date = new Date(dateString);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

export function dateWord({ date = '', month = true, day = true, year = true }) {
  const dob = new Date(`${date}`);
  const dobArr = dob.toDateString().split(' ');
  let data = month ? dob.toLocaleString('default', { month: 'long' }) + ' ' : '';
  data += day ? dobArr[2] + ', ' : '';
  data += year ? dobArr[3] : '';
  return data;
}

export function hasValue(value: any) {
  return (
    value !== undefined &&
    value !== null &&
    value !== '' &&
    !(Array.isArray(value) && value.length === 0) &&
    !(typeof value === 'object' && Object.keys(value).length === 0)
  );
}

export function isNumber(value: any): boolean {
  return !isNaN(Number(value)); // Check if num is not NaN
}

export function containsKeywords(text: string, keywords: string[]): boolean {
  for (const keyword of keywords) {
    if (!text.toLowerCase().includes(keyword.toLowerCase())) {
      return false; // Text does not contain a keyword
    }
  }
  return true; // Text does not contain any keywords
}

export function getUUID(length?: number): string {
  return length ? uuidv4().substring(0, length) : uuidv4();
}
