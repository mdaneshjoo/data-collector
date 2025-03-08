import { Media, MediaConnection } from "./media"
import { PageInfo } from "./page"
import { Staff, StaffRoleType } from "./staff"

export class CharacterConnection {
    edges?: CharacterEdge[]  // [CharacterEdge] List of character edges
    nodes?: Character[]      // [Character]     List of character nodes
    pageInfo: PageInfo       // PageInfo        The pagination information
}

export class CharacterEdge {
    node: Character               // Character      The connected character node
    id?: number                  // Int            The id of the connection
    role?: CharacterRole         // CharacterRole  The characters role in the media
    name?: string               // String         Media specific character name
    voiceActors?: Staff[]       // [Staff]        The voice actors of the character
    voiceActorRoles?: StaffRoleType[] // [StaffRoleType] The voice actors of the character with role date
    media?: Media[]             // [Media]        The media the character is in
    favouriteOrder?: number     // Int            The order the character should be displayed from the users favourites
}

export enum CharacterRole {
    MAIN = "MAIN", // A primary character role in the media
    SUPPORTING = "SUPPORTING", // A supporting character role in the media
    BACKGROUND = "BACKGROUND" // A background character in the media
}


export class Character {
    id: number                    // Int!           The id of the character
    name: CharacterName           // CharacterName  The names of the character
    image?: CharacterImage        // CharacterImage Character images
    description?: string          // String         A general description of the character
    gender?: string              // String         The character's gender. Usually Male, Female, or Non-binary but can be any string.
    dateOfBirth?: number      // FuzzyDate      The character's birth date
    age?: string                 // String         The character's age. Note this is a string, not an int, it may contain further text and additional ages.
    bloodType?: string           // String         The characters blood type
    isFavourite: boolean         // Boolean!       If the character is marked as favourite by the currently authenticated user
    isFavouriteBlocked: boolean  // Boolean!       If the character is blocked from being added to favourites
    siteUrl?: string            // String         The url for the character page on the AniList website
    media?: MediaConnection      // MediaConnection Media that includes the character
    favourites?: number         // Int            The amount of user's who have favourited the character
    modNotes?: string           // String         Notes for site moderators
}

export class CharacterName {
    first?: string // String The character's given name
    middle?: string // String The character's middle name
    last?: string // String The character's surname
    full?: string // String The character's first and last name
    native?: string // String The character's full name in their native language
    alternative?: string[] // [String] Other names the character might be referred to as
    alternativeSpoiler?: string[] // [String] Other names the character might be referred to as but are spoilers
    userPreferred?: string // String The currently authenticated user's preferred name language. Default romaji for non-authenticated
}
export class CharacterImage {
    large?: string // String The character's image of media at its largest size
    medium?: string // String The character's image of media at medium size
}
