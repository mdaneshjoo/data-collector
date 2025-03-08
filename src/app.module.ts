import { Module } from '@nestjs/common';
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
import { promises as fs } from 'fs';
import * as path from 'path';
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
          schema.pre<Media>('findOneAndUpdate', async function (next) {
            if (this.coverImage && this.coverImage.extraLarge) {
              try {
                // Download the image data
                const response = await firstValueFrom(httpSevice.get(this.coverImage.extraLarge, {
                  responseType: 'arraybuffer',
                }));
                const buffer = Buffer.from(response.data, 'binary');

                // Define a local directory and filename
                const fileName = path.basename(this.coverImage.extraLarge);
                const localDir = path.resolve(__dirname, '..', 'uploads', 'images');
                await fs.mkdir(localDir, { recursive: true });
                const localPath = path.join(localDir, fileName);

                // Write the image to the local file system
                await fs.writeFile(localPath, buffer);

                // Update the document field to the local file path
                this.coverImage.extraLarge = localPath;
              } catch (error) {
                console.error('Error downloading image:', error);
                // Optionally, you could return next(error) to abort saving if desired.
              }
            }
            next();
          })
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
