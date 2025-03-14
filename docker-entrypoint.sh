#!/bin/bash
source /app/.env

REDIS="redis://$REDIS_HOST:$REDIS_PORT"
MONGO_URI="mongodb://$MONGO_ROOT_USERNAME:$MONGO_ROOT_PASSWORD@$MONGO_HOST:27017/$MONGO_DATABASE?authSource=admin"

REDIS_HOST_PORT="$REDIS_HOST:$REDIS_PORT"
MONGO_HOST_PORT="$MONGO_HOST:27017"

echo "Wait for MONGO=$MONGO_URI, REDIS=$REDIS, KAFKA=$KAFKA_BROKERS"
set -eo pipefail
wait-for-it "$REDIS_HOST_PORT"
wait-for-it "$MONGO_HOST_PORT"
wait-for-it "$KAFKA_BROKERS"

echo "Starting to Build Source Code"
npm run build


if [ "$NODE_ENV" == "DEV" ]
then
    npm run start:dev
else
    pm2-runtime "/opt/dist/main.js"
fi

