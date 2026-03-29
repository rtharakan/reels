import Foundation

@MainActor
final class MatchViewModel: ObservableObject {

    @Published var matches: [Match] = []

    func loadMatches() async {
        // Fetch matches for the current user from Firestore.
    }
}
