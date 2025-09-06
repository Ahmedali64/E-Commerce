import { Injectable, PipeTransform } from '@nestjs/common';

// Email Pipe - Simple, no 'any'
@Injectable()
export class EmailNormalizationPipe implements PipeTransform {
  transform(value: string | object) {
    if (typeof value === 'string' && this.isEmail(value)) {
      return value.toLowerCase().trim();
    }

    if (typeof value === 'object' && value && 'email' in value) {
      return {
        ...value,
        email: (value as { email: string }).email.toLowerCase().trim(),
      };
    }

    return value;
  }

  private isEmail(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }
}
