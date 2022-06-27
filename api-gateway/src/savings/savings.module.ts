import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { IBANKING_SAVINGS_PACKAGE_NAME } from 'src/grpc/savings.interface';
import { SavingsResolver } from './savings.resolver';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: IBANKING_SAVINGS_PACKAGE_NAME,
        transport: Transport.GRPC,
        options: {
          url: `${process.env.SAVINGS_SERVICE_URL}`,
          package: IBANKING_SAVINGS_PACKAGE_NAME,
          protoPath: join(__dirname, '../grpc/savings.proto'),
          loader: {
            keepCase: false,
            enums: String,
            oneofs: true,
            arrays: true,
            longs: Number,
          },
        },
      },
    ]),
  ],
  providers: [SavingsResolver],
})
export class SavingsModule {}
