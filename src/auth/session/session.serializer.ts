import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { User } from 'src/users/entities/users.entity';
import { UsersService } from 'src/users/users.service';
type SessionUser = {
  id: string;
  email: string;
};
@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  // Store user ID in session
  serializeUser(
    //This is the full user object that you got after login
    user: Omit<User, 'password'>,
    //This is what we will save in redis
    done: (err: Error | null, user: SessionUser) => void,
  ): void {
    done(null, { id: user.id, email: user.email });
  }

  // Retrieve user from session data
  async deserializeUser(
    //This is the payload from redis that we stored
    payload: SessionUser,
    // The payload part explanation
    //this is the full user object you want Passport to attach to req.user.
    //If user is not found, pass null.
    done: (err: Error | null, payload: Omit<User, 'password'> | null) => void,
  ): Promise<void> {
    try {
      const user = await this.usersService.findUserById(payload.id);
      done(null, user);
    } catch (err) {
      done(err as Error, null);
    }
  }
}
