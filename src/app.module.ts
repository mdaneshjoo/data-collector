import { Logger, Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { MongooseModule } from '@nestjs/mongoose';
import { Media, MediaSchema } from './schemas/media';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './task.service';
import { DiscordBaseStrategy, WatchmanModule } from '@dev-codenix/nest-watchman'
import { firstValueFrom } from 'rxjs';

import { UpdateQuery } from 'mongoose';
import { unwrapError } from './utils';
import { log } from 'console';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration]
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
    ScheduleModule.forRoot(),
    WatchmanModule.forRoot({
      strategy: DiscordBaseStrategy,
      catchOnlyInternalExceptions: true,
      strategyConfig: {
        webHookUrl: 'https://discord.com/api/webhooks/1347681792529797241/fGfvQo6rVBSg71MtEzh9CVwZALxgpqcsOdzBUYWJc_AEiK8Pp_-oKcyAv8o4X_o7nCMx',
        mentionList: ['everyone'],
      },
    }),
  ],
  controllers: [],
  providers: [AppService, TasksService],
})
export class AppModule { }
