import {
  BadRequestException,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientGrpc } from '@nestjs/microservices';
import * as bcrypt from 'bcryptjs';
import {
  IBANKING_USERS_PACKAGE_NAME,
  UsersServiceClient,
  USERS_SERVICE_NAME,
} from 'src/grpc/users.interface';

@Injectable()
export class AuthService implements OnModuleInit {
  private usersService: UsersServiceClient;
  constructor(
    @Inject(IBANKING_USERS_PACKAGE_NAME) private client: ClientGrpc,
    private jwtService: JwtService,
  ) {}
  onModuleInit() {
    this.usersService =
      this.client.getService<UsersServiceClient>(USERS_SERVICE_NAME);
  }

  async validateUser(username: string, pass: string): Promise<any> {
    try {
      const user = await this.usersService
        .findByUsername({ username })
        .toPromise();

      if (!user) {
        return null;
      }

      const isMatch = await bcrypt.compare(pass, user.password);
      if (!isMatch) {
        return null;
      }
      return user;
    } catch (error) {
      return null;
    }
  }

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    if (!user) {
      throw new BadRequestException(`Username or password are invalid`);
    }
    const payload = { uid: user.id };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
