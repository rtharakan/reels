import Foundation

// MARK: - Picker Models

struct PickerPlanSummary: Codable, Identifiable {
    let id: String
    let filmTitle: String
    let filmPosterPath: String?
    let status: String
    let participantCount: Int
    let createdAt: String
}

struct PickerPlanDetail: Codable {
    let id: String
    let filmTitle: String
    let filmTmdbId: Int?
    let filmPosterPath: String?
    let filmYear: Int?
    let pathway: String
    let status: String
    let organizer: Organizer
    let showtimes: [PickerShowtime]
    let participants: [PickerParticipantInfo]
    let confirmedShowtime: PickerShowtime?
    let expiresAt: String
    let createdAt: String
    let currentParticipantId: String?

    struct Organizer: Codable {
        let id: String
        let name: String
    }
}

struct PickerShowtime: Codable, Identifiable {
    let id: String
    let cinemaName: String
    let cinemaCity: String
    let date: String
    let time: String
    let ticketUrl: String?
    let voteCount: VoteCount?

    struct VoteCount: Codable {
        let available: Int
        let unavailable: Int
        let maybe: Int
    }
}

struct PickerParticipantInfo: Codable, Identifiable {
    let id: String
    let displayName: String
    let isOrganizer: Bool
}

struct FilmSearchResult: Codable, Identifiable {
    let tmdbId: Int
    let title: String
    let year: Int?
    let posterPath: String?
    let overview: String?

    var id: Int { tmdbId }
}

struct CreatePlanInput: Encodable {
    let filmTitle: String
    let filmTmdbId: Int?
    let filmPosterPath: String?
    let filmYear: Int?
    let pathway: String
    let city: String?
    let cinema: String?
    let targetDate: String?
    let showtimes: [ShowtimeInput]

    struct ShowtimeInput: Encodable {
        let cinemaName: String
        let cinemaCity: String
        let date: String
        let time: String
        let ticketUrl: String?
        let isManualEntry: Bool
    }
}

struct CreatePlanResponse: Codable {
    let planId: String
    let shareUrl: String
    let expiresAt: String
}

struct JoinPlanInput: Encodable {
    let planId: String
    let displayName: String
    let guestSessionToken: String?
}

struct JoinPlanResponse: Codable {
    let participantId: String
    let sessionToken: String?
}

struct VoteInput: Encodable {
    let participantId: String
    let votes: [VoteEntry]

    struct VoteEntry: Encodable {
        let showtimeId: String
        let status: String
    }
}

struct VoteResponse: Codable {
    let success: Bool
    let updatedCount: Int
}

struct ConfirmInput: Encodable {
    let planId: String
    let showtimeId: String
}

struct ConfirmResponse: Codable {
    let success: Bool
    let confirmedShowtime: PickerShowtime
}

struct MyPlansResponse: Codable {
    let plans: [PickerPlanSummary]
}

struct SearchFilmsResponse: Codable {
    let results: [FilmSearchResult]
}

struct ShowtimesResponse: Codable {
    let showtimes: [PickerShowtime]
    let source: String
}
