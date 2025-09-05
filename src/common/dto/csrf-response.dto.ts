import { ApiProperty } from '@nestjs/swagger';

export class CsrfTokenDto {
  @ApiProperty({ example: 'randomCsrfToken123' })
  csrfToken: string;
}
