import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class TrimStringPipe implements PipeTransform {
  transform(value: string | object) {
    if (typeof value === 'string') {
      return value.trim();
    }

    if (typeof value === 'object') {
      return this.trimObjectStrings(value);
    }

    return value;
  }

  private trimObjectStrings(obj: object): object {
    const trimmed = {};
    for (const key in obj) {
      const val = (obj as Record<string, unknown>)[key];
      if (typeof val === 'string') {
        (trimmed as Record<string, unknown>)[key] = val.trim();
      } else if (typeof val === 'object' && val !== null) {
        (trimmed as Record<string, unknown>)[key] = this.trimObjectStrings(val);
      } else {
        (trimmed as Record<string, unknown>)[key] = val;
      }
    }
    return trimmed;
  }
}
