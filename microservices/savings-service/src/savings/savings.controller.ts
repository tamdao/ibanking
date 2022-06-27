import { BadRequestException, Controller, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable } from 'rxjs';
import { DataSource, Repository, MoreThan } from 'typeorm';
import {
  Account as AccountEntity,
  AccountStatement as AccountStatementEntity,
  Transaction as TransactionEntity,
  TransactionLeg as TransactionLegEntity,
  TransactionLegType,
  TransactionType,
} from './entities';
import {
  CreateRequest,
  DepositRequest,
  FindByUserIdRequest,
  FindByUserIdResponse,
  Account,
  SavingsServiceController,
  SavingsServiceControllerMethods,
  WithdrawalRequest,
  FindByIdRequest,
} from './savings.interface';

const SYSTEM_ACCOUNT_DEPOSIT_ID = process.env.SYSTEM_ACCOUNT_DEPOSIT_ID;

@Controller('savings')
@SavingsServiceControllerMethods()
@Injectable()
export class SavingsController implements SavingsServiceController {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    @InjectRepository(AccountStatementEntity)
    private readonly accountStatementEntityRepository: Repository<AccountStatementEntity>,
    @InjectRepository(TransactionEntity)
    private readonly transactionEntityRepository: Repository<TransactionEntity>,
    @InjectRepository(TransactionLegEntity)
    private readonly transactionLegEntityRepository: Repository<TransactionLegEntity>,
  ) {}

  async findById(request: FindByIdRequest): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: {
        id: request.id,
      },
      relations: {
        statement: true,
      },
    });

    const transactionLegs = await this.transactionLegEntityRepository.findBy({
      account: {
        id: request.id,
      },
      createdAt: MoreThan(account.statement.date),
    });

    const amount = transactionLegs.reduce((prevValue, transactionLeg) => {
      return prevValue + transactionLeg.type === TransactionLegType.CREDIT
        ? transactionLeg.amount
        : -transactionLeg.amount;
    }, account.statement.closingBalance);

    return {
      id: account.id,
      userId: account.userId,
      amount,
    };
  }

  findByUserId(
    request: FindByUserIdRequest,
  ):
    | FindByUserIdResponse
    | Promise<FindByUserIdResponse>
    | Observable<FindByUserIdResponse> {
    throw new Error('Method not implemented.');
  }
  async create(request: CreateRequest): Promise<Account> {
    const userId = request.userId;
    if (!userId) {
      throw new BadRequestException();
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const accountStatement = this.accountStatementEntityRepository.create({
        closingBalance: 0,
        totalCredit: 0,
        totalDebit: 0,
        date: new Date(),
      });

      const accountStatementRecord = await queryRunner.manager.save(
        accountStatement,
      );

      const account = this.accountRepository.create({
        userId,
        statement: accountStatementRecord,
      });

      const accountRecord = await queryRunner.manager.save(account);
      await queryRunner.commitTransaction();

      return {
        id: accountRecord.id,
        userId: accountRecord.userId,
        amount: 0,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException();
    } finally {
      await queryRunner.release();
    }
  }
  async deposit(request: DepositRequest): Promise<Account> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const transaction = this.transactionEntityRepository.create({
        type: TransactionType.DEPOSIT,
      });

      const transactionRecord = await queryRunner.manager.save(transaction);

      const transactionLegDebit = this.transactionLegEntityRepository.create({
        account: {
          id: SYSTEM_ACCOUNT_DEPOSIT_ID,
        },
        amount: request.amount,
        type: TransactionLegType.DEBIT,
        transaction: transactionRecord,
      });
      await queryRunner.manager.save(transactionLegDebit);

      const transactionLegCredit = this.transactionLegEntityRepository.create({
        account: {
          id: request.id,
        },
        amount: request.amount,
        type: TransactionLegType.CREDIT,
        transaction: transactionRecord,
      });
      await queryRunner.manager.save(transactionLegCredit);

      await queryRunner.commitTransaction();

      return this.findById({
        id: request.id,
      });
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException();
    } finally {
      await queryRunner.release();
    }
  }
  async withdrawal(request: WithdrawalRequest): Promise<Account> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const account = await this.findById({
        id: request.id,
      });

      if (account.amount < request.amount) {
        throw new BadRequestException();
      }

      const transaction = this.transactionEntityRepository.create({
        type: TransactionType.WITHDRAWAL,
      });

      const transactionRecord = await queryRunner.manager.save(transaction);

      const transactionLegCredit = this.transactionLegEntityRepository.create({
        account: {
          id: request.id,
        },
        amount: request.amount,
        type: TransactionLegType.CREDIT,
        transaction: transactionRecord,
      });

      await queryRunner.manager.save(transactionLegCredit);

      await queryRunner.commitTransaction();

      return this.findById({
        id: request.id,
      });
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException();
    } finally {
      await queryRunner.release();
    }
  }
}
