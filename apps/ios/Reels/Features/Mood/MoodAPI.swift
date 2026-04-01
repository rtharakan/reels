import Foundation

/// API calls for the Mood Reels feature using the shared APIClient.
enum MoodAPI {
    static func setMood(_ mood: MoodType) async throws -> SetMoodResponse {
        return try await APIClient.shared.mutate("mood.setMood", input: SetMoodInput(mood: mood.rawValue))
    }

    static func getSuggestions() async throws -> GetSuggestionsResponse {
        return try await APIClient.shared.query("mood.getSuggestions")
    }

    static func getHistory() async throws -> MoodHistoryResponse {
        return try await APIClient.shared.query("mood.getHistory")
    }

    static func tagFilm(filmId: String, mood: MoodType) async throws {
        struct Response: Codable { let success: Bool; let tagId: String }
        let _: Response = try await APIClient.shared.mutate("mood.tagFilm", input: TagFilmInput(filmId: filmId, mood: mood.rawValue))
    }

    static func expressInterest(targetUserId: String) async throws -> ExpressInterestResponse {
        return try await APIClient.shared.mutate("mood.expressInterest", input: ExpressInterestInput(targetUserId: targetUserId))
    }
}
