import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import {
    MediaCoverImage,
    MediaFormat,
    MediaRank,
    MediaSeason,
    MediaSource,
    MediaStats,
    MediaStatus,
    MediaTag,
    MediaTitle,
    MediaTrailer,
    MediaType,
} from "src/providers/anilist";
import { ExternalLinkType } from "src/providers/anilist/media";
import { si } from 'nyaapi';

export type MediaDocument = HydratedDocument<Media>;


export class ExternalLinks {
    url?: string // String The url of the external link or base url of link source
    site: string // String! The links website site name
    type?: ExternalLinkType // ExternalLinkType The type of the external link
    color?: string // String The color associated with the external link
    icon?: string // String The icon image url of the site. Not available for all links. Transparent PNG 64x64
    isDisabled?: boolean // Boolean Whether the link is disabled
}

export class Subtitles {
    @Prop()
    language: string

    @Prop()
    path: string
}
export enum TorrentProvider {
    NyaaSi = 'NyaaSi',
}
export class EnrichedTorrentItem implements Partial<si.Torrent> {
    constructor(torrent: Partial<si.Torrent>) {
        Object.assign(this, torrent)
    }
    date: string;
    quality: string;
    codecs: string[];
    torrent: string;
    magnet: string;
    name: string;
    id: string;
    provide?: TorrentProvider
}
export class EpisodeItem {
    @Prop({ default: [] })
    subtitles: Subtitles[]

    @Prop()
    quality: string

    @Prop()
    codecs: string[];

    @Prop({ default: '' })
    url: string

    @Prop()
    torrent: EnrichedTorrentItem

}

export class Episode {
    @Prop({ default: 0 })
    episode?: number

    @Prop()
    downloads?: EpisodeItem[]
}


export enum ProviderName {
    AniList = "ANILIST"
}

class Provider {
    @Prop()
    media_id: number

    @Prop()
    name: ProviderName

    @Prop()
    siteUrl?: string // String	The url for the media page on the AniList website
}

export class Studio {
    constructor(name: string) {
        this.name = name
    }
    name: string
}

export class Airing {
    airingAt: Date | null // Int!	The time the episode airs at
    timeUntilAiring: number //	Int!	Seconds until episode starts airing
    episode: number //	Int!	The airing episode number
}


export class Trends {
    constructor(trend: any) {
        Object.assign(this, trend)
    }
    date: number           // Int!     The day the data was recorded (timestamp)
    trending: number       // Int!     The amount of media activity on the day
    averageScore: number  // Int      A weighted average score of all the user's scores of the media
    popularity: number    // Int      The number of users with the media on their list
    inProgress: number    // Int      The number of users with watching/reading the media
    releasing: boolean     // Boolean! If the media was being released at this time
    episode: number      // Int      The episode number of the anime released on this day
}

@Schema({})
export class Media {

    @Prop({ type: MediaTitle })
    title: MediaTitle;

    @Prop({ unique: true })
    slug: string

    @Prop()
    coverImage: MediaCoverImage // MediaCoverImage	The cover images of the media

    @Prop()
    provider: Provider

    @Prop()
    description: string;

    // optional proprties
    @Prop()
    genres?: string[];

    @Prop()
    media_type?: MediaType;

    @Prop()
    duration?: number

    @Prop()
    media_format?: MediaFormat;

    @Prop({ default: false })
    has_published?: boolean;

    @Prop()
    episodes?: Episode[];

    total_episodes?: number
    @Prop()
    idMal?: number //The mal id of the media

    @Prop()
    status?: MediaStatus

    @Prop()
    startDate?: Date

    @Prop()
    endDate?: Date

    @Prop()
    season?: MediaSeason // MediaSeason	The season the media was initially released in

    @Prop()
    seasonYear?: number // Int	The season year the media was initially released in

    @Prop()
    chapters?: number // Int	The amount of chapters the manga has when complete

    @Prop()
    volumes?: number // Int	The amount of volumes the manga has when complete

    @Prop()
    countryOfOrigin?: string // CountryCode	Where the media was created. (ISO 3166-1 alpha-2)

    @Prop()
    source?: MediaSource // MediaSource	Source type the media was adapted from.

    @Prop()
    trailer?: MediaTrailer // MediaTrailer	Media trailer or advertisement

    @Prop()
    updatedAt?: number

    @Prop()
    bannerImage?: string // String	The banner image of the media

    @Prop()
    synonyms?: string[] // [String]	Alternative titles of the media

    /**
     * 
     *  The key distinction is that meanScore represents a simple arithmetic mean where each score 
     *  is treated equally, whereas averageScore is a weighted average that factors in different 
     *  weights for each score.
     *  This means that while meanScore is calculated by summing all the scores and dividing by
     *  the number of scores, averageScore applies a weighting mechanism—possibly based on
     *  factors like recency, relevance, or user engagement—to provide a more nuanced metric.
     *  This approach can drive more sophisticated insights and analytics in our data architecture.
     */

    @Prop()
    averageScore?: number // Int	A weighted average score of all the user's scores of the media

    @Prop()
    meanScore?: number // Int	Mean score of all the user's scores of the media

    @Prop()
    popularity?: number // Int	The number of users with the media on their list

    @Prop()
    trending?: number // Int	The amount of related activity in the past hour

    @Prop()
    tags?: MediaTag[] // [MediaTag]	List of tags that describes elements and themes of the media

    @Prop({ type: [{ type: Types.ObjectId, ref: Media.name }], default: [] })
    relateds?: Types.ObjectId[]

    @Prop()
    studios?: Studio[]  // StudioConnection	The companies who produced the media

    @Prop()
    isAdult?: boolean

    @Prop()
    nextAiringEpisode?: Airing // AiringSchedule	The media's next episode airing schedule

    @Prop()
    airingSchedule?: Airing // AiringScheduleConnection	The media's entire airing schedule

    @Prop()
    trends?: Trends[] // MediaTrendConnection	The media's daily trend stats

    @Prop()
    externalLinks?: ExternalLinks[] // [MediaExternalLink]	External links to another site related to the media

    @Prop()
    rankings?: MediaRank[] // [MediaRank]	The ranking of the media in a particular time span and format compared to other media

    @Prop({ type: [{ type: Types.ObjectId, ref: Media.name }], default: [] })
    recommendations?: Types.ObjectId[]

    @Prop()
    stats?: MediaStats
}



export const MediaSchema = SchemaFactory.createForClass(Media);