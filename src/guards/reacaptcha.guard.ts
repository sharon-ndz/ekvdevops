import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class RecaptchaGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { headers } = context.switchToHttp().getRequest();
    const recaptchaToken = headers['recaptcha-token'];
    if (!recaptchaToken) {
      throw new ForbiddenException('Recaptcha Token Missing');
    }
    const { data } = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?response=${recaptchaToken}&secret=${process.env.RACAPTCHA_SECRET_KEY}`,
    );
    if (!data.success) {
      throw new ForbiddenException('Recaptcha Validation Failed');
    }
    return true;
  }
}
