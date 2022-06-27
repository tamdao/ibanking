import { Inject, Injectable, OnModuleInit, UseGuards } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import {
  UsersServiceClient,
  USERS_SERVICE_NAME,
  IBANKING_USERS_PACKAGE_NAME,
  User,
} from 'src/grpc/users.interface';
import { CreateUserInput } from './dto/create-user.input';
import { ClientGrpc } from '@nestjs/microservices';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { CurrentUser } from 'src/auth/user.decorator';

@Resolver('User')
@Injectable()
export class UsersResolver implements OnModuleInit {
  private usersService: UsersServiceClient;

  constructor(
    @Inject(IBANKING_USERS_PACKAGE_NAME) private client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.usersService =
      this.client.getService<UsersServiceClient>(USERS_SERVICE_NAME);
  }

  @Mutation('createUser')
  async create(@Args('createUserInput') createUserInput: CreateUserInput) {
    const hashPassword = await bcrypt.hash(createUserInput.password, 10);
    return this.usersService.create({
      username: createUserInput.username,
      password: hashPassword,
    });
  }

  @Query('user')
  findOne(@Args('id') id: string) {
    return this.usersService.findById({ id });
  }

  @Query('me')
  @UseGuards(GqlAuthGuard)
  async getProfile(@CurrentUser() user: User): Promise<User> {
    return this.usersService.findById({ id: user.id }).toPromise();
  }
}
