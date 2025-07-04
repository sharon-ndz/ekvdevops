import { ninConstant, ninVerifyConstant } from '../constants/constants';
import { NINResult } from './nin.dto';
import axios from 'axios';
import { BadRequestException } from '@nestjs/common';
import { MESSAGES } from '../constants/messages';

class Register {
  private authorization: string;

  public async getAuthorization() {
    try {
      const { data } = await axios.post(
        `${ninConstant.link}/auth`,
        {
          apiKey: ninConstant.apiKey,
          apiSecretKey: ninConstant.apiSecretKey,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      this.authorization = data.acces_token;
    } catch (error) {
      throw new Error(`Authentication error: ${error}`);
    }
  }

  async verifyNIN(nin: string): Promise<NINResult | null> {
    try {
      const { data } = await axios.get(`${ninVerifyConstant.link}/verifyNinBirthReg`, {
        auth: {
          username: ninVerifyConstant.authUser,
          password: ninVerifyConstant.authPass,
        },
        params: { nin },
      });

      const { nimc } = data;
      if (nimc?.status == 1) {
        return nimc;
      } else {
        console.log(data);
        throw new BadRequestException(nimc?.message || MESSAGES.ninVerificationFailed);
      }
    } catch (error: any) {
      console.log(error);
      throw new BadRequestException(error.message);
    }
  }

  async verifyTrackingId(trackingId: string): Promise<any> {
    try {
      const { data } = await axios.get(`${ninVerifyConstant.link}/verifyTrackingIdBirthReg`, {
        auth: {
          username: ninVerifyConstant.authUser,
          password: ninVerifyConstant.authPass,
        },
        params: { trackingId },
      });
      return data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

const ninHelper = new Register();
export default ninHelper;
