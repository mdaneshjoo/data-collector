import { AiringSchedule } from "./airing-schedule"
import { Character } from "./character"
import { Media } from "./media"
import { MediaTrend } from "./media-trend"
import { Recommendation } from "./recommendation"
import { Staff } from "./staff"
import { Studio } from "./studio"

export class Page {
    pageInfo: PageInfo                  // PageInfo    The pagination information
    // users?: User[]                      // [User]      List of users
    media?: Media[]                     // [Media]     List of media
    characters?: Character[]            // [Character] List of characters
    staff?: Staff[]                     // [Staff]     List of staff
    studios?: Studio[]                  // [Studio]    List of studios
    mediaList?: MediaList[]            // [MediaList] List of media lists
    airingSchedules?: AiringSchedule[]  // [AiringSchedule] List of airing schedules
    mediaTrends?: MediaTrend[]         // [MediaTrend] List of media trends
    // notifications?: NotificationUnion[] // [NotificationUnion] List of notifications
    // followers?: User[]                  // [User]      List of followers
    // following?: User[]                  // [User]      List of following users
    // activities?: ActivityUnion[]        // [ActivityUnion] List of activities
    // activityReplies?: ActivityReply[]  // [ActivityReply] List of activity replies
    // threads?: Thread[]                  // [Thread]    List of threads
    // threadComments?: ThreadComment[]    // [ThreadComment] List of thread comments
    // reviews?: Review[]                  // [Review]    List of reviews
    recommendations?: Recommendation[]  // [Recommendation] List of recommendations
    // likes?: User[]                      // [User]      List of users who liked
}

export class PageInfo {
    total: number        // Int     The total number of items. Note: This value is not guaranteed to be accurate, do not rely on this for logic
    perPage: number      // Int     The count on a page
    currentPage: number  // Int     The current page
    lastPage: number     // Int     The last page
    hasNextPage: boolean // Boolean If there is another page
}