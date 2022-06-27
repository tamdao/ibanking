import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Account } from './account.entity';
import { Transaction } from './transaction.entity';

export enum TransactionLegType {
  CREDIT = 'Credit',
  DEBIT = 'Debit',
}

@Entity()
export class TransactionLeg {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: TransactionLegType,
  })
  type: TransactionLegType;

  @Column({
    default: 0,
  })
  amount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Account, (account) => account.transactionLegs)
  account: Account;

  @ManyToOne(() => Transaction, (transaction) => transaction.transactionLegs)
  transaction: Transaction;
}
