import { ApiProperty } from '@nestjs/swagger';

export class LogoutErrorDto {
  @ApiProperty({ example: 500 })
  statusCode: number;

  @ApiProperty({ example: 'Logout failed' })
  message: string;

  @ApiProperty({ example: 'Internal Server Error' })
  error: string;
}
