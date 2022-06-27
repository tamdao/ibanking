import { ClientOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { IBANKING_USERS_PACKAGE_NAME } from './users/users.interface';

export const grpcClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    url: `${process.env.GRPC_HOST}:${process.env.GRPC_PORT}`,
    package: IBANKING_USERS_PACKAGE_NAME,
    protoPath: join(__dirname, './users/users.proto'),
    loader: {
      keepCase: false,
      enums: String,
      oneofs: true,
      arrays: true,
      longs: Number,
    },
  },
};
