/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';

export const protobufPackage = 'ibanking.savings';

export interface FindByIdRequest {
  id: string;
}

export interface FindByUserIdRequest {
  searchOptions: SearchOptions | undefined;
  pageOptions: PageOptions | undefined;
}

export interface FindByUserIdResponse {
  accounts: Account[];
  totalResult: number;
}

export interface CreateRequest {
  userId: string;
}

export interface DepositRequest {
  id: string;
  amount: number;
}

export interface WithdrawalRequest {
  id: string;
  amount: number;
}

export interface Account {
  id: string;
  userId: string;
  amount: number;
}

export interface PageOptions {
  page: number;
  size: number;
}

export interface SearchOptions {
  userId: string;
}

export const IBANKING_SAVINGS_PACKAGE_NAME = 'ibanking.savings';

export interface SavingsServiceClient {
  findById(request: FindByIdRequest): Observable<Account>;

  findByUserId(request: FindByUserIdRequest): Observable<FindByUserIdResponse>;

  create(request: CreateRequest): Observable<Account>;

  deposit(request: DepositRequest): Observable<Account>;

  withdrawal(request: WithdrawalRequest): Observable<Account>;
}

export interface SavingsServiceController {
  findById(
    request: FindByIdRequest,
  ): Promise<Account> | Observable<Account> | Account;

  findByUserId(
    request: FindByUserIdRequest,
  ):
    | Promise<FindByUserIdResponse>
    | Observable<FindByUserIdResponse>
    | FindByUserIdResponse;

  create(
    request: CreateRequest,
  ): Promise<Account> | Observable<Account> | Account;

  deposit(
    request: DepositRequest,
  ): Promise<Account> | Observable<Account> | Account;

  withdrawal(
    request: WithdrawalRequest,
  ): Promise<Account> | Observable<Account> | Account;
}

export function SavingsServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      'findById',
      'findByUserId',
      'create',
      'deposit',
      'withdrawal',
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method,
      );
      GrpcMethod('SavingsService', method)(
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
      GrpcStreamMethod('SavingsService', method)(
        constructor.prototype[method],
        method,
        descriptor,
      );
    }
  };
}

export const SAVINGS_SERVICE_NAME = 'SavingsService';
