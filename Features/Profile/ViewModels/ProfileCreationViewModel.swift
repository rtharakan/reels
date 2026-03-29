import Foundation

@MainActor
final class ProfileCreationViewModel: ObservableObject {

    @Published var name = ""
    @Published var age = 25
    @Published var letterboxdUsername = ""
    @Published var prompts: [User.Prompt] = [
        User.Prompt(question: "A film that changed how I see the world:", answer: ""),
        User.Prompt(question: "My comfort film is:", answer: ""),
        User.Prompt(question: "Unpopular opinion:", answer: "")
    ]

    var isValid: Bool {
        !name.trimmingCharacters(in: .whitespaces).isEmpty &&
        !letterboxdUsername.trimmingCharacters(in: .whitespaces).isEmpty &&
        age >= 18
    }

    func submit() {
        // Persist profile to Firestore.
        // Trigger Letterboxd watchlist sync after profile creation.
    }
}
