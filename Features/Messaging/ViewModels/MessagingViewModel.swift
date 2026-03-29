import Foundation

@MainActor
final class MessagingViewModel: ObservableObject {

    @Published var messages: [Message] = []
    @Published var draft = ""

    private let matchId: String
    private let currentUserId: String

    init(matchId: String, currentUserId: String = "") {
        self.matchId = matchId
        self.currentUserId = currentUserId
    }

    func startListening() async {
        // Attach a Firestore real-time listener for this match's message collection.
    }

    func send() {
        let text = draft.trimmingCharacters(in: .whitespaces)
        guard !text.isEmpty else { return }
        draft = ""
        // Write message to Firestore.
    }

    func isCurrentUser(_ message: Message) -> Bool {
        message.senderId == currentUserId
    }
}
