import { Module } from '@nestjs/common';
import { UsersResolver } from './users.resolver';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { IBANKING_USERS_PACKAGE_NAME } from 'src/grpc/users.interface';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: IBANKING_USERS_PACKAGE_NAME,
        transport: Transport.GRPC,
        options: {
          url: `${process.env.USER_SERVICE_URL}`,
          package: IBANKING_USERS_PACKAGE_NAME,
          protoPath: join(__dirname, '../grpc/users.proto'),
          loader: {
            keepCase: false,
            enums: String,
            oneofs: true,
            arrays: true,
          },
        },
      },
    ]),
  ],
  providers: [UsersResolver],
})
export class UsersModule {}
