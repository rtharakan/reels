import Foundation

// MARK: - User

struct UserProfile: Codable, Identifiable {
    let id: String
    let name: String
    let age: Int
    let location: String
    let bio: String?
    let intent: Intent
    let profilePhotos: [String]
    let prompts: [Prompt]
    let topFilms: [FilmPreview]
    let watchlistCount: Int
    let letterboxdUsername: String?
}

struct PublicProfile: Codable, Identifiable {
    let id: String
    let name: String
    let age: Int
    let location: String
    let bio: String?
    let intent: Intent
    let profilePhotos: [String]
    let prompts: [Prompt]
    let topFilms: [FilmPreview]
}

struct Prompt: Codable {
    let question: String
    let answer: String
}

enum Intent: String, Codable, CaseIterable {
    case friends = "FRIENDS"
    case dating = "DATING"
    case both = "BOTH"

    var displayName: String {
        switch self {
        case .friends: return "Friends"
        case .dating: return "Dating"
        case .both: return "Both"
        }
    }
}

// MARK: - Film

struct FilmPreview: Codable, Identifiable {
    let id: String
    let tmdbId: Int?
    let title: String
    let year: Int?
    let posterUrl: String?
    let genreIds: [Int]
}

// MARK: - Discover

struct DiscoverFeed: Codable {
    let cards: [DiscoverCard]
    let remainingToday: Int
    let isAllCaughtUp: Bool
}

struct DiscoverCard: Codable, Identifiable {
    let userId: String
    let name: String
    let age: Int
    let location: String
    let bio: String?
    let intent: Intent
    let profilePhotos: [String]
    let prompts: [Prompt]
    let topFilms: [FilmPreview]
    let sharedFilms: [FilmPreview]
    let sharedFilmCount: Int
    let matchScore: Double

    var id: String { userId }
}

struct InterestResult: Codable {
    let recorded: Bool
    let isMatch: Bool
    let matchId: String?
}

// MARK: - Match

struct MatchListItem: Codable, Identifiable {
    let matchId: String
    let otherUser: MatchUserPreview
    let sharedFilmCount: Int
    let score: Double
    let createdAt: String

    var id: String { matchId }
}

struct MatchUserPreview: Codable {
    let id: String
    let name: String
    let profilePhotos: [String]
}

struct MatchDetail: Codable {
    let matchId: String
    let otherUser: PublicProfile
    let score: Double
    let sharedFilms: [FilmPreview]
    let genreOverlap: [GenreOverlap]
}

struct GenreOverlap: Codable {
    let genreName: String
    let count: Int
}

// MARK: - Safety

struct BlockedUser: Codable, Identifiable {
    let id: String
    let name: String
    let blockedAt: String
}

// MARK: - Buddy

struct BuddyCreator: Codable {
    let id: String
    let name: String
    let image: String?
}

struct BuddyInterestEntry: Codable {
    let userId: String
}

struct BuddyRequest: Codable, Identifiable {
    let id: String
    let filmTitle: String
    let filmYear: Int?
    let posterUrl: String?
    let cinemaName: String
    let city: String
    let date: String
    let time: String
    let ticketUrl: String?
    let maxBuddies: Int
    let status: String
    let createdAt: String
    let creator: BuddyCreator
    let interests: [BuddyInterestEntry]

    var spotsLeft: Int { max(0, maxBuddies - interests.count) }
    var isFull: Bool { interests.count >= maxBuddies }
}

struct BuddyRequestsResponse: Codable {
    let requests: [BuddyRequest]
}

struct BuddyShowOption: Codable {
    let cinema: String
    let time: String
    let ticketUrl: String?
}

struct BuddyFilmOption: Codable {
    let title: String
    let year: Int?
    let posterUrl: String?
    let shows: [BuddyShowOption]
}

struct BuddyScreeningsResponse: Codable {
    let films: [BuddyFilmOption]
    let cinemas: [String]
    let date: String
    let city: String
    let availableDates: [String]
}

struct BuddyMessageSender: Codable {
    let id: String
    let name: String
    let image: String?
}

struct BuddyMessage: Codable, Identifiable {
    let id: String
    let content: String
    let createdAt: String
    let sender: BuddyMessageSender
}

struct BuddyMessagesResponse: Codable {
    let messages: [BuddyMessage]
}

enum ReportReason: String, Codable, CaseIterable {
    case spam = "SPAM"
    case harassment = "HARASSMENT"
    case inappropriateContent = "INAPPROPRIATE_CONTENT"
    case fakeProfile = "FAKE_PROFILE"
    case other = "OTHER"

    var displayName: String {
        switch self {
        case .spam: return "Spam"
        case .harassment: return "Harassment"
        case .inappropriateContent: return "Inappropriate Content"
        case .fakeProfile: return "Fake Profile"
        case .other: return "Other"
        }
    }
}

// MARK: - Import

struct ImportResult: Codable {
    let imported: Int
    let resolved: Int
    let failed: Int
}

// MARK: - Onboarding

struct OnboardingInput: Codable {
    let name: String
    let age: Int
    let location: String
    let bio: String
    let intent: String
    let prompts: [Prompt]
    let letterboxdUsername: String?
    let topFilmIds: [String]
    let privacyPolicyConsented: Bool
}
