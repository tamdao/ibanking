![iBanking System Design](/iBanking.jpg 'iBanking System Design')

# NestJS GraphQL API + gRPC microservices
This project is containing a GraphQL API with gRPC back-end microservices built using the NestJS framework.

## 1. Enviproment:

- Install (Docker)[https://docs.docker.com/engine/install/]
- Install (Yarn)[https://classic.yarnpkg.com/lang/en/docs/install/]

## 2. How to run project:

1. Run command: `./scripts/install.sh`
2. Run command: `./scripts/build.sh`
3. Run command: `docker-compose up`
4. Now you can access this URL: `http://localhost:3000/graphql`

## 3. First time run you need to add 2 system savings account. So you need to access `savings-db` and exculte database query to add 2 accounts

1. Access to `savings-db` with command: `docker-compose run savings-db bash`
2. Access to `postgreSQL` with command: `psql -h localhost -p 5432 -U postgres`
3. Run:
   1. `INSERT INTO account(id, type) VALUES ('87c10eea-e9ac-4b67-90f0-60864f6b158b', 'System Deposit');`
   2. `INSERT INTO account(id, type) VALUES ('bcc34e6d-899c-4243-9ffa-05c78119ed51', 'System Saving');`

## 4. Transaction with Row

The data store in `transaction` table and `transaction_leg` table.

### 1. Deposit $100:

`transaction` table
| id | type | createdAt | updatedAt |
| -- | ---- | ---------- | ---------- |
| <transaction_id> | Deposit | ..... | ..... |

`transaction_leg` table
| id | transctionId | accountId | amount | type | createdAt | updatedAt |
| -- | ------------ | --------- | ------ | ---- | ---------- | ---------- |
| <transaction_leg_id> | <transction_id> | <user_account_id> | 100 | Credit | ... | ..... |
| <transaction_leg_id> | <transction_id> | 87c10eea-e9ac-4b67-90f0-60864f6b158b | 100 | Debit | ... | ..... |

### 2. Withdrawal $100:

`transaction` table
| id | type | createdAt | updatedAt |
| -- | ---- | ---------- | ---------- |
| <transaction_id> | Withdrawal | ..... | ..... |

`transaction_leg` table
| id | transctionId | accountId | amount | type | createdAt | updatedAt |
| -- | ------------ | --------- | ------ | ---- | ---------- | ---------- |
| <transaction_leg_id> | <transction_id> | <account_id> | 100 | Debit | ... | ..... |
| <transaction_leg_id> | <transction_id> | 87c10eea-e9ac-4b67-90f0-60864f6b158b | 100 | Credit | ... | ..... |

### 3. Saving $20:

`transaction` table
| id | type | createdAt | updatedAt |
| -- | ---- | ---------- | ---------- |
| <transaction_id> | Saving | ..... | ..... |

`transaction_leg` table
| id | transctionId | accountId | amount | type | createdAt | updatedAt |
| -- | ------------ | --------- | ------ | ---- | ---------- | ---------- |
| <transaction_leg_id> | <transction_id> | <account_id> | 20 | Credit | ... | ..... |
| <transaction_leg_id> | <transction_id> | bcc34e6d-899c-4243-9ffa-05c78119ed51 | 20 | Debit | ... | ..... |

## Documents
- (Accounting Transaction)[https://martinfowler.com/eaaDev/AccountingTransaction.html]
