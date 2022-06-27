import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { AccountStatement } from './account-statement.entity';
import { TransactionLeg } from './transaction-leg.entity';

export enum AccountType {
  USER = 'User',
  SYSTEM_DEPOSIT = 'System Deposit',
  SYSTEM_SAVING = 'System Saving',
}

@Entity()
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  userId: string;

  @Column({
    type: 'enum',
    enum: AccountType,
    default: AccountType.USER,
  })
  type: AccountType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => AccountStatement)
  @JoinColumn()
  statement: AccountStatement;

  @OneToMany(() => TransactionLeg, (transactionLeg) => transactionLeg.account)
  transactionLegs: TransactionLeg[];
}
