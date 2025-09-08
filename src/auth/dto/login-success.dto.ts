import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class LoginSuccessDto {
  @ApiProperty({ example: 'Logged in successfully' })
  message: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ example: 'randomCsrfToken123' })
  csrfToken: string;
}
