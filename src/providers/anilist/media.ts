import { AiringProgression, AiringSchedule, AiringScheduleConnection } from "./airing-schedule"
import { Character, CharacterConnection, CharacterRole } from "./character"
import { MediaListStatus } from "./media-list"
import { MediaTrendConnection } from "./media-trend"
import { PageInfo } from "./page"
import { RecommendationConnection } from "./recommendation"
import { ReviewConnection } from "./review"
import { Staff, StaffConnection, StaffRoleType } from "./staff"
import { StudioConnection } from "./studio"

export type FuzzyDate = {
    year: number,
    month: number,
    day: number
}

export class Media {
    id: number  // Int!	The id of the media
    idMal?: number // Int	The mal id of the media
    title: MediaTitle // MediaTitle	The official titles of the media in various languages
    type: MediaType // MediaType	The type of the media; anime or manga
    format: MediaFormat // MediaFormat	The format the media was released in 
    status: MediaStatus // MediaStatus	The current releasing status of the media
    description?: string // String	Short description of the media's story and characters
    startDate: FuzzyDate // FuzzyDate	The first official release date of the media
    endDate: FuzzyDate // FuzzyDate	The last official release date of the media
    season: MediaSeason // MediaSeason	The season the media was initially released in
    seasonYear?: number // Int	The season year the media was initially released in
    seasonInt?: number // Int	The year & season the media was initially released in
    episodes?: number // Int	The amount of episodes the anime has when complete
    duration?: number // Int	The general length of each anime episode in minutes
    chapters?: number // Int	The amount of chapters the manga has when complete
    volumes?: number // Int	The amount of volumes the manga has when complete
    countryOfOrigin: string // CountryCode	Where the media was created. (ISO 3166-1 alpha-2)
    isLicensed?: boolean // Boolean	If the media is officially licensed or a self-published doujin release
    source: MediaSource // MediaSource	Source type the media was adapted from.
    hashtag?: string // String	Official Twitter hashtags for the media
    trailer?: MediaTrailer // MediaTrailer	Media trailer or advertisement
    updatedAt: number // Int	When the media's data was last updated
    coverImage: MediaCoverImage // MediaCoverImage	The cover images of the media
    bannerImage?: string // String	The banner image of the media
    genres: string[] // [String]	The genres of the media
    synonyms: string[] // [String]	Alternative titles of the media
    averageScore?: number // Int	A weighted average score of all the user's scores of the media
    meanScore?: number // Int	Mean score of all the user's scores of the media
    popularity?: number // Int	The number of users with the media on their list
    isLocked?: boolean // Boolean	Locked media may not be added to lists our favorited. This may be due to the entry pending for deletion or other reasons.
    trending?: number // Int	The amount of related activity in the past hour
    favourites?: number // Int	The amount of user's who have favourited the media
    tags: MediaTag[] // [MediaTag]	List of tags that describes elements and themes of the media
    relations: MediaConnection // MediaConnection	Other media in the same or connecting franchise
    characters: CharacterConnection // CharacterConnection	The characters in the media
    staff: StaffConnection // StaffConnection	The staff who produced the media
    studios: StudioConnection  // StudioConnection	The companies who produced the media
    isFavourite: boolean // Boolean!	If the media is marked as favourite by the current authenticated user
    isFavouriteBlocked: boolean // Boolean!	If the media is blocked from being added to favourites
    isAdult?: boolean // Boolean	If the media is intended only for 18+ adult audiences
    nextAiringEpisode?: AiringSchedule // AiringSchedule	The media's next episode airing schedule
    airingSchedule: AiringScheduleConnection // AiringScheduleConnection	The media's entire airing schedule
    trends: MediaTrendConnection // MediaTrendConnection	The media's daily trend stats
    externalLinks: MediaExternalLink[] // [MediaExternalLink]	External links to another site related to the media
    streamingEpisodes: MediaStreamingEpisode[] // [MediaStreamingEpisode]	Data and links to legal streaming episodes on external sites
    rankings: MediaRank[] // [MediaRank]	The ranking of the media in a particular time span and format compared to other media
    mediaListEntry?: MediaList // MediaList	The authenticated user's media list entry for the media
    reviews: ReviewConnection // ReviewConnection	User reviews of the media
    recommendations: RecommendationConnection // RecommendationConnection	User recommendations for similar media
    stats: MediaStats
    siteUrl?: string // String	The url for the media page on the AniList website
    autoCreateForumThread?: boolean // Boolean	If the media should have forum thread automatically created for it on airing episode release
    isRecommendationBlocked?: boolean // Boolean	If the media is blocked from being recommended to/from
    isReviewBlocked?: boolean // Boolean	If the media is blocked from being reviewed
    modNotes?: string // String	Notes for site moderators
}


export class MediaTitle {
    romaji: string         // String  The romanization of the native language title
    english?: string        // String  The official english title
    native: string         // String  Official title in it's native language
    userPreferred?: string  // String  The currently authenticated users preferred title language. Default romaji for non-authenticated
}

export enum MediaType {
    ANIME = 'ANIME',    // Japanese Anime
    MANGA = 'MANGA'     // Asian comic
}

export enum MediaFormat {
    TV = 'TV',                 // Anime broadcast on television
    TV_SHORT = 'TV_SHORT',     // Anime which are under 15 minutes in length and broadcast on television
    MOVIE = 'MOVIE',           // Anime movies with a theatrical release
    SPECIAL = 'SPECIAL',       // Special episodes that have been included in DVD/Blu-ray releases, picture dramas, pilots, etc
    OVA = 'OVA',              // (Original Video Animation) Anime that have been released directly on DVD/Blu-ray without originally going through a theatrical release or television broadcast
    ONA = 'ONA',              // (Original Net Animation) Anime that have been originally released online or are only available through streaming services
    MUSIC = 'MUSIC',          // Short anime released as a music video
    MANGA = 'MANGA',          // Professionally published manga with more than one chapter
    NOVEL = 'NOVEL',          // Written books released as a series of light novels
    ONE_SHOT = 'ONE_SHOT'     // Manga with just one chapter
}
export enum MediaStatus {
    FINISHED = 'FINISHED',                 // Has completed and is no longer being released
    RELEASING = 'RELEASING',               // Currently releasing
    NOT_YET_RELEASED = 'NOT_YET_RELEASED', // To be released at a later date
    CANCELLED = 'CANCELLED',               // Ended before the work could be finished
    HIATUS = 'HIATUS'                      // Version 2 only. Is currently paused from releasing and will resume at a later date
}
export enum MediaSeason {
    WINTER = 'WINTER',   // Months December to February
    SPRING = 'SPRING',   // Months March to May
    SUMMER = 'SUMMER',   // Months June to August
    FALL = 'FALL'       // Months September to November
}

export enum MediaSource {
    ORIGINAL = 'ORIGINAL',                     // An original production not based of another work
    MANGA = 'MANGA',                           // Asian comic book
    LIGHT_NOVEL = 'LIGHT_NOVEL',              // Written work published in volumes
    VISUAL_NOVEL = 'VISUAL_NOVEL',            // Video game driven primary by text and narrative
    VIDEO_GAME = 'VIDEO_GAME',                // Video game
    OTHER = 'OTHER',                          // Other
    NOVEL = 'NOVEL',                          // Version 2+ only. Written works not published in volumes
    DOUJINSHI = 'DOUJINSHI',                  // Version 2+ only. Self-published works
    ANIME = 'ANIME',                          // Version 2+ only. Japanese Anime
    WEB_NOVEL = 'WEB_NOVEL',                  // Version 3 only. Written works published online
    LIVE_ACTION = 'LIVE_ACTION',              // Version 3 only. Live action media such as movies or TV show
    GAME = 'GAME',                            // Version 3 only. Games excluding video games
    COMIC = 'COMIC',                          // Version 3 only. Comics excluding manga
    MULTIMEDIA_PROJECT = 'MULTIMEDIA_PROJECT', // Version 3 only. Multimedia project
    PICTURE_BOOK = 'PICTURE_BOOK'             // Version 3 only. Picture book
}

export class MediaCoverImage {
    extraLarge: string // String  The cover image url of the media at its largest size. If this size isn't available, large will be provided instead.
    large: string      // String  The cover image url of the media at a large size
    medium: string     // String  The cover image url of the media at medium size
    color?: string     // String  Average #hex color of cover image
}

export class MediaTag {
    id: number           // Int!     The id of the tag
    name: string         // String!  The name of the tag
    description?: string // String   A general description of the tag
    category?: string    // String   The categories of tags this tag belongs to
    rank?: number        // Int      The relevance ranking of the tag out of the 100 for this media
    isGeneralSpoiler?: boolean // Boolean  If the tag could be a spoiler for any media
    isMediaSpoiler?: boolean   // Boolean  If the tag is a spoiler for this media
    isAdult?: boolean    // Boolean  If the tag is only for adult 18+ media
    userId?: number      // Int      The user who submitted the tag
}

export class MediaTrailer {
    id: string        // String  The trailer video id
    site: string      // String  The site the video is hosted by (Currently either youtube or dailymotion)
    thumbnail: string // String  The url for the thumbnail image of the video
}


export enum MediaRelation {
    ADAPTATION = "ADAPTATION", // An adaption of this media into a different format
    PREQUEL = "PREQUEL", // Released before the relation
    SEQUEL = "SEQUEL", // Released after the relation
    PARENT = "PARENT", // The media a side story is from
    SIDE_STORY = "SIDE_STORY", // A side story of the parent media
    CHARACTER = "CHARACTER", // Shares at least 1 character
    SUMMARY = "SUMMARY", // A shortened and summarized version
    ALTERNATIVE = "ALTERNATIVE", // An alternative version of the same media
    SPIN_OFF = "SPIN_OFF", // An alternative version of the media with a different primary focus
    OTHER = "OTHER", // Other
    SOURCE = "SOURCE", // Version 2 only. The source material the media was adapted from
    COMPILATION = "COMPILATION", // Version 2 only
    CONTAINS = "CONTAINS" // Version 2 only
}

export class MediaConnection {
    edges?: MediaEdge[]  // [MediaEdge] List of media edges
    nodes?: Media[]      // [Media]     List of media nodes
    pageInfo: PageInfo   // PageInfo    The pagination information
}

export class MediaEdge {
    node: Media                    // Media          The connected media node
    id?: number                    // Int            The id of the connection
    relationType?: MediaRelation   // MediaRelation  The type of relation to the parent model
    isMainStudio: boolean          // Boolean!       If the studio is the main animation studio of the media
    characters?: Character[]       // [Character]    The characters in the media voiced by the parent actor
    characterRole?: CharacterRole  // CharacterRole  The characters role in the media
    characterName?: string         // String         Media specific character name
    roleNotes?: string            // String         Notes regarding the VA's role for the character
    dubGroup?: string             // String         Used for grouping roles where multiple dubs exist for the same language
    staffRole?: string            // String         The role of the staff member in the production of the media
    voiceActors?: Staff[]         // [Staff]        The voice actors of the character
    voiceActorRoles?: StaffRoleType[] // [StaffRoleType] The voice actors of the character with role date
    favouriteOrder?: number       // Int            The order the media should be displayed from the users favourites
}


export enum ExternalLinkType {
    INFO = "INFO", // General information link
    STREAMING = "STREAMING", // Link to a streaming platform
    SOCIAL = "SOCIAL", // Social media link
    PAGER = "PAGER" // Other related links or directories
}

export class MediaExternalLink {
    id: number // Int! The id of the external link
    url?: string // String The url of the external link or base url of link source
    site: string // String! The links website site name
    siteId?: number // Int The links website site id
    type?: ExternalLinkType // ExternalLinkType The type of the external link
    language?: string // String Language the site content is in. See Staff language field for values.
    color?: string // String The color associated with the external link
    icon?: string // String The icon image url of the site. Not available for all links. Transparent PNG 64x64
    notes?: string // String Additional notes about the external link
    isDisabled?: boolean // Boolean Whether the link is disabled
}

export class MediaStreamingEpisode {
    title?: string // String Title of the episode
    thumbnail?: string // String URL of episode image thumbnail
    url?: string // String The URL of the episode
    site?: string // String The site location of the streaming episodes
}
export enum MediaRankType {
    RATED = "RATED", // Ranking is based on the media's ratings/score
    POPULAR = "POPULAR" // Ranking is based on the media's popularity
}

export class MediaRank {
    id: number // Int! The id of the rank
    rank: number // Int! The numerical rank of the media
    type: MediaRankType // MediaRankType! The type of ranking
    format: MediaFormat // MediaFormat! The format the media is ranked within
    year?: number // Int The year the media is ranked within
    season?: MediaSeason // MediaSeason The season the media is ranked within
    allTime?: boolean // Boolean If the ranking is based on all time instead of a season/year
    context: string // String! String that gives context to the ranking type and time span
}

export class MediaStats {
    scoreDistribution?: ScoreDistribution[] // [ScoreDistribution] The distribution of scores for the media
    statusDistribution?: StatusDistribution[] // [StatusDistribution] The distribution of user statuses for the media
   
}

export class ScoreDistribution {
    score?: number // Int The score value
    amount?: number // Int The amount of list entries with this score
}


export class StatusDistribution {
    status?: MediaListStatus // MediaListStatus The watching/reading status of media or user's list
    amount?: number // Int The amount of entries with this status
}

