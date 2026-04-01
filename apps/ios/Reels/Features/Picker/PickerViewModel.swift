import Foundation
import Combine

/// ViewModel for the Picker feature.
@MainActor
final class PickerViewModel: ObservableObject {
    @Published var plans: [PickerPlanSummary] = []
    @Published var currentPlan: PickerPlanDetail?
    @Published var filmSearchResults: [FilmSearchResult] = []
    @Published var showtimes: [PickerShowtime] = []
    @Published var isLoading = false
    @Published var error: String?
    @Published var shareUrl: String?
    @Published var createdPlanId: String?

    private var searchTask: Task<Void, Never>?

    // MARK: - Film Search (with 300ms debounce)

    func searchFilms(query: String) {
        searchTask?.cancel()
        guard !query.isEmpty else {
            filmSearchResults = []
            return
        }

        searchTask = Task {
            try? await Task.sleep(nanoseconds: 300_000_000)
            guard !Task.isCancelled else { return }

            do {
                let response = try await PickerAPI.searchFilms(query: query)
                filmSearchResults = response.results
            } catch {
                if !Task.isCancelled {
                    self.error = error.localizedDescription
                }
            }
        }
    }

    // MARK: - Showtimes

    func loadShowtimes(filmTitle: String, city: String? = nil, cinema: String? = nil, date: String? = nil) async {
        isLoading = true
        error = nil
        do {
            let response = try await PickerAPI.getShowtimes(filmTitle: filmTitle, city: city, cinema: cinema, date: date)
            showtimes = response.showtimes
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }

    // MARK: - Create Plan

    func createPlan(input: CreatePlanInput) async {
        isLoading = true
        error = nil
        do {
            let response = try await PickerAPI.createPlan(input: input)
            shareUrl = response.shareUrl
            createdPlanId = response.planId
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }

    // MARK: - Load Plan

    func loadPlan(planId: String) async {
        isLoading = true
        error = nil
        do {
            currentPlan = try await PickerAPI.getPlan(planId: planId)
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }

    // MARK: - Join Plan

    func joinPlan(planId: String, displayName: String, guestToken: String?) async -> JoinPlanResponse? {
        do {
            let response = try await PickerAPI.joinPlan(input: JoinPlanInput(planId: planId, displayName: displayName, guestSessionToken: guestToken))
            if let token = response.sessionToken {
                UserDefaults.standard.set(token, forKey: "picker-guest-\(planId)")
            }
            await loadPlan(planId: planId)
            return response
        } catch {
            self.error = error.localizedDescription
            return nil
        }
    }

    // MARK: - Vote

    func vote(participantId: String, showtimeId: String, status: String) async {
        do {
            let input = VoteInput(participantId: participantId, votes: [.init(showtimeId: showtimeId, status: status)])
            _ = try await PickerAPI.vote(input: input)
        } catch {
            self.error = error.localizedDescription
        }
    }

    // MARK: - Confirm

    func confirmShowtime(planId: String, showtimeId: String) async {
        isLoading = true
        do {
            _ = try await PickerAPI.confirmPlan(input: ConfirmInput(planId: planId, showtimeId: showtimeId))
            await loadPlan(planId: planId)
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }

    // MARK: - My Plans

    func loadMyPlans() async {
        do {
            let response = try await PickerAPI.myPlans()
            plans = response.plans
        } catch {
            self.error = error.localizedDescription
        }
    }
}
