import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { MongooseModule } from '@nestjs/mongoose';
import { Media, MediaSchema } from './schemas/media';
import { HttpModule, HttpService } from '@nestjs/axios';
import { DiscordBaseStrategy, WatchmanModule } from '@dev-codenix/nest-watchman'
import * as Joi from 'joi';
import { MinuteInMili, QueueName } from './const';
import { BullModule, BullRootModuleOptions } from '@nestjs/bull';
import { QueueService } from './services/queue.service';
import { ExpressAdapter } from "@bull-board/express";
import { BullBoardModule } from '@bull-board/nestjs';
import * as basicAuth from "express-basic-auth";
import { NyaaProcessor } from './processors/nyaa-torrent.processor';
import { AnilistInfoCollectorProcessor } from './processors/anilist-info-collector.processor';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { NyaaTorrentController } from './controllers/nyaa-torrent.controller';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): BullRootModuleOptions => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD'),
          username: configService.get('REDIS_USER'),
        }
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      {
        name: QueueName.TORRENT_COLLECTOR,
      },
      {
        name: QueueName.MEDIA_INFO_COLLECTOR,
      },
    ),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: Joi.object({
        MONGO_URI: Joi.string().required(),
        AIRING_CRON_SCHEDULE: Joi.string().required(),
        REDIS_HOST: Joi.string().default('localhost'),
        REDIS_PORT: Joi.number().port().default(6379),
        REDIS_USER: Joi.string(),
        REDIS_PASSWORD: Joi.string(),
        NYAA_TORRENT_COLLECTOR_JOB_ATTEMPTS: Joi.number().default(3),
        NYAA_TORRENT_COLLECTOR_JOB_BACKOFF_delay: Joi.number().default(MinuteInMili.TEN_MINUTE),
        NYAA_TORRENT_COLLECTOR_JOB_BACKOFF_TYPE: Joi.string().allow('fixed', 'exponential').default('fixed'),
        BULLBOARD_ADMIN_PASSWORD: Joi.string().required(),
        KAFKA_BROKERS: Joi.string().required(),
        APP_PORT: Joi.number().port().default(3000),
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('MONGO.URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeatureAsync([
      {
        name: Media.name,
        imports: [HttpModule],
        useFactory: (httpSevice: HttpService) => {
          const schema = MediaSchema
          return schema
        },
        inject: [HttpService],
      }
    ]),
    HttpModule,
    WatchmanModule.forRoot({
      strategy: DiscordBaseStrategy,
      strategyConfig: {
        webHookUrl: 'https://discord.com/api/webhooks/1347681792529797241/fGfvQo6rVBSg71MtEzh9CVwZALxgpqcsOdzBUYWJc_AEiK8Pp_-oKcyAv8o4X_o7nCMx',
        mentionList: ['everyone'],
      }
    }),
    BullBoardModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        route: '/queues',
        adapter: ExpressAdapter,
        middleware: basicAuth({
          challenge: true,
          users: { admin: configService.get('BULLBOARD_ADMIN_PASSWORD') as string },
        }),
      }),
      inject: [ConfigService],

    }),
    BullBoardModule.forFeature(
      {
        name: QueueName.TORRENT_COLLECTOR,
        adapter: BullAdapter,
      },
      {
        name: QueueName.MEDIA_INFO_COLLECTOR,
        adapter: BullAdapter,
      },
    )
  ],
  controllers: [NyaaTorrentController],
  providers: [QueueService, AnilistInfoCollectorProcessor, NyaaProcessor],

})

export class AppModule { }
