#!/bin/bash

cd api-gateway && npm run lint && cd -
cd microservices/user-service && npm run lint && cd -
cd microservices/savings-service && npm run lint && cd -