import { si } from 'nyaapi';
import { EnrichedTorrentItem, Episode, EpisodeItem, Media, TorrentProvider } from '../schemas/media';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ProccessName, QueueName } from 'src/const';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { TorrentDownloadRequestDto } from 'src/dto/torrent-request.dto';
import { WatchmanService } from '@dev-codenix/nest-watchman';
import { Logger } from '@nestjs/common';

@Processor(QueueName.TORRENT_COLLECTOR)
export class NyaaProcessor {
    private readonly logger = new Logger(NyaaProcessor.name);
    constructor(
        @InjectModel(Media.name)
        private mediaModel: Model<Media>,
        private watchManService: WatchmanService
    ) { }

    @Process(ProccessName.NYAA_TORRENT_DOWNLOADER_JOB)
    async downloadNyaaTorrent(job: Job<TorrentDownloadRequestDto>): Promise<void> {
        const { episode, id } = job.data
        this.logger.log(`Downloading torrent for episode ${episode} of media ${id}`)
        try {
            const media = await this.mediaModel.findOne({ _id: id })
            if (!media) {
                this.logger.log(`Media with id ${id} not found`)
                job.log(`Media with id ${id} not found`)
                return
            }
            const result = await si.search(media.title.romaji, 5, {
                category: '1_0',
                direction: 'desc'
            })
            const torrentItems = this.extractMediaInfo(this.filterEpisode(result, episode))
            if (torrentItems.length === 0) {
                this.logger.log(`No torrents found for episode ${episode} of media ${id}`)
                job.log(`No torrents found for episode ${episode} of media ${id}`)
                job.retry()
                return
            }
           
            if (!media?.episodes) {

                const episodeItems = torrentItems.map(torrentItem => {
                    const episodeItem = new EpisodeItem()
                    episodeItem.quality = torrentItem.quality
                    episodeItem.codecs = torrentItem.codecs
                    episodeItem.torrent = new EnrichedTorrentItem(torrentItem)
                    episodeItem.torrent.provide = TorrentProvider.NyaaSi
                    return episodeItem
                })

                const newEpisode = new Episode()
                newEpisode.episode = +episode
                newEpisode.downloads = episodeItems

                media.episodes = [newEpisode]

            }
            else {
                const existedEpisode = media.episodes.find(episode => episode.episode === +episode)
                if (existedEpisode) {
                    torrentItems.forEach(torrentItem => {
                        const episodeItem = new EpisodeItem()
                        episodeItem.quality = torrentItem.quality
                        episodeItem.codecs = torrentItem.codecs
                        const existedTorrent = existedEpisode.downloads?.find(download => download.torrent.id === torrentItem.id)
                        if (existedTorrent) {
                            return
                        }
                        episodeItem.torrent = new EnrichedTorrentItem(torrentItem)
                        episodeItem.torrent.provide = TorrentProvider.NyaaSi
                        existedEpisode.downloads?.push(episodeItem)
                    })
                } else {
                    const episodeItems = torrentItems.map(torrentItem => {
                        const episodeItem = new EpisodeItem()
                        episodeItem.quality = torrentItem.quality
                        episodeItem.codecs = torrentItem.codecs
                        episodeItem.torrent = new EnrichedTorrentItem(torrentItem)
                        episodeItem.torrent.provide = TorrentProvider.NyaaSi
                        return episodeItem
                    })
                    const newEpisode = new Episode()
                    newEpisode.episode = +episode
                    newEpisode.downloads = episodeItems
                    media.episodes.push(newEpisode)
                }
            }
            await media.save()
            this.logger.log(`${media.title.romaji} - ${episode} torrent(s) downloaded and schema updated`)
            job.log(`${media.title.romaji} - ${episode} torrent(s) downloaded and schema updated`)

        } catch (error) {
            this.watchManService.watch(error, { metaData: { id, episode, job: ProccessName.NYAA_TORRENT_DOWNLOADER_JOB } })
            job.log(`Error on media id ${id} episode ${episode}: ${error}`)
            this.logger.error(`Error on media id ${id} episode ${episode}: ${error}`)
        }

    }

    private filterEpisode(items: si.Torrent[], episode: string): si.Torrent[] {
        const episodePattern = /(?:-\s*| [Ss]\d+[Ee])(\d+)/i;
        const episodeDigits = episode.length === 1 ? `0${episode}` : episode;
        return items.filter(item => {
            const match = item.name.match(episodePattern);
            return match && match[1] === episodeDigits;
        });
    };

    private extractMediaInfo(items: si.Torrent[]): EnrichedTorrentItem[] {
        const qualityPattern = /(4k|1080|720|480)/i;
        const codecPattern = /(x26[45]|HEVC|H\.?264|MPEG-?2|AAC)/gi;

        return items.map(item => {
            // Extract quality
            const qualityMatch = item.name.match(qualityPattern);
            const quality = qualityMatch ? qualityMatch[0].toUpperCase() : undefined;

            // Extract codecs
            const codecMatches = [...new Set(item.name.match(codecPattern))];
            const normalizedCodecs = codecMatches.map(c =>
                c.replace(/HEVC/i, 'x265')
                    .replace(/H.?264/i, 'H.264')
                    .replace(/MPEG-?2/i, 'MPEG2')
                    .toUpperCase()
            );

            return {
                ...item,
                quality,
                codecs: normalizedCodecs
            } as EnrichedTorrentItem;
        });
    };
}