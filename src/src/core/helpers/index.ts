
import { Paystack } from './paystack.helper';
import { SMSHelper } from './sms.helper';
import { MailHelper } from './mail.helper';

const paystack = new Paystack();
const sms = new SMSHelper();
const mailer = new MailHelper();

export { paystack, sms, mailer };

export function addPaging(
    pageSize: number,
    pageNumber: number
): { take: number; skip: number } | null {
    return {
        take: pageSize,
        skip: pageSize * (pageNumber - 1),
    };
}

export function calculateChange(current: number, previous: number) {
    if (previous === 0 && current === 0) {
        return { value: 0, direction: 'up', formatted: '0%' };
    }

    if (previous === 0 && current > 0) {
        return { value: 100, direction: 'up', formatted: '↑ 100%' };
    }

    const rawChange = ((current - previous) / previous) * 100;
    const value = Math.abs(Number(rawChange.toFixed(1)));
    const direction = rawChange >= 0 ? 'up' : 'down';
    const arrow = direction === 'up' ? '↑' : '↓';

    return {
        value,
        direction,
        formatted: `${arrow} ${value}%`,
    };
}
