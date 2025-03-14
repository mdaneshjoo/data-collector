import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { QueueService } from './services/queue.service';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const KAFKA_BROKERS = configService.getOrThrow<string>('KAFKA_BROKERS');
  const APP_PORT = configService.getOrThrow<number>('APP_PORT');
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'data-collector-consumer',
        brokers: [KAFKA_BROKERS],
      },
      consumer: {
        groupId: 'data-collector-group',
      },
    },
  });

  await app.startAllMicroservices();

  const queueService = app.get(QueueService);
  await queueService.runImmediateShedules();
  await app.listen(APP_PORT);
}

bootstrap();
