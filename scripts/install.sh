#!/bin/bash

cd api-gateway && yarn && cd -
cd microservices/user-service && yarn && cd -
cd microservices/savings-service && yarn && cd -