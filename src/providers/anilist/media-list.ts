import { Media } from "./media"

export enum MediaListStatus {
    CURRENT = "CURRENT", // Currently watching/reading
    PLANNING = "PLANNING", // Planning to watch/read
    COMPLETED = "COMPLETED", // Finished watching/reading
    DROPPED = "DROPPED", // Stopped watching/reading before completing
    PAUSED = "PAUSED", // Paused watching/reading
    REPEATING = "REPEATING" // Re-watching/reading
}

export class MediaList {
    id: number // Int! The id of the list entry
    userId: number // Int! The id of the user owner of the list entry
    mediaId: number // Int! The id of the media
    status?: MediaListStatus // MediaListStatus The watching/reading status
    score?: number // Float The score of the entry
    format?: ScoreFormat // ScoreFormat Force the score to be returned in the provided format type.
    progress?: number // Int The amount of episodes/chapters consumed by the user
    progressVolumes?: number // Int The amount of volumes read by the user
    repeat?: number // Int The amount of times the user has rewatched/read the media
    priority?: number // Int Priority of planning
    private?: boolean // Boolean If the entry should only be visible to authenticated user
    notes?: string // String Text notes
    hiddenFromStatusLists?: boolean // Boolean If the entry should be hidden from non-custom lists
    customLists?: Record<string, boolean> // Json Map of booleans for which custom lists the entry is in
    asArray?: boolean // Boolean Change return structure to an array of objects
    advancedScores?: Record<string, number> // Json Map of advanced scores with name keys
    startedAt?: number // FuzzyDate When the entry was started by the user
    completedAt?: number // FuzzyDate When the entry was completed by the user
    updatedAt?: number // Int When the entry data was last updated
    createdAt?: number // Int When the entry data was created
    media?: Media // Media The associated media of the entry
    // user?: User // User The associated user of the entry
}

export enum ScoreFormat {
    POINT_100 = "POINT_100", // An integer from 0-100
    POINT_10_DECIMAL = "POINT_10_DECIMAL", // A float from 0-10 with 1 decimal place
    POINT_10 = "POINT_10", // An integer from 0-10
    POINT_5 = "POINT_5", // An integer from 0-5. Should be represented in Stars
    POINT_3 = "POINT_3" // An integer from 0-3. Should be represented in Smileys. 0 => No Score, 1 => :(, 2 => :|, 3 => :)
}
