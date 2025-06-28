import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    // Check if req.ips array exists and has at least one element (for proxy scenario)
    if (req.ips && req.ips.length > 0) {
      return req.ips[0];
    } else {
      // If req.ips is not available or empty, use req.ip directly (no proxy scenario)
      return req.ip;
    }
  }
}
