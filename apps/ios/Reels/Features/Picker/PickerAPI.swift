import Foundation

/// API calls for the Picker feature using the shared APIClient.
enum PickerAPI {
    static func searchFilms(query: String) async throws -> SearchFilmsResponse {
        struct Input: Encodable { let query: String }
        return try await APIClient.shared.query("picker.searchFilms", input: Input(query: query))
    }

    static func getShowtimes(filmTitle: String, city: String? = nil, cinema: String? = nil, date: String? = nil) async throws -> ShowtimesResponse {
        struct Input: Encodable {
            let filmTitle: String
            let city: String?
            let cinema: String?
            let date: String?
        }
        return try await APIClient.shared.query("picker.getShowtimes", input: Input(filmTitle: filmTitle, city: city, cinema: cinema, date: date))
    }

    static func createPlan(input: CreatePlanInput) async throws -> CreatePlanResponse {
        return try await APIClient.shared.mutate("picker.create", input: input)
    }

    static func getPlan(planId: String) async throws -> PickerPlanDetail {
        struct Input: Encodable { let planId: String }
        return try await APIClient.shared.query("picker.get", input: Input(planId: planId))
    }

    static func joinPlan(input: JoinPlanInput) async throws -> JoinPlanResponse {
        return try await APIClient.shared.mutate("picker.join", input: input)
    }

    static func vote(input: VoteInput) async throws -> VoteResponse {
        return try await APIClient.shared.mutate("picker.vote", input: input)
    }

    static func confirmPlan(input: ConfirmInput) async throws -> ConfirmResponse {
        return try await APIClient.shared.mutate("picker.confirm", input: input)
    }

    static func myPlans() async throws -> MyPlansResponse {
        return try await APIClient.shared.query("picker.myPlans")
    }
}
