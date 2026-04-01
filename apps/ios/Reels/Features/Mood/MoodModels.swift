import Foundation

// MARK: - Mood Models

enum MoodType: String, CaseIterable, Codable {
    case nostalgic = "NOSTALGIC"
    case adventurous = "ADVENTUROUS"
    case heartbroken = "HEARTBROKEN"
    case hype = "HYPE"
    case chill = "CHILL"
    case romantic = "ROMANTIC"
    case mysterious = "MYSTERIOUS"
    case inspired = "INSPIRED"
    case melancholic = "MELANCHOLIC"
    case cozy = "COZY"

    var emoji: String {
        switch self {
        case .nostalgic: return "📼"
        case .adventurous: return "🏔️"
        case .heartbroken: return "💔"
        case .hype: return "🔥"
        case .chill: return "🌊"
        case .romantic: return "💕"
        case .mysterious: return "🔮"
        case .inspired: return "✨"
        case .melancholic: return "🌧️"
        case .cozy: return "☕"
        }
    }

    var localizedKey: String {
        return "mood.\(rawValue.lowercased())"
    }
}

struct MoodSuggestion: Codable, Identifiable {
    let id: String
    let filmId: String
    let filmTitle: String
    let filmYear: Int?
    let filmPosterPath: String?
    let mood: String
    let matchExplanation: String
    let matchStrength: Double
    let source: String
}

struct MoodTwin: Codable, Identifiable {
    let userId: String
    let displayName: String?
    let image: String?
    let sharedFilmCount: Int
    let mood: String

    var id: String { userId }
}

struct SetMoodInput: Encodable {
    let mood: String
}

struct SetMoodResponse: Codable {
    let moodId: String
    let suggestions: [MoodSuggestion]
    let moodTwins: [MoodTwin]
}

struct GetSuggestionsResponse: Codable {
    let suggestions: [MoodSuggestion]
    let moodTwins: [MoodTwin]
}

struct MoodHistoryEntry: Codable, Identifiable {
    let id: String
    let mood: String
    let isActive: Bool
    let selectedAt: String
}

struct MoodHistoryResponse: Codable {
    let history: [MoodHistoryEntry]
    let currentMood: String?
}

struct TagFilmInput: Encodable {
    let filmId: String
    let mood: String
}

struct ExpressInterestInput: Encodable {
    let targetUserId: String
}

struct ExpressInterestResponse: Codable {
    let success: Bool
    let isMatch: Bool
}
