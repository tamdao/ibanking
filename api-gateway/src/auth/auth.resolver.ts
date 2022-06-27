import { Injectable } from '@nestjs/common';
import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { LoginInput } from './dto/login.input';
import { AuthService } from './auth.service';

@Resolver('Auth')
@Injectable()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation('login')
  login(@Args('loginInput') loginInput: LoginInput) {
    return this.authService.login(loginInput.username, loginInput.password);
  }
}
