import { Inject, OnModuleInit, UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ClientGrpc } from '@nestjs/microservices';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { CurrentUser } from 'src/auth/user.decorator';
import {
  IBANKING_SAVINGS_PACKAGE_NAME,
  SavingsServiceClient,
  SAVINGS_SERVICE_NAME,
} from 'src/grpc/savings.interface';
import { User } from 'src/grpc/users.interface';
import { CreateInput } from './dto/create.input';
import { DepositInput } from './dto/deposit.input';
import { WithdrawalInput } from './dto/withdrawal.input';

@Resolver('SavingsAccount')
export class SavingsResolver implements OnModuleInit {
  private savingsService: SavingsServiceClient;

  constructor(
    @Inject(IBANKING_SAVINGS_PACKAGE_NAME) private client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.savingsService =
      this.client.getService<SavingsServiceClient>(SAVINGS_SERVICE_NAME);
  }

  @Mutation('create')
  @UseGuards(GqlAuthGuard)
  async create(@Args('createInput') createInput: CreateInput) {
    const response = await this.savingsService
      .create({
        userId: createInput.userId,
      })
      .toPromise();

    return {
      id: response.id,
      userId: response.userId,
      amount: response.amount || 0,
    };
  }

  @Mutation('deposit')
  @UseGuards(GqlAuthGuard)
  deposit(@Args('depositInput') depositInput: DepositInput) {
    return this.savingsService.deposit({
      id: depositInput.id,
      amount: depositInput.amount,
    });
  }

  @Mutation('withdrawal')
  @UseGuards(GqlAuthGuard)
  withdrawal(@Args('withdrawalInput') withdrawalInput: WithdrawalInput) {
    return this.savingsService.withdrawal({
      id: withdrawalInput.id,
      amount: withdrawalInput.amount,
    });
  }

  @Query('savingsAccounts')
  @UseGuards(GqlAuthGuard)
  async findAll(@CurrentUser() user: User) {
    const result = await this.savingsService
      .findByUserId({
        searchOptions: {
          userId: user.id,
        },
        pageOptions: {
          page: 0,
          size: 100,
        },
      })
      .toPromise();
    return result.accounts;
  }

  @UseGuards(GqlAuthGuard)
  @Query('savingsAccount')
  findOne(@Args('id') id: string) {
    return this.savingsService.findById({
      id: id,
    });
  }
}
