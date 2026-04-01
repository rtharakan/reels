import Foundation

/// ViewModel for the Mood Reels feature.
@MainActor
final class MoodViewModel: ObservableObject {
    @Published var selectedMood: MoodType?
    @Published var suggestions: [MoodSuggestion] = []
    @Published var moodTwins: [MoodTwin] = []
    @Published var history: [MoodHistoryEntry] = []
    @Published var isLoading = false
    @Published var error: String?

    // MARK: - Set Mood (with 3s timeout)

    func setMood(_ mood: MoodType) async {
        selectedMood = mood
        isLoading = true
        error = nil

        do {
            let result = try await withThrowingTaskGroup(of: SetMoodResponse.self) { group in
                group.addTask {
                    try await MoodAPI.setMood(mood)
                }
                group.addTask {
                    try await Task.sleep(nanoseconds: 3_000_000_000)
                    throw CancellationError()
                }
                let first = try await group.next()!
                group.cancelAll()
                return first
            }
            suggestions = result.suggestions
            moodTwins = result.moodTwins
        } catch {
            // Timeout fallback — try to get community suggestions
            do {
                let fallback = try await MoodAPI.getSuggestions()
                suggestions = fallback.suggestions
                moodTwins = fallback.moodTwins
            } catch {
                self.error = error.localizedDescription
            }
        }
        isLoading = false
    }

    // MARK: - Load Existing Suggestions

    func loadSuggestions() async {
        do {
            let response = try await MoodAPI.getSuggestions()
            suggestions = response.suggestions
            moodTwins = response.moodTwins
        } catch {
            // Silently fail — user may not have active mood
        }
    }

    // MARK: - Load History

    func loadHistory() async {
        do {
            let response = try await MoodAPI.getHistory()
            history = response.history
            if let current = response.currentMood {
                selectedMood = MoodType(rawValue: current)
            }
        } catch {
            self.error = error.localizedDescription
        }
    }

    // MARK: - Connect (Express Interest)

    func connect(userId: String) async -> Bool {
        do {
            let response = try await MoodAPI.expressInterest(targetUserId: userId)
            return response.isMatch
        } catch {
            self.error = error.localizedDescription
            return false
        }
    }
}
