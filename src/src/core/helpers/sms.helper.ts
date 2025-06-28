import { InternalServerErrorException, Logger } from '@nestjs/common';
import axios from 'axios';
import { smsConfig } from '../constants/constants';

export class SMSHelper {
  private readonly logger = new Logger(SMSHelper.name);

  private phone: string;
  private message: string;
  private smsKeys = {
    '1000': 'All Messages sent successfully',
    '1001': 'Not All Messages were sent successfully due to insufficient balance',
    '1002': 'Missing API Parameters',
    '1003': 'Insufficient balance',
    '1004': 'Mismatched API key',
    '1005': 'Invalid Phone Number',
    '1006':
      'invalid Sender ID. Sender ID must not be more than 11 Characters. Characters include white space.',
    '1007': 'Message scheduled for later delivery',
    '1008': 'Empty Message',
    '1009': 'SMS sending failed',
    '1010': 'No messages has been sent on the specified dates using the specified api key',
  };

  context(): SMSHelper {
    return this;
  }

  setPhone(phone: string): SMSHelper {
    this.phone = phone;
    return this;
  }

  setMessage(message: string): SMSHelper {
    this.message = message;
    return this;
  }

  async send(): Promise<{ success: boolean; message: string }> {
    if (this.phone == null) {
      throw new InternalServerErrorException('Phone must not be null');
    }
    if (this.message == null) {
      throw new InternalServerErrorException('message must not be null');
    }

    const context = this.context();
    return new Promise(async (resolve, reject) => {
      await axios
        .post(smsConfig.host, {
          privatekey: smsConfig.privateKey,
          publickey: smsConfig.publicKey,
          sender: smsConfig.sender,
          numbers: this.phone,
          message: this.message,
        })
        .then(function (res) {
          const response = res.data;
          const result: { success: boolean; message: string } = {
            success: false,
            message: context.smsKeys[response.status],
          };
          if (response.status == '1000' || response.status == '1007') {
            result.success = true;
          }
          resolve(result);
        })
        .catch(function (error) {
          context.logger.log(error);
          reject(error);
        });
    });
  }
}
