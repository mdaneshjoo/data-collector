import { Media } from "./media"
import { PageInfo } from "./page"

export class MediaTrend {
    mediaId: number         // Int!     The id of the tag
    date: number           // Int!     The day the data was recorded (timestamp)
    trending: number       // Int!     The amount of media activity on the day
    averageScore?: number  // Int      A weighted average score of all the user's scores of the media
    popularity?: number    // Int      The number of users with the media on their list
    inProgress?: number    // Int      The number of users with watching/reading the media
    releasing: boolean     // Boolean! If the media was being released at this time
    episode?: number      // Int      The episode number of the anime released on this day
    media?: Media         // Media    The related media
}

export class MediaTrendEdge {
    node: MediaTrend    // MediaTrend  The connected media trend node
}

export class MediaTrendConnection {
    edges?: MediaTrendEdge[]   // [MediaTrendEdge]  List of media trend edges
    nodes?: MediaTrend[]       // [MediaTrend]      List of media trend nodes
    pageInfo: PageInfo         // PageInfo          The pagination information
}