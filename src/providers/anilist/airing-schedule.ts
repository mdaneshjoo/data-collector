import { Media } from "./media"
import { PageInfo } from "./page"

export class AiringProgression {
    episode: number // Float The episode the stats were recorded at. .5 is the midpoint between 2 episodes airing dates.
    score: number // Float The average score for the media
    watching: number // Int The amount of users watching the anime
}


export class AiringSchedule {
    id: number // Int!	The id of the airing schedule item
    airingAt: number // Int!	The time the episode airs at
    timeUntilAiring: number //	Int!	Seconds until episode starts airing
    episode: number //	Int!	The airing episode number
    mediaId: number//	Int!	The associate media id of the airing episode
    media: Media//	Media	The associate media of the airing episode
}

export class AiringScheduleEdge {
    node: AiringSchedule    // AiringSchedule  The connected airing schedule node
    id?: number            // Int             The id of the connection
}

export class AiringScheduleConnection {
    edges?: AiringScheduleEdge[]  // [AiringScheduleEdge]  List of airing schedule edges
    nodes?: AiringSchedule[]      // [AiringSchedule]      List of airing schedule nodes
    pageInfo: PageInfo            // PageInfo              The pagination information
}