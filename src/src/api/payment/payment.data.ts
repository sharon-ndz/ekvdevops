import { PaymentDetailsDto } from './payment.dto';
import { Currency } from '../../core/constants/enums';
import { hexCode } from '../../core/helpers/functions.helpers';
import { PaymentSetting } from '../../entities/payment-setting.entity';

export class PaymentData {
  public static readonly unitTopUpCharges = 0.015;
  public static readonly unitTopUpCharges32 = 0.032;
  public static readonly fixedChargeOnMinimum = 2000;
  public static readonly fixedCharge = 50;

  static formatFCMBResponse(queryString: string): any {
    function convertKeysToObject(obj: any) {
      const result = {};

      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          const keys = key.split('.');

          let current = result;
          for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            if (i === keys.length - 1) {
              current[k] = value;
            } else {
              current[k] = current[k] || {};
              current = current[k];
            }
          }
        }
      }

      return result;
    }

    const params = new URLSearchParams(queryString);
    const result = {};

    params.forEach((value, key) => {
      result[key] = value;
    });

    return convertKeysToObject(result);
  }

  static getDetails(setting: PaymentSetting): PaymentDetailsDto {
    const chargesData = this.addCharges(setting.currency, setting.amount);
    console.log(chargesData);
    return {
      reference:
        hexCode({
          count: 8,
          caps: true,
          prefix: setting.prefix,
        }) + new Date().getTime(),
      currency: setting.currency,
      amountToPay: chargesData.amount,
      charges:
        chargesData.fee + (setting.amount > this.fixedChargeOnMinimum ? this.fixedCharge : 0),
      amount: setting.amount,
    };
  }

  private static addCharges(currency: string, amount: number): { amount: number; fee: number } {
    amount = parseFloat(String(amount).replace(/,/g, ''));
    const _32: number = amount * this.unitTopUpCharges32;
    const _12: number = amount * this.unitTopUpCharges;
    switch (currency) {
      case Currency.USD:
        return { amount: Math.ceil(amount + _32), fee: _32 };
      case Currency.NGN:
        return { amount: Math.ceil(amount + _12), fee: _12 };
      default:
        return { amount, fee: 0 };
    }
  }
}
