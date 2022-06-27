/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';

export const protobufPackage = 'ibanking.users';

export interface FindByIdRequest {
  id: string;
}

export interface FindByUsernameRequest {
  username: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export const IBANKING_USERS_PACKAGE_NAME = 'ibanking.users';

export interface UsersServiceClient {
  findById(request: FindByIdRequest): Observable<User>;

  findByUsername(request: FindByUsernameRequest): Observable<User>;

  create(request: CreateUserRequest): Observable<User>;
}

export interface UsersServiceController {
  findById(request: FindByIdRequest): Promise<User> | Observable<User> | User;

  findByUsername(
    request: FindByUsernameRequest,
  ): Promise<User> | Observable<User> | User;

  create(request: CreateUserRequest): Promise<User> | Observable<User> | User;
}

export function UsersServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ['findById', 'findByUsername', 'create'];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method,
      );
      GrpcMethod('UsersService', method)(
        constructor.prototype[method],
        method,
        descriptor,
      );
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method,
      );
      GrpcStreamMethod('UsersService', method)(
        constructor.prototype[method],
        method,
        descriptor,
      );
    }
  };
}

export const USERS_SERVICE_NAME = 'UsersService';
