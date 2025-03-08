import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AxiosResponse } from 'axios';
import { catchError, firstValueFrom, map, Observable, retry } from 'rxjs';
import { Page } from './providers/anilist';
import { HttpService } from '@nestjs/axios';
import * as dayjs from 'dayjs';
import { Media, ProviderName, Studio, Trends } from './schemas/media';
import slugify from 'slugify';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { WatchmanService } from '@dev-codenix/nest-watchman';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(private readonly httpService: HttpService,
    @InjectModel(Media.name)
    private mediaModel: Model<Media>,
    private watchManService: WatchmanService
  ) { }

  @Cron(CronExpression.EVERY_30_SECONDS, { waitForCompletion: true })
  async fetchAirings() {
    try {
      this.logger.log('Fetching Airings')
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
        weekStart: Math.floor(new Date(dayjs().startOf("w").format("YYYY-MM-DD")).getTime() / 1000),
        weekEnd: Math.floor(new Date(dayjs().endOf("w").format("YYYY-MM-DD")).getTime() / 1000),
        page: 1
      }

      while (true) {
        this.logger.log(`Fetching page ${variables.page}`)
        const airing = await firstValueFrom(this.anilistApi(query, variables))
        if (!airing.data.Page?.airingSchedules || !airing.data.Page?.airingSchedules.length) {
          break
        }
        for (const air of airing.data.Page.airingSchedules) {
          const mediaData: Media = {
            provider: {
              name: ProviderName.AniList,
              siteUrl: air.media.siteUrl,
              media_id: air.media.id
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
          }

          if (air.media.endDate.year || air.media.endDate.month || air.media.endDate.day) {
            mediaData.endDate = new Date(air.media.endDate.year, air.media.endDate.month - 1, air.media.endDate.day)
          }

          if (air.media.startDate.year || air.media.startDate.month || air.media.startDate.day) {
            mediaData.startDate = new Date(air.media.startDate.year, air.media.startDate.month - 1, air.media.startDate.day)
          }

          const media = await this.mediaModel.findOneAndUpdate(
            { slug: slugify(air.media.title.romaji, { lower: true, trim: true }) },
            mediaData,
            { new: true, upsert: true },
          );
          const relatedIds: Types.ObjectId[] = []
          if (air.media?.relations?.edges?.length) {
            for (const element of air.media.relations.edges) {
              if (element?.node?.title?.romaji) {
                const related = await this.mediaModel.findOneAndUpdate({
                  slug: slugify(element.node.title.romaji, { lower: true, trim: true }),
                },
                  {
                    $setOnInsert: {
                      provider: {
                        name: ProviderName.AniList,
                        siteUrl: element.node.siteUrl,
                        media_id: element.node.id
                      },
                      title: element.node.title,
                      slug: slugify(element.node.title.romaji, { lower: true, trim: true }),
                      coverImage: air.media.coverImage,
                      media: media._id
                    }
                  },
                  { new: true, upsert: true }
                )
                relatedIds.push(related._id)
              }
            }
            await this.mediaModel.findByIdAndUpdate(media._id, { related: relatedIds })
          }

        }

        if (!airing.data.Page.pageInfo.hasNextPage) {
          this.logger.log(`Fetching Airings Completed`)
          break
        }
        variables.page++;
      }
    } catch (error) {
      this.watchManService.watch(error, {})
    }

  }

  anilistApi(query: string, variables: Record<string, unknown>): Observable<AxiosResponse<{ Page: Page }>> {
    const body = JSON.stringify({
      query: query,
      variables: variables
    })
    return this.httpService
      .post('https://graphql.anilist.co', body, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      })
      .pipe(
        retry({ count: 3, delay: 60_000 }),
        map((response) => response.data),
      )
  }
}