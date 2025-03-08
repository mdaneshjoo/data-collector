import { CharacterConnection } from "./character"
import { MediaConnection } from "./media"
import { PageInfo } from "./page"

export class StaffRoleType {
    voiceActor?: Staff // Staff The voice actors of the character
    roleNotes?: string // String Notes regarding the VA's role for the character
    dubGroup?: string // String Used for grouping roles where multiple dubs exist for the same language. Either dubbing company name or language variant
}

export class StaffImage {
    large?: string // String The person's image of media at its largest size
    medium?: string // String The person's image of media at medium size
}
export class StaffName {
    first?: string // String The person's given name
    middle?: string // String The person's middle name
    last?: string // String The person's surname
    full?: string // String The person's first and last name
    native?: string // String The person's full name in their native language
    alternative?: string[] // [String] Other names the staff member might be referred to as (pen names)
    userPreferred?: string // String The currently authenticated user's preferred name language. Default romaji for non-authenticated
}

export class Staff {
    id: number                         // Int!            The id of the staff member
    name: StaffName                    // StaffName       The names of the staff member
    languageV2?: string               // String          The primary language of the staff member
    image?: StaffImage                // StaffImage      The staff images
    description?: string              // String          A general description of the staff member
    primaryOccupations?: string[]     // [String]        The person's primary occupations
    gender?: string                   // String          The staff's gender. Usually Male, Female, or Non-binary but can be any string
    dateOfBirth?: number          // FuzzyDate       The person's birth date
    dateOfDeath?: number          // FuzzyDate       The person's death date
    age?: number                      // Int             The person's age in years
    yearsActive?: number[]           // [Int]           [startYear, endYear] (If the 2nd value is not present staff is still active)
    homeTown?: string                // String          The persons birthplace or hometown
    bloodType?: string               // String          The persons blood type
    isFavourite: boolean             // Boolean!        If the staff member is marked as favourite by the currently authenticated user
    isFavouriteBlocked: boolean      // Boolean!        If the staff member is blocked from being added to favourites
    siteUrl?: string                 // String          The url for the staff page on the AniList website
    staffMedia?: MediaConnection     // MediaConnection Media where the staff member has a production role
    characters?: CharacterConnection // CharacterConnection Characters voiced by the actor
    characterMedia?: MediaConnection // MediaConnection Media the actor voiced characters in
    staff?: Staff                    // Staff           Staff member that the submission is referencing
    // submitter?: User                 // User            Submitter for the submission
    submissionStatus?: number        // Int             Status of the submission
    submissionNotes?: string         // String          Inner details of submission status
    favourites?: number             // Int             The amount of user's who have favourited the staff member
    modNotes?: string               // String          Notes for site moderators
}

export class StaffEdge {
    node: Staff           // Staff    The connected staff node
    id?: number          // Int      The id of the connection
    role?: string        // String   The role of the staff member in the production of the media
    favouriteOrder?: number // Int   The order the staff should be displayed from the users favourites
}

export class StaffConnection {
    edges?: StaffEdge[]    // [StaffEdge]  List of staff edges
    nodes?: Staff[]        // [Staff]      List of staff nodes
    pageInfo: PageInfo     // PageInfo     The pagination information
}