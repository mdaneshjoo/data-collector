import { InjectQueue } from "@nestjs/bull";
import { ConfigService } from "@nestjs/config";
import { Queue } from "bull";
import { MinuteInMili, ProccessName, QueueName } from "src/const";
import { TorrentDownloadRequestDto } from "src/dto/torrent-request.dto";

export class QueueService {
    constructor(
        private readonly configService: ConfigService,
        @InjectQueue(QueueName.TORRENT_COLLECTOR)
        private readonly torrentCollectorQueue: Queue,
        @InjectQueue(QueueName.MEDIA_INFO_COLLECTOR)
        private readonly mediaInfoCollectorQueue: Queue,

    ) { }

    async runNyaaTorrentsCollectorJob(torrentDownloadRequestDto: TorrentDownloadRequestDto) {
        await this.torrentCollectorQueue.add(ProccessName.NYAA_TORRENT_DOWNLOADER_JOB,
            { ...torrentDownloadRequestDto },
            {
                attempts: this.configService.get('NYAA_TORRENT_COLLECTOR_JOB_ATTEMPTS'),
                backoff: {
                    type: (this.configService.get('NYAA_TORRENT_COLLECTOR_JOB_BACKOFF_TYPE')) as string,
                    delay: this.configService.get('NYAA_TORRENT_COLLECTOR_JOB_BACKOFF_delay'),
                },
            }
        )
    }
    async runAnilistAiringInfoCollector() {
        await this.mediaInfoCollectorQueue.add(ProccessName.ANILIST_AIRING_INFO_COLLECTOR_JOB,
            {},
            {
                repeat: {
                    cron: this.configService.get('AIRING_CRON_SCHEDULE') as string,
                },

            }
        )
    }

    async runImmediateShedules() {
       await this.runAnilistAiringInfoCollector()
    }


}