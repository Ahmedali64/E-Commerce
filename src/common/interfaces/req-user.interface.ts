import { UserResponseDto } from 'src/users/dto/user-response.dto';

export interface AuthenticatedRequest extends Request {
  user: UserResponseDto;
}
