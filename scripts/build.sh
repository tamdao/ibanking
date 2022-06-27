#!/bin/bash

cd api-gateway && npm run build && cd -
cd microservices/user-service && npm run build && cd -
cd microservices/savings-service && npm run build && cd -
docker-compose build --no-cache