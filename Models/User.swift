import Foundation

/// A Reel user profile.
struct User: Identifiable, Codable {
    let id: String
    var name: String
    var age: Int
    var photos: [URL]
    var prompts: [Prompt]
    var letterboxdUsername: String
    var watchlist: [Film]

    struct Prompt: Codable {
        let question: String
        let answer: String
    }
}
