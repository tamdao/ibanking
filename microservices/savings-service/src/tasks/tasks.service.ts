import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, MoreThan } from 'typeorm';
import {
  Account as AccountEntity,
  AccountStatement as AccountStatementEntity,
  Transaction as TransactionEntity,
  TransactionLeg as TransactionLegEntity,
  TransactionLegType,
  TransactionType,
} from '../savings/entities';

const SYSTEM_ACCOUNT_SAVING_ID = process.env.SYSTEM_ACCOUNT_SAVING_ID;
const SAVING_PER_DAY = 7 / 100 / 365;

@Injectable()
export class TasksService {
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

  @Cron('0 59 23 * * *') // Run everyday at 23:59
  async savingHandler() {
    let totalResult = 0;
    let skip = 0;
    do {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const accounts = await this.accountRepository.find({
        skip,
        take: 100,
        relations: {
          statement: true,
        },
      });

      try {
        accounts.map(async (account) => {
          const transactionLegs =
            await this.transactionLegEntityRepository.findBy({
              account: {
                id: account.id,
              },
              createdAt: MoreThan(account.statement.date),
            });

          const amount = transactionLegs.reduce((prevValue, transactionLeg) => {
            return prevValue + transactionLeg.type === TransactionLegType.CREDIT
              ? transactionLeg.amount
              : -transactionLeg.amount;
          }, account.statement.closingBalance);

          const transaction = await this.transactionEntityRepository.create({
            type: TransactionType.SAVING,
          });

          const transactionRecord = await queryRunner.manager.save(transaction);

          const transactionLegDebit =
            this.transactionLegEntityRepository.create({
              account: {
                id: SYSTEM_ACCOUNT_SAVING_ID,
              },
              amount: amount * SAVING_PER_DAY,
              type: TransactionLegType.DEBIT,
              transaction: transactionRecord,
            });
          await queryRunner.manager.save(transactionLegDebit);
          const transactionLegCredit =
            this.transactionLegEntityRepository.create({
              account: {
                id: account.id,
              },
              amount: amount * SAVING_PER_DAY,
              type: TransactionLegType.CREDIT,
              transaction: transactionRecord,
            });
          await queryRunner.manager.save(transactionLegCredit);
        });

        await queryRunner.commitTransaction();
      } catch (err) {
        await queryRunner.rollbackTransaction();
      } finally {
        await queryRunner.release();
      }
      skip = +100;
      totalResult = accounts.length;
    } while (totalResult > 0);
  }

  @Cron('0 0 0 1 * *') // Run every month at 00:00 date 1
  async accountStatementCalculate() {
    let totalResult = 0;
    let skip = 0;
    do {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const accounts = await this.accountRepository.find({
        skip,
        take: 100,
        relations: {
          statement: true,
        },
      });

      try {
        accounts.map(async (account) => {
          const transactionLegs =
            await this.transactionLegEntityRepository.findBy({
              account: {
                id: account.id,
              },
              createdAt: MoreThan(account.statement.date),
            });

          const totalCredit = transactionLegs.reduce(
            (prevValue, transactionLeg) => {
              return prevValue + transactionLeg.type ===
                TransactionLegType.CREDIT
                ? transactionLeg.amount
                : 0;
            },
            account.statement.totalCredit,
          );
          const totalDebit = transactionLegs.reduce(
            (prevValue, transactionLeg) => {
              return prevValue + transactionLeg.type ===
                TransactionLegType.DEBIT
                ? transactionLeg.amount
                : 0;
            },
            account.statement.totalDebit,
          );

          const closingBalance =
            account.statement.closingBalance + totalCredit - totalDebit;

          await queryRunner.manager.update<AccountStatementEntity>(
            AccountStatementEntity,
            account.statement.id,
            {
              closingBalance,
              totalCredit,
              totalDebit,
              date: new Date(),
            },
          );
        });
        await queryRunner.commitTransaction();
      } catch (err) {
        await queryRunner.rollbackTransaction();
      } finally {
        await queryRunner.release();
      }
      skip = +100;
      totalResult = accounts.length;
    } while (totalResult > 0);
  }
}
