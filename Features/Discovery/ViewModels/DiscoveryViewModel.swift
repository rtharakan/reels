import Foundation

@MainActor
final class DiscoveryViewModel: ObservableObject {

    @Published var profiles: [User] = []

    private let engine = MatchingEngine()

    func loadProfiles() async {
        // Fetch candidate profiles from Firestore ranked by compatibility score.
        // Placeholder: profiles populated from backend.
    }

    func handleSwipe(profile: User, direction: SwipeDirection) {
        profiles.removeAll { $0.id == profile.id }
        switch direction {
        case .right:
            recordLike(for: profile)
        case .left:
            break
        }
    }

    // MARK: - Private

    private func recordLike(for profile: User) {
        // Write like to Firestore; check for mutual match via Cloud Function.
    }
}
