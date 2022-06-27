import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Account,
  AccountStatement,
  Transaction,
  TransactionLeg,
} from './entities';
import { SavingsController } from './savings.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Account,
      AccountStatement,
      Transaction,
      TransactionLeg,
    ]),
  ],
  controllers: [SavingsController],
  exports: [TypeOrmModule],
})
export class SavingsModule {}
