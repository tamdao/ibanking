import { Controller, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { User as UserEntity } from './entities/user.entity';
import {
  CreateUserRequest,
  FindByIdRequest,
  FindByUsernameRequest,
  User,
  UsersServiceController,
  UsersServiceControllerMethods,
} from './users.interface';

@Controller('users')
@UsersServiceControllerMethods()
export class UsersController implements UsersServiceController {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async findByUsername(request: FindByUsernameRequest): Promise<User> {
    const userRecord = await this.usersRepository.findOneBy({
      username: request.username,
    });

    if (!userRecord) {
      throw new NotFoundException();
    }

    return {
      id: userRecord.id,
      username: userRecord.username,
      password: userRecord.password,
      createdAt: userRecord.createdAt.toISOString(),
      updatedAt: userRecord.createdAt.toISOString(),
    };
  }

  async findById(request: FindByIdRequest): Promise<User> {
    const userRecord = await this.usersRepository.findOneBy({
      id: request.id,
    });

    if (!userRecord) {
      throw new NotFoundException();
    }

    return {
      id: userRecord.id,
      username: userRecord.username,
      password: userRecord.password,
      createdAt: userRecord.createdAt.toISOString(),
      updatedAt: userRecord.createdAt.toISOString(),
    };
  }
  async create(request: CreateUserRequest): Promise<User> {
    const user = this.usersRepository.create({
      username: request.username,
      password: request.password,
    });

    const userRecord = await this.usersRepository.save(user);

    return {
      id: userRecord.id,
      username: userRecord.username,
      password: userRecord.password,
      createdAt: userRecord.createdAt.toISOString(),
      updatedAt: userRecord.createdAt.toISOString(),
    };
  }
}
