import { MediaType } from "express"
import { Media } from "./media"
import { PageInfo } from "./page"

export enum ReviewRating {
    NO_VOTE = "NO_VOTE", // No vote given
    UP_VOTE = "UP_VOTE", // The review is rated up
    DOWN_VOTE = "DOWN_VOTE" // The review is rated down
}

export class Review {
    id: number // Int! The id of the review
    userId: number // Int! The id of the review's creator
    mediaId: number // Int! The id of the review's media
    mediaType?: MediaType // MediaType For which type of media the review is for
    summary?: string // String A short summary of the review
    body?: string // String The main review body text
    asHtml?: boolean // Boolean Return the string in pre-parsed html instead of markdown
    rating?: number // Int The total user rating of the review
    ratingAmount?: number // Int The amount of user ratings of the review
    userRating?: ReviewRating // ReviewRating The rating of the review by the currently authenticated user
    score?: number // Int The review score of the media
    private?: boolean // Boolean If the review is not yet publicly published and is only viewable by creator
    siteUrl?: string // String The url for the review page on the AniList website
    createdAt: number // Int! The time of the thread creation
    updatedAt: number // Int! The time of the thread last update
    // user?: User // User The creator of the review
    media?: Media // Media The media the review is of
}

export class ReviewEdge {
    node?: Review // Review The review node in the connection
}

export class ReviewConnection {
    edges?: ReviewEdge[] // [ReviewEdge] The edges of the review connection
    nodes?: Review[] // [Review] The list of reviews
    pageInfo?: PageInfo // PageInfo The pagination information
}
