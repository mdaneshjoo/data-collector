import { Controller } from "@nestjs/common";
import { Ctx, KafkaContext, MessagePattern, Payload } from "@nestjs/microservices";
import { Topics } from "src/const";
import { TorrentDownloadRequestDto } from "src/dto/torrent-request.dto";
import { QueueService } from "src/services/queue.service";

@Controller()
export class NyaaTorrentController {
    constructor(private readonly queueService: QueueService) { }
    @MessagePattern(Topics.NYAA_TORRENT_DOWNLOADER)
    async requestDownloadTorrent(@Payload() message: TorrentDownloadRequestDto, @Ctx() context: KafkaContext) {
        await this.queueService.runNyaaTorrentsCollectorJob(message)
    }
}