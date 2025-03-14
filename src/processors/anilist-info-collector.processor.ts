import { Media, ProviderName, Studio, Trends } from '../schemas/media';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ProccessName, QueueName } from 'src/const';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { HttpService } from '@nestjs/axios';
import { WatchmanService } from '@dev-codenix/nest-watchman';
import * as dayjs from 'dayjs';
import { Logger } from '@nestjs/common';
import { firstValueFrom, map, Observable, retry } from 'rxjs';
import { AxiosResponse } from 'axios';
import { Page } from 'src/providers/anilist';
import slugify from 'slugify';
import { unwrapError } from 'src/utils';
import * as path from 'path';
import { promises as fs } from 'fs';

@Processor(QueueName.MEDIA_INFO_COLLECTOR)
export class AnilistInfoCollectorProcessor {
  private readonly logger = new Logger(AnilistInfoCollectorProcessor.name);

  constructor(
    private readonly httpService: HttpService,
    @InjectModel(Media.name)
    private mediaModel: Model<Media>,
    private watchManService: WatchmanService,
  ) {
  }

  @Process(ProccessName.ANILIST_AIRING_INFO_COLLECTOR_JOB)
  async fetchAirings(job: Job<unknown>): Promise<void> {
    try {
      const query = `query ($weekStart: Int, $weekEnd: Int, $page: Int) {
             Page(page: $page) {
               pageInfo {
                 hasNextPage
                 total
               }
               airingSchedules(airingAt_greater: $weekStart, airingAt_lesser: $weekEnd) {
                 episode
                 airingAt
                 timeUntilAiring
                 media {
                   id
                   idMal
                   title {
                     romaji
                     english
                     native
                     userPreferred
                   }
           
                   relations {
                     edges {
                       relationType
                       node {
                         title {
                           romaji
                         }
                       }
                     }
                   }
                   siteUrl
                   genres
                   status
                   season
                   countryOfOrigin
                   source
                   updatedAt
                   coverImage {
                     extraLarge
                     large
                     medium
                     color
                   }
                   synonyms
                   tags {
                     id
                     name
                     description
                     category
                     rank
                     isGeneralSpoiler
                     isMediaSpoiler
                     isAdult
                   }
                   externalLinks {
                     url
                     site
                     type
                     color
                     isDisabled
                   }
                   rankings {
                     id
                     rank
                     type
                     format
                     year
                     season
                     allTime
                     context
                   }
                   type
                   format
                   description
                   duration
                   seasonYear
                   chapters
                   volumes
                   trailer {
                     id
                     site
                     thumbnail
                   }
                   bannerImage
                   averageScore
                   meanScore
                   popularity
                   trending
                   isAdult
                   characters {
                     nodes {
                       name {
                         first
                         middle
                         last
                         full
                         native
                         alternative
                         alternativeSpoiler
                         userPreferred
                       }
                       image {
                         large
                         medium
                       }
                       description
                       gender
                       dateOfBirth {
                         year
                         month
                         day
                       }
                       age
                       bloodType
                     }
                   }
                   studios {
                     nodes {
                       name
                     }
                   }
                   endDate {
                     year
                     month
                     day
                   }
                   nextAiringEpisode {
                     airingAt
                     timeUntilAiring
                     episode
                   }
                   trends {
                     nodes {
                       date
                       trending
                       averageScore
                       popularity
                       inProgress
                       releasing
                       episode
                     }
                   }
                   startDate {
                     year
                     month
                     day
                   }
                   recommendations {
                     nodes {
                       media {
                         title {
                           romaji
                           english
                           native
                           userPreferred
                         }
                       }
                     }
                   }
                   stats {
                     scoreDistribution {
                       score
                       amount
                     }
                     statusDistribution {
                       status
                       amount
                     }
                   }
                   episodes
                 }
               }
             }
           }
           
           `;

      const variables = {
        weekStart: Math.floor(new Date(dayjs().startOf('week').hour(0).minute(0).second(0).format('YYYY-MM-DD')).getTime() / 1000),
        weekEnd: Math.floor(new Date(dayjs().endOf('w').add(1, 'day').format('YYYY-MM-DD')).getTime() / 1000),
        page: 1,
      };
      const startWeekDate = new Date(variables.weekStart * 1000).toISOString().split('T')[0];
      const endWeekDate = new Date(variables.weekEnd * 1000).toISOString().split('T')[0];

      while (true) {


        this.logger.log(`Fetching Airing page ${variables.page}, Week: ${startWeekDate} - ${endWeekDate}`);
        job.log(`Fetching Airing page ${variables.page}, Week: ${startWeekDate} - ${endWeekDate}`);

        const airing = await firstValueFrom(this.anilistApi(query, variables));

        if (!airing.data.Page?.airingSchedules || !airing.data.Page?.airingSchedules.length) {
          this.logger.log(`No airing found for week ${variables.weekStart} - ${variables.weekEnd}`);
          job.log(`No airing found for week ${variables.weekStart} - ${variables.weekEnd}`);
          break;
        }
        for (const air of airing.data.Page.airingSchedules) {
          const mediaData: Media = {
            provider: {
              name: ProviderName.AniList,
              siteUrl: air.media.siteUrl,
              media_id: air.media.id,
            },
            airingSchedule: {
              airingAt: new Date(air.airingAt * 1000),
              timeUntilAiring: air.timeUntilAiring,
              episode: air.episode,
            },
            title: air.media.title,
            genres: air.media.genres,
            status: air.media.status,
            slug: slugify(air.media.title.romaji, { lower: true, trim: true }),
            season: air.media.season,
            countryOfOrigin: air.media.countryOfOrigin,
            source: air.media.source,
            updatedAt: air.media.updatedAt,
            coverImage: air.media.coverImage,
            synonyms: air.media.synonyms,
            tags: air.media.tags,
            externalLinks: air.media.externalLinks,
            rankings: air.media.rankings,
            media_type: air.media.type,
            media_format: air.media.format,
            description: air.media?.description || '',
            duration: air.media.duration || 0,
            idMal: air.media.idMal || 0,
            seasonYear: air.media.seasonYear || 0,
            chapters: air.media.chapters || 0,
            volumes: air.media.volumes || 0,
            trailer: air.media.trailer,
            bannerImage: air.media.bannerImage || '',
            averageScore: air.media.averageScore || 0,
            meanScore: air.media.meanScore || 0,
            popularity: air.media.popularity || 0,
            trending: air.media.trending || 0,
            isAdult: air.media.isAdult || false,
            studios: air.media.studios?.nodes?.map((studio) => new Studio(studio.name)),
            nextAiringEpisode: {
              airingAt: air.media.nextAiringEpisode?.airingAt ? new Date(air.media.nextAiringEpisode.airingAt * 1000) : null,
              timeUntilAiring: air.media.nextAiringEpisode?.timeUntilAiring || 0,
              episode: air.media.nextAiringEpisode?.episode || 0,
            },
            total_episodes: air.media.episodes || 0,
            trends: air.media.trends.nodes?.map((trend) => new Trends(trend)),
            stats: air.media.stats,
          };

          if (air.media.endDate.year || air.media.endDate.month || air.media.endDate.day) {
            mediaData.endDate = new Date(air.media.endDate.year, air.media.endDate.month - 1, air.media.endDate.day);
          }

          if (air.media.startDate.year || air.media.startDate.month || air.media.startDate.day) {
            mediaData.startDate = new Date(air.media.startDate.year, air.media.startDate.month - 1, air.media.startDate.day);
          }

          await this.updateImage(mediaData);

          const media = await this.mediaModel.findOneAndUpdate(
            { slug: slugify(air.media.title.romaji, { lower: true, trim: true }) },
            mediaData,
            { new: true, upsert: true },
          );
          const relatedIds: Types.ObjectId[] = [];
          if (air.media?.relations?.edges?.length) {
            for (const element of air.media.relations.edges) {
              if (element?.node?.title?.romaji) {
                const relatedData: Media = {
                  provider: {
                    name: ProviderName.AniList,
                    siteUrl: element.node.siteUrl,
                    media_id: element.node.id,
                  },
                  title: element.node.title,
                  slug: slugify(element.node.title.romaji, { lower: true, trim: true }),
                  coverImage: element.node.coverImage,
                  description: '',
                  media: media._id,
                };
                await this.updateImage(relatedData);
                const related = await this.mediaModel.findOneAndUpdate({
                    slug: slugify(element.node.title.romaji, { lower: true, trim: true }),
                  },
                  {
                    $setOnInsert: relatedData,
                  },
                  { new: true, upsert: true },
                );
                relatedIds.push(related._id);
              }
            }
            const up = await this.mediaModel.updateOne(
              {
                _id: media._id,
              },
              {
                $set: {
                  related: relatedIds,
                },
              },
            );
            console.log(up);
          }

        }

        if (!airing.data.Page.pageInfo.hasNextPage) {
          this.logger.log(`Fetching Airings Completed`);
          job.log(`Fetching Airings Completed`);
          break;
        }
        variables.page++;
      }
    } catch (error) {
      const unwrappedError = unwrapError(error);
      this.watchManService.watch(unwrappedError, {});
      this.logger.error(unwrappedError);
      job.log(unwrappedError);
    }

  }

  private async updateImage(mediaData: Media) {
    if (
      mediaData?.coverImage
    ) {
      const covetImageKeys = Object.keys(mediaData.coverImage);
      for (const key of covetImageKeys) {
        if (key === 'color') continue;
        this.logger.log(`Downloading coverImage ${key}`);
        if (mediaData.coverImage[key]) {
          const localPath = await this.downloadImage(mediaData.coverImage[key]);
          mediaData.coverImage[key] = localPath;
        }
      }
    }

    if (mediaData?.bannerImage) {
      this.logger.log(`Downloading bannerImage`);
      const localPath = await this.downloadImage(mediaData.bannerImage);
      mediaData.bannerImage = localPath;
    }
  }

  anilistApi(query: string, variables: Record<string, unknown>): Observable<AxiosResponse<{ Page: Page }>> {
    this.logger.log('Starting Anilist API Request');
    const body = JSON.stringify({
      query: query,
      variables: variables,
    });
    return this.httpService
      .post('https://graphql.anilist.co', body, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })
      .pipe(
        retry({ count: 3, delay: 60_000 }),
        map((response) => {
          this.logger.log('Anilist API Request Completed');
          return response.data;
        }),
      );
  }

  imageDownloader(url: string) {
    const headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      Accept: 'image/webp,image/apng,image/*,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    };

    return this.httpService.get(url, {
      responseType: 'arraybuffer',
      headers: headers,
      timeout: 10_000,
    }).pipe(
      retry({ count: 3, delay: 10_000 }),
      map((response) => {
        return response.data;
      }),
    );
  }

  async downloadImage(url: string): Promise<string> {
    try {


      const response = await firstValueFrom(
        this.imageDownloader(url),
      );
      const buffer = Buffer.from(response, 'binary');

      const fileName = path.basename(url);
      const localDir = path.resolve(__dirname, '..', 'uploads', 'images');
      await fs.mkdir(localDir, { recursive: true });
      const localPath = path.join(localDir, fileName);

      await fs.writeFile(localPath, buffer);
      return fileName;
    } catch (error) {
      const unwrappedError = unwrapError(error);
      this.watchManService.watch(unwrappedError, {
        metaData: {
          note: 'this occurs when server unable to download the image, related image will be skipped',
          reletad: 'url',
        },
      });
      this.logger.error(unwrappedError);
      return '';
    }
  }
}