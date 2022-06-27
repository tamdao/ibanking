FROM node:14-alpine as build

WORKDIR /usr/share/user-service

ADD dist package.json ./

RUN npm install --production

FROM node:14-alpine

RUN apk add --no-cache libpq

ADD https://github.com/grpc-ecosystem/grpc-health-probe/releases/download/v0.3.2/grpc_health_probe-linux-amd64 /bin/grpc_health_probe

RUN chmod +x /bin/grpc_health_probe

WORKDIR /usr/share/user-service

COPY --from=build /usr/share/user-service .

EXPOSE 50051

CMD ["node", "main.js"]