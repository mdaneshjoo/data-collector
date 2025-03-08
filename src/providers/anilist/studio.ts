import { MediaConnection } from "./media"
import { PageInfo } from "./page"

export class Studio {
    id: number                    // Int!            The id of the studio
    name: string                  // String!         The name of the studio
    isAnimationStudio: boolean    // Boolean!        If the studio is an animation studio or a different kind of company
    media?: MediaConnection       // MediaConnection The media the studio has worked on
    siteUrl?: string             // String          The url for the studio page on the AniList website
    isFavourite: boolean         // Boolean!        If the studio is marked as favourite by the currently authenticated user
    favourites?: number          // Int             The amount of user's who have favourited the studio
}

export class StudioEdge {
    node: Studio           // Studio   The connected studio node
    id?: number           // Int      The id of the connection
    isMain: boolean       // Boolean! If the studio is the main animation studio of the anime
    favouriteOrder?: number // Int    The order the character should be displayed from the users favourites
}

export class StudioConnection {
    edges?: StudioEdge[]    // [StudioEdge]  List of studio edges
    nodes?: Studio[]        // [Studio]      List of studio nodes
    pageInfo: PageInfo      // PageInfo      The pagination information
}