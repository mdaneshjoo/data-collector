import { Media } from "./media"
import { PageInfo } from "./page"

export enum RecommendationRating {
    NO_RATING = "NO_RATING", // No rating given
    RATE_UP = "RATE_UP", // The recommendation is rated up
    RATE_DOWN = "RATE_DOWN" // The recommendation is rated down
}

export class Recommendation {
    id: number // Int! The id of the recommendation
    rating?: number // Int The user's rating of the recommendation
    userRating?: RecommendationRating // RecommendationRating The rating of the recommendation by the currently authenticated user
    media?: Media // Media The media the recommendation is from
    mediaRecommendation?: Media // Media The recommended media
    // user?: User // User The user that first created the recommendation
}

export class RecommendationEdge {
    node?: Recommendation // Recommendation The recommendation node in the connection
}

export class RecommendationConnection {
    edges?: RecommendationEdge[] // [RecommendationEdge] The edges of the recommendation connection
    nodes?: Recommendation[] // [Recommendation] The list of recommendations
    pageInfo?: PageInfo // PageInfo The pagination information
}