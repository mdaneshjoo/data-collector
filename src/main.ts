import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { QueueService } from './services/queue.service';
import { OnQueueActive } from '@nestjs/bull';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const queueService = app.get(QueueService)
  await queueService.runImmediateShedules()
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
