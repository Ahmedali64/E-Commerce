import { ApiProperty } from '@nestjs/swagger';

export class LogoutSuccessDto {
  @ApiProperty({ example: 'Logged out successfully' })
  message: string;
}
